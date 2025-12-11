const BaseService = require("../baseService");
const createError = require("http-errors");
const Constants = require("../../constants/constants");
const { Sequelize, Op } = require("sequelize");
const {
  TeamsChats,
  TeamsChatMessages,
  TeamsChatMembers,
} = require("../../models/Teams/teamsAssociations");
const UsersModel = require("../../models/Users/userModel");
const lodash = require("lodash");
const { v4: uuidv4 } = require("uuid");

class ChatsService extends BaseService {
  /**
   * Get all chats for a user (direct, group, broadcast)
   */
  async getUserChatsService() {
    const userId = this._request.userDetails?.id;
    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    const limit = parseInt(this._request.query.limit) || 50;
    const offset = parseInt(this._request.query.offset) || 0;

    // Get all chats where user is a member
    const chatIds = await TeamsChatMembers.findAll({
      where: {
        userId: userId,
        leftAt: null, // Not left the chat
      },
      attributes: ["chatId"],
    }).catch((err) => {
      console.log("Error fetching user chat IDs:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    const chatIdList = chatIds.map((cm) => cm.chatId);

    if (chatIdList.length === 0) {
      return [];
    }

    // Get chats with last message info
    const chats = await TeamsChats.findAll({
      where: {
        id: { [Op.in]: chatIdList },
        isArchived: false,
      },
      include: [
        {
          model: TeamsChatMessages,
          as: "messages",
          separate: true,
          limit: 1,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: UsersModel,
              as: "sender",
              attributes: ["id", "fullName", "email"],
            },
          ],
        },
        {
          model: TeamsChatMembers,
          as: "members",
          where: {
            userId: { [Op.ne]: userId }, // Get other members
          },
          required: false,
          include: [
            {
              model: UsersModel,
              as: "user",
              attributes: ["id", "fullName", "email"],
            },
          ],
        },
      ],
      order: [["lastMessageAt", "DESC"]],
      limit: limit,
      offset: offset,
    }).catch((err) => {
      console.log("Error fetching user chats:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    // Get unread counts for each chat
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const lastRead = await TeamsChatMembers.findOne({
          where: { chatId: chat.id, userId: userId },
          attributes: ["lastReadAt"],
        });

        const unreadCount = await TeamsChatMessages.count({
          where: {
            chatId: chat.id,
            senderId: { [Op.ne]: userId },
            isDeleted: false,
            ...(lastRead?.lastReadAt
              ? { createdAt: { [Op.gt]: lastRead.lastReadAt } }
              : {}),
          },
        });

        const chatData = chat.toJSON();
        chatData.unreadCount = unreadCount;

        // For direct chats, get the other user's info
        if (chat.chatType === "direct" && chat.members?.length > 0) {
          chatData.otherUser = chat.members[0].user;
          chatData.name = chatData.otherUser?.fullName || "Unknown";
        }

        return chatData;
      })
    );

    return chatsWithUnread;
  }

  /**
   * Create a new chat (direct or group)
   */
  async createChatService() {
    const userId = this._request.userDetails?.id;
    const { chatType, name, description, memberIds, avatarUrl } =
      this._request.body;

    console.log("createChatService - Request body:", {
      chatType,
      memberIds,
      userId,
    });

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    if (!chatType || !["direct", "group", "broadcast"].includes(chatType)) {
      throw new createError.BadRequest("Invalid chat type");
    }

    // For direct chat, ensure exactly 1 other member
    if (chatType === "direct") {
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length !== 1) {
        throw new createError.BadRequest(
          "Direct chat requires exactly one other member"
        );
      }

      const otherUserId = memberIds[0];
      
      // Validate that the other user is not the same as current user
      if (otherUserId === userId) {
        throw new createError.BadRequest(
          "Cannot create a direct chat with yourself"
        );
      }

      // Validate that the other user exists
      const otherUser = await UsersModel.findByPk(otherUserId).catch((err) => {
        console.log("Error checking user existence:", err);
        return null;
      });

      if (!otherUser) {
        throw new createError.BadRequest("The selected user does not exist");
      }

      // Check if direct chat already exists
      let existingChat = null;
      try {
        existingChat = await this.findDirectChat(userId, otherUserId);
      } catch (err) {
        console.log("Error finding existing chat:", err);
        // Continue to create new chat if error occurs
      }
      
      if (existingChat) {
        // Return the existing chat in the same format as getUserChats
        const existingChatData = existingChat.toJSON ? existingChat.toJSON() : existingChat;
        if (existingChat.members?.length > 0) {
          const otherMember = existingChat.members.find(
            (m) => m.userId !== userId
          );
          if (otherMember) {
            existingChatData.otherUser = otherMember.user || otherMember.user?.toJSON ? otherMember.user.toJSON() : null;
            existingChatData.name = existingChatData.otherUser?.fullName || "Unknown";
          }
        }
        existingChatData.unreadCount = 0;
        return existingChatData;
      }
    }

    // For group/broadcast, require name and at least one member
    if (chatType !== "direct") {
      if (!name) {
        throw new createError.BadRequest("Group name is required");
      }
      if (!memberIds || memberIds.length === 0) {
        throw new createError.BadRequest("At least one member is required");
      }
    }

    return await this.mysqlConnection.transaction(async (t) => {
      // Create chat
      const chat = await TeamsChats.create(
        {
          chatType: chatType,
          name: chatType === "direct" ? null : name,
          description: description || null,
          createdBy: userId,
          avatarUrl: avatarUrl || null,
        },
        { transaction: t }
      ).catch((err) => {
        console.log("Error creating chat:", err);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });

      // Add members
      const membersToAdd = [userId, ...(memberIds || [])];
      const uniqueMembers = [...new Set(membersToAdd)];

      const memberRoles = uniqueMembers.map((memberId, index) => ({
        chatId: chat.id,
        userId: memberId,
        role:
          memberId === userId
            ? "admin"
            : chatType === "broadcast"
            ? "viewer"
            : "member",
      }));

      await TeamsChatMembers.bulkCreate(memberRoles, {
        transaction: t,
      }).catch((err) => {
        console.log("Error adding chat members:", err);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });

      // Fetch created chat with members
      const createdChat = await TeamsChats.findByPk(chat.id, {
        include: [
          {
            model: TeamsChatMembers,
            as: "members",
            include: [
              {
                model: UsersModel,
                as: "user",
                attributes: ["id", "fullName", "email"],
              },
            ],
          },
        ],
        transaction: t,
      });

      return createdChat.toJSON();
    });
  }

