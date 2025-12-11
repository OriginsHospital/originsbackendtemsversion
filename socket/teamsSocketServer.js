const { Server } = require("socket.io");

class TeamsSocketServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.connectedUsers = new Map(); // userId -> Set of socketIds (to support multiple connections per user)
    this.userSockets = new Map(); // socketId -> userId

    this.initializeSocketHandlers();
  }

  // Helper method to check if a user is online (in their room)
  async isUserOnline(userId) {
    const roomName = `user:${userId}`;
    const sockets = await this.io.in(roomName).fetchSockets();
    return sockets.length > 0;
  }

  // Helper method to check for missed calls when user comes online
  async checkAndNotifyMissedCalls(userId, socket) {
    try {
      // Check for recent missed calls (within last 5 minutes) that haven't been notified
      const { TeamsCallsLogs } = require("../models/Teams/teamsAssociations");
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const Sequelize = require("sequelize");
      const missedCalls = await TeamsCallsLogs.findAll({
        where: {
          receiverId: userId,
          callStatus: {
            [Sequelize.Op.in]: ["initiated", "missed"],
          },
          createdAt: {
            [Sequelize.Op.gte]: fiveMinutesAgo,
          },
        },
        limit: 10,
        order: [["createdAt", "DESC"]],
      });

      if (missedCalls.length > 0) {
        socket.emit("missed_calls_notification", {
          count: missedCalls.length,
          message: `You have ${missedCalls.length} missed call(s). Check your call history.`,
        });
      }
    } catch (error) {
      // Don't block connection if check fails
      console.error("Error checking missed calls:", error.message);
    }
  }

  initializeSocketHandlers() {
    this.io.use(async (socket, next) => {
      // Authenticate socket connection
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      // Verify token and get user ID
      try {
        const JwtHelper = require("../utils/jwtUtils");
        const jwtObject = new JwtHelper();
        
        // Verify access token (same as HTTP middleware)
        const decodedData = await jwtObject.verifyAccessToken(token);
        
        if (!decodedData || !decodedData.aud) {
          console.log("Socket authentication failed: Invalid token structure");
          return next(new Error("Invalid token structure"));
        }

        // Parse user details from the audience (aud) field
        const userDetails = JSON.parse(decodedData.aud);
        
        if (userDetails && userDetails.id) {
          socket.userId = userDetails.id;
          socket.userName = userDetails.fullName || userDetails.userName || "Unknown";
          console.log(`Socket authenticated: User ${socket.userId} (${socket.userName})`);
          next();
        } else {
          console.log("Socket authentication failed: Missing user ID in token");
          next(new Error("Invalid token: Missing user ID"));
        }
      } catch (error) {
        console.error("Socket authentication error:", error.message);
        next(new Error("Authentication failed: " + error.message));
      }
    });

    this.io.on("connection", (socket) => {
      const userId = socket.userId;
      console.log(`User ${userId} connected with socket ID: ${socket.id}`);

      // Store user connection (support multiple sockets per user)
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId).add(socket.id);
      this.userSockets.set(socket.id, userId);

      // Join user's personal room for direct messages
      socket.join(`user:${userId}`);

      // Check for missed calls when user comes online (optional - user can also check call history)
      this.checkAndNotifyMissedCalls(userId, socket);

      // ============ CHAT EVENTS ============

      // Join chat room
      socket.on("join_chat", (chatId) => {
        socket.join(`chat:${chatId}`);
        socket.to(`chat:${chatId}`).emit("user_joined_chat", {
          userId,
          userName: socket.userName,
          chatId,
        });
      });

      // Leave chat room
      socket.on("leave_chat", (chatId) => {
        socket.leave(`chat:${chatId}`);
        socket.to(`chat:${chatId}`).emit("user_left_chat", {
          userId,
          userName: socket.userName,
          chatId,
        });
      });

      // Send message (broadcast to chat room)
      socket.on("send_message", (data) => {
        const { chatId, message } = data;
        socket.to(`chat:${chatId}`).emit("new_message", {
          ...message,
          chatId,
        });
      });

      // Typing indicator
      socket.on("typing_start", (data) => {
        const { chatId } = data;
        socket.to(`chat:${chatId}`).emit("user_typing", {
          userId,
          userName: socket.userName,
          chatId,
          isTyping: true,
        });
      });

      socket.on("typing_stop", (data) => {
        const { chatId } = data;
        socket.to(`chat:${chatId}`).emit("user_typing", {
          userId,
          userName: socket.userName,
          chatId,
          isTyping: false,
        });
      });

      // Message read receipt
      socket.on("message_read", (data) => {
        const { chatId, messageId } = data;
        socket.to(`chat:${chatId}`).emit("message_read_receipt", {
          userId,
          messageId,
          chatId,
        });
      });

      // ============ CALL EVENTS ============

      // Initiate call
      socket.on("initiate_call", async (data) => {
        const { receiverId, callType, chatId, callId } = data;
        
        console.log(`Call initiated: caller=${userId}, receiver=${receiverId}, callId=${callId}`);
        
        // Check if receiver is online using room check (more reliable than Map)
        const isOnline = await this.isUserOnline(receiverId);

        if (isOnline) {
          // Use user room for better reliability (works even if socket reconnects)
          this.io.to(`user:${receiverId}`).emit("incoming_call", {
            callerId: userId,
            callerName: socket.userName,
            callType,
            chatId,
            callId: callId,
          });
          
          console.log(`Incoming call sent to user:${receiverId}`);
        } else {
          // User is offline - still allow call to proceed (call is already saved in DB)
          // The receiver will see it in their call history when they come online
          console.log(`User ${receiverId} is offline - call will be visible in call history`);
          
          // Notify caller that call was initiated but receiver is offline
          socket.emit("call_initiated_offline", {
            callId: callId,
            receiverId,
            message: "Call initiated. Receiver is currently offline and will see it in call history.",
          });
        }
      });

      // Accept call
      socket.on("accept_call", async (data) => {
        const { callerId, callId } = data;
        const isOnline = await this.isUserOnline(callerId);

        console.log(`Call accepted: caller=${callerId}, receiver=${userId}, callId=${callId}`);

        if (isOnline) {
          // Use user room for better reliability
          this.io.to(`user:${callerId}`).emit("call_accepted", {
            receiverId: userId,
            receiverName: socket.userName,
            callId,
          });
          console.log(`Call accepted notification sent to user:${callerId}`);
        }
      });

      // Reject call
      socket.on("reject_call", async (data) => {
        const { callerId, callId } = data;
        const isOnline = await this.isUserOnline(callerId);

        console.log(`Call rejected: caller=${callerId}, receiver=${userId}, callId=${callId}`);

        if (isOnline) {
          // Use user room for better reliability
          this.io.to(`user:${callerId}`).emit("call_rejected", {
            receiverId: userId,
            callId,
          });
          console.log(`Call rejected notification sent to user:${callerId}`);
        }
      });

      // End call
      socket.on("end_call", async (data) => {
        const { otherUserId, callId, chatId } = data;
        const isOnline = await this.isUserOnline(otherUserId);

        console.log(`Call ended: user=${userId}, otherUser=${otherUserId}, callId=${callId}`);

        if (isOnline) {
          // Use user room for better reliability
          this.io.to(`user:${otherUserId}`).emit("call_ended", {
            userId,
            callId,
            chatId,
          });
          console.log(`Call ended notification sent to user:${otherUserId}`);
        }
      });

      // Call signaling for WebRTC
      socket.on("call_signal", async (data) => {
        const { toUserId, signal, callId } = data;
        const isOnline = await this.isUserOnline(toUserId);

        if (isOnline) {
          // Send to user room (works better than individual socket)
          this.io.to(`user:${toUserId}`).emit("call_signal", {
            fromUserId: userId,
            signal,
            callId,
          });
        }
      });

      // ============ MEETING EVENTS ============

      // Join meeting
      socket.on("join_meeting", (data) => {
        const { meetingId } = data;
        socket.join(`meeting:${meetingId}`);
        socket.to(`meeting:${meetingId}`).emit("user_joined_meeting", {
          userId,
          userName: socket.userName,
          meetingId,
        });
      });

      // Leave meeting
      socket.on("leave_meeting", (data) => {
        const { meetingId } = data;
        socket.leave(`meeting:${meetingId}`);
        socket.to(`meeting:${meetingId}`).emit("user_left_meeting", {
          userId,
          userName: socket.userName,
          meetingId,
        });
      });

      // Meeting signaling for WebRTC
      socket.on("meeting_signal", async (data) => {
        const { meetingId, toUserId, signal } = data;

        if (toUserId) {
          // Send to specific user using room (more reliable)
          const isOnline = await this.isUserOnline(toUserId);
          if (isOnline) {
            this.io.to(`user:${toUserId}`).emit("meeting_signal", {
              fromUserId: userId,
              meetingId,
              signal,
            });
          }
        } else {
          // Broadcast to all in meeting except sender
          socket.to(`meeting:${meetingId}`).emit("meeting_signal", {
            fromUserId: userId,
            meetingId,
            signal,
          });
        }
      });

      // ============ PRESENCE EVENTS ============

      // Update online status
      socket.emit("user_online", {
        userId,
        status: "online",
      });

      socket.to(`user:${userId}`).emit("presence_update", {
        userId,
        status: "online",
      });

      // Get online users
      socket.on("get_online_users", async (callback) => {
        const onlineUsers = Array.from(this.connectedUsers.keys());
        // Filter to only users who actually have active socket connections
        const verifiedOnlineUsers = [];
        for (const uid of onlineUsers) {
          if (await this.isUserOnline(uid)) {
            verifiedOnlineUsers.push(uid);
          }
        }
        callback({ onlineUsers: verifiedOnlineUsers });
      });

      // ============ DISCONNECT ============

      socket.on("disconnect", async () => {
        console.log(`User ${userId} disconnected (socket: ${socket.id})`);

        // Remove this specific socket from connected users
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          // If no more sockets for this user, remove from map
          if (userSockets.size === 0) {
            this.connectedUsers.delete(userId);
            // Notify other users only when user is completely offline
            this.io.emit("user_offline", {
              userId,
              status: "offline",
            });
          }
        }
        this.userSockets.delete(socket.id);
      });
    });
  }

  // Utility method to send notification to specific user
  async notifyUser(userId, event, data) {
    const isOnline = await this.isUserOnline(userId);
    if (isOnline) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  // Broadcast to all users in a chat
  broadcastToChat(chatId, event, data) {
    this.io.to(`chat:${chatId}`).emit(event, data);
  }

  // Broadcast to all users in a meeting
  broadcastToMeeting(meetingId, event, data) {
    this.io.to(`meeting:${meetingId}`).emit(event, data);
  }
}

module.exports = TeamsSocketServer;

