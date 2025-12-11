const BaseService = require("../baseService");
const createError = require("http-errors");
const Constants = require("../../constants/constants");
const { TeamsCallsLogs } = require("../../models/Teams/teamsAssociations");
const UsersModel = require("../../models/Users/userModel");
const { TeamsChats, TeamsChatMembers } = require("../../models/Teams/teamsAssociations");

class CallsService extends BaseService {
  /**
   * Initiate a voice or video call
   */
  async initiateCallService() {
    const userId = this._request.userDetails?.id;
    let { callType, receiverId, chatId } = this._request.body;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    if (!callType || !["voice", "video"].includes(callType)) {
      throw new createError.BadRequest("Invalid call type. Must be 'voice' or 'video'");
    }

    // For direct calls, receiverId is required
    if (!chatId && !receiverId) {
      throw new createError.BadRequest("Either receiverId or chatId is required");
    }

    // If chatId is provided, verify user is a member
    if (chatId) {
      const isMember = await TeamsChatMembers.findOne({
        where: { chatId, userId, leftAt: null },
      });

      if (!isMember) {
        throw new createError.Forbidden("You are not a member of this chat");
      }

      // Get other members for direct chat
      const chat = await TeamsChats.findByPk(chatId, {
        include: [
          {
            model: TeamsChatMembers,
            as: "members",
            where: { leftAt: null },
            include: [
              {
                model: UsersModel,
                as: "user",
                attributes: ["id", "fullName", "email"],
              },
            ],
          },
        ],
      });

      if (!chat) {
        throw new createError.NotFound("Chat not found");
      }

      // For direct chats, find the other user
      if (chat.chatType === "direct") {
        const otherMember = chat.members.find((m) => m.userId !== userId);
        if (otherMember) {
          receiverId = otherMember.userId;
        }
      }
    }

    // Verify receiver exists
    if (receiverId) {
      const receiver = await UsersModel.findByPk(receiverId);
      if (!receiver) {
        throw new createError.NotFound("Receiver user not found");
      }
    }

    // Create call log
    const call = await TeamsCallsLogs.create({
      callType,
      callerId: userId,
      receiverId: receiverId || null,
      chatId: chatId || null,
      callStatus: "initiated",
      startTime: new Date(),
    }).catch((err) => {
      console.log("Error creating call log:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    // Fetch call with relations
    const callData = await TeamsCallsLogs.findByPk(call.id, {
      include: [
        {
          model: UsersModel,
          as: "caller",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: UsersModel,
          as: "receiver",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: TeamsChats,
          as: "chat",
        },
      ],
    });

    return callData.toJSON();
  }

  /**
   * Update call status (answered, rejected, ended, etc.)
   */
  async updateCallStatusService() {
    const userId = this._request.userDetails?.id;
    const { callId } = this._request.params;
    const { callStatus, duration } = this._request.body;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    if (!callStatus) {
      throw new createError.BadRequest("Call status is required");
    }

    const validStatuses = [
      "initiated",
      "ringing",
      "answered",
      "missed",
      "rejected",
      "ended",
      "busy",
      "failed",
    ];

    if (!validStatuses.includes(callStatus)) {
      throw new createError.BadRequest("Invalid call status");
    }

    // Find call
    const call = await TeamsCallsLogs.findByPk(callId);
    if (!call) {
      throw new createError.NotFound("Call not found");
    }

    // Verify user is part of the call
    if (call.callerId !== userId && call.receiverId !== userId) {
      throw new createError.Forbidden("You are not part of this call");
    }

    // Update call status
    const updateData = { callStatus };
    
    if (callStatus === "answered") {
      updateData.startTime = new Date();
    }
    
    if (callStatus === "ended" || callStatus === "missed" || callStatus === "rejected") {
      updateData.endTime = new Date();
      if (duration) {
        updateData.duration = duration;
      } else if (call.startTime) {
        const start = new Date(call.startTime);
        const end = new Date();
        updateData.duration = Math.floor((end - start) / 1000); // Duration in seconds
      }
    }

    await call.update(updateData).catch((err) => {
      console.log("Error updating call status:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    // Fetch updated call with relations
    const updatedCall = await TeamsCallsLogs.findByPk(callId, {
      include: [
        {
          model: UsersModel,
          as: "caller",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: UsersModel,
          as: "receiver",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    return updatedCall.toJSON();
  }

  /**
   * Get call history for a user
   */
  async getCallHistoryService() {
    const userId = this._request.userDetails?.id;
    const limit = parseInt(this._request.query.limit) || 50;
    const offset = parseInt(this._request.query.offset) || 0;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    const calls = await TeamsCallsLogs.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { callerId: userId },
          { receiverId: userId },
        ],
      },
      include: [
        {
          model: UsersModel,
          as: "caller",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: UsersModel,
          as: "receiver",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: TeamsChats,
          as: "chat",
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    }).catch((err) => {
      console.log("Error fetching call history:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return calls.map((call) => call.toJSON());
  }
}

module.exports = CallsService;