  /**
   * Find existing direct chat between two users
   */
  async findDirectChat(userId1, userId2) {
    try {
      const chats = await TeamsChats.findAll({
        where: { chatType: "direct" },
        include: [
          {
            model: TeamsChatMembers,
            as: "members",
            where: {
              userId: { [Op.in]: [userId1, userId2] },
              leftAt: null,
            },
            include: [
              {
                model: UsersModel,
                as: "user",
                attributes: ["id", "fullName", "email"],
              },
            ],
          },
        ],
      }).catch((err) => {
        console.log("Error finding direct chat:", err);
        return [];
      });

      // Find chat that has both users as members
      for (const chat of chats) {
        const memberIds = chat.members.map((m) => m.userId);
        if (memberIds.includes(userId1) && memberIds.includes(userId2)) {
          return chat;
        }
      }

      return null;
    } catch (error) {
      console.log("Error in findDirectChat:", error);
      return null;
    }
  }

  /**
   * Get chat messages
   */
  async getChatMessagesService() {
    const userId = this._request.userDetails?.id;
    const { chatId } = this._request.params;
    const limit = parseInt(this._request.query.limit) || 50;
    const offset = parseInt(this._request.query.offset) || 0;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    // Verify user is member of chat
    const isMember = await TeamsChatMembers.findOne({
      where: { chatId: chatId, userId: userId, leftAt: null },
    });

    if (!isMember) {
      throw new createError.Forbidden("You are not a member of this chat");
    }

    // Get messages
    const messages = await TeamsChatMessages.findAll({
      where: {
        chatId: chatId,
        isDeleted: false,
      },
      include: [
        {
          model: UsersModel,
          as: "sender",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: TeamsChatMessages,
          as: "replyTo",
          include: [
            {
              model: UsersModel,
              as: "sender",
              attributes: ["id", "fullName"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
    }).catch((err) => {
      console.log("Error fetching messages:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    // Update last read timestamp
    await TeamsChatMembers.update(
      { lastReadAt: new Date() },
      { where: { chatId: chatId, userId: userId } }
    ).catch(() => {
      // Non-critical error, continue
    });

    return messages.reverse(); // Return in chronological order
  }

  /**
   * Send a message
   */
  async sendMessageService() {
    const userId = this._request.userDetails?.id;
    const { chatId } = this._request.params;
    
    // Handle both JSON and FormData requests
    let message, messageType, fileName, fileUrl, fileSize, replyToMessageId, mentions;
    
    if (this._request.body && typeof this._request.body === 'object') {
      // If body is already parsed (JSON or FormData)
      message = this._request.body.message;
      messageType = this._request.body.messageType || "text";
      fileName = this._request.body.fileName || this._request.file?.originalname;
      fileUrl = this._request.body.fileUrl;
      fileSize = this._request.body.fileSize || this._request.file?.size;
      replyToMessageId = this._request.body.replyToMessageId;
      mentions = this._request.body.mentions;
      
      // If file was uploaded via multer
      if (this._request.file) {
        fileUrl = this._request.file.path || this._request.file.location;
        fileName = this._request.file.originalname || fileName;
        fileSize = this._request.file.size || fileSize;
      }
      
      // Parse mentions if it's a string
      if (mentions && typeof mentions === 'string') {
        try {
          mentions = JSON.parse(mentions);
        } catch (e) {
          mentions = null;
        }
      }
    } else {
      // Fallback to direct body access
      ({
        message,
        messageType = "text",
        fileName,
        fileUrl,
        fileSize,
        replyToMessageId,
        mentions,
      } = this._request.body || {});
    }

    console.log("sendMessageService - Request:", {
      chatId,
      userId,
      message: message?.substring(0, 50),
      messageType,
      hasFile: !!this._request.file,
      bodyKeys: Object.keys(this._request.body || {}),
    });

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    if (!chatId) {
      throw new createError.BadRequest("Chat ID is required");
    }

    // For text messages, message is required
    if (messageType === "text" && (!message || message.trim() === "")) {
      throw new createError.BadRequest("Message content is required");
    }

    // For file messages, fileUrl or fileName is required
    if (messageType !== "text" && !fileUrl && !fileName) {
      throw new createError.BadRequest(
        "File URL or file name is required for file messages"
      );
    }

    // Verify user is member of chat
    const isMember = await TeamsChatMembers.findOne({
      where: { chatId: chatId, userId: userId, leftAt: null },
    });

    if (!isMember) {
      throw new createError.Forbidden("You are not a member of this chat");
    }

    return await this.mysqlConnection.transaction(async (t) => {
      // Create message
      const newMessage = await TeamsChatMessages.create(
        {
          chatId: chatId,
          senderId: userId,
          messageType: messageType,
          message: message || "",
          fileName: fileName || null,
          fileUrl: fileUrl || null,
          fileSize: fileSize || null,
          replyToMessageId: replyToMessageId || null,
          mentions: mentions ? JSON.stringify(mentions) : null,
          readBy: JSON.stringify([userId]), // Sender has read it
        },
        { transaction: t }
      ).catch((err) => {
        console.log("Error creating message:", err);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });

      // Update chat's lastMessageAt
      await TeamsChats.update(
        { lastMessageAt: new Date() },
        { where: { id: chatId }, transaction: t }
      ).catch(() => {
        // Non-critical error
      });

      // Fetch complete message with relations
      const completeMessage = await TeamsChatMessages.findByPk(
        newMessage.id,
        {
          include: [
            {
              model: UsersModel,
              as: "sender",
              attributes: ["id", "fullName", "email"],
            },
            {
              model: TeamsChatMessages,
              as: "replyTo",
              include: [
                {
                  model: UsersModel,
                  as: "sender",
                  attributes: ["id", "fullName"],
                },
              ],
            },
          ],
          transaction: t,
        }
      );

      return completeMessage.toJSON();
    });
  }

  /**
   * Edit a message
   */
  async editMessageService() {
    const userId = this._request.userDetails?.id;
    const { chatId, messageId } = this._request.params;
    const { message } = this._request.body;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    // Verify message belongs to user
    const existingMessage = await TeamsChatMessages.findOne({
      where: { id: messageId, senderId: userId, chatId: chatId },
    });

    if (!existingMessage) {
      throw new createError.Forbidden("You can only edit your own messages");
    }

    // Update message
    await TeamsChatMessages.update(
      {
        message: message,
        isEdited: true,
      },
      { where: { id: messageId } }
    ).catch((err) => {
      console.log("Error editing message:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true };
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessageService() {
    const userId = this._request.userDetails?.id;
    const { chatId, messageId } = this._request.params;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    // Verify message belongs to user or user is admin
    const existingMessage = await TeamsChatMessages.findOne({
      where: { id: messageId, chatId: chatId },
      include: [
        {
          model: TeamsChats,
          as: "chat",
        },
      ],
    });

    if (!existingMessage) {
      throw new createError.NotFound("Message not found");
    }

    const isMember = await TeamsChatMembers.findOne({
      where: {
        chatId: chatId,
        userId: userId,
        leftAt: null,
        role: ["admin", "member"],
      },
    });

    if (
      existingMessage.senderId !== userId &&
      isMember?.role !== "admin"
    ) {
      throw new createError.Forbidden("You cannot delete this message");
    }

    // Soft delete
    await TeamsChatMessages.update(
      { isDeleted: true },
      { where: { id: messageId } }
    ).catch((err) => {
      console.log("Error deleting message:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true };
  }

  /**
   * Add members to a group chat
   */
  async addChatMembersService() {
    const userId = this._request.userDetails?.id;
    const { chatId } = this._request.params;
    const { memberIds } = this._request.body;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      throw new createError.BadRequest("Member IDs are required");
    }

    // Verify user is admin of chat
    const isAdmin = await TeamsChatMembers.findOne({
      where: {
        chatId: chatId,
        userId: userId,
        role: "admin",
        leftAt: null,
      },
    });

    if (!isAdmin) {
      throw new createError.Forbidden(
        "Only admins can add members to a chat"
      );
    }

    // Verify chat is not direct
    const chat = await TeamsChats.findByPk(chatId);
    if (chat?.chatType === "direct") {
      throw new createError.BadRequest("Cannot add members to direct chat");
    }

    // Add members
    const membersToAdd = memberIds
      .filter((id) => id !== userId)
      .map((memberId) => ({
        chatId: chatId,
        userId: memberId,
        role: chat.chatType === "broadcast" ? "viewer" : "member",
      }));

    await TeamsChatMembers.bulkCreate(membersToAdd, {
      ignoreDuplicates: true,
    }).catch((err) => {
      console.log("Error adding members:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true, membersAdded: membersToAdd.length };
  }

  /**
   * Remove member from chat
   */
  async removeChatMemberService() {
    const userId = this._request.userDetails?.id;
    const { chatId, memberId } = this._request.params;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    // Verify user is admin or removing themselves
    const isAdmin = await TeamsChatMembers.findOne({
      where: {
        chatId: chatId,
        userId: userId,
        role: "admin",
        leftAt: null,
      },
    });

    if (!isAdmin && userId !== parseInt(memberId)) {
      throw new createError.Forbidden(
        "You can only remove yourself or be an admin"
      );
    }

    // Remove member (soft delete by setting leftAt)
    await TeamsChatMembers.update(
      { leftAt: new Date() },
      { where: { chatId: chatId, userId: memberId } }
    ).catch((err) => {
      console.log("Error removing member:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true };
  }
}

module.exports = ChatsService;

