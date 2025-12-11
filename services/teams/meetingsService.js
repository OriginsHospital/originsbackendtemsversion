const BaseService = require("../baseService");
const createError = require("http-errors");
const Constants = require("../../constants/constants");
const { Sequelize, Op } = require("sequelize");
const { TeamsMeetings } = require("../../models/Teams/teamsAssociations");
const UsersModel = require("../../models/Users/userModel");
const { v4: uuidv4 } = require("uuid");

class MeetingsService extends BaseService {
  /**
   * Get meetings for a user
   */
  async getUserMeetingsService() {
    const userId = this._request.userDetails?.id;
    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    const { startDate, endDate, status } = this._request.query;

    let whereClause = {
      [Op.or]: [
        { organizerId: userId },
        {
          "$participants.userId$": userId,
        },
      ],
    };

    if (startDate && endDate) {
      whereClause.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (status) {
      whereClause.status = status;
    }

    // Get meetings using raw query for participants
    const meetings = await this.mysqlConnection.query(
      `
      SELECT 
        tm.*,
        u.fullName as organizerName,
        u.email as organizerEmail,
        (SELECT COUNT(*) FROM teams_meeting_participants tmp 
         WHERE tmp.meetingId = tm.id) as participantCount
      FROM teams_meetings tm
      INNER JOIN users u ON u.id = tm.organizerId
      WHERE (
        tm.organizerId = :userId
        OR tm.id IN (
          SELECT meetingId FROM teams_meeting_participants 
          WHERE userId = :userId
        )
      )
      ${startDate && endDate ? "AND tm.startTime BETWEEN :startDate AND :endDate" : ""}
      ${status ? "AND tm.status = :status" : ""}
      ORDER BY tm.startTime ASC
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: {
          userId,
          startDate,
          endDate,
          status,
        },
      }
    ).catch((err) => {
      console.log("Error fetching meetings:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return meetings;
  }

  /**
   * Create a meeting
   */
  async createMeetingService() {
    const userId = this._request.userDetails?.id;
    const {
      title,
      description,
      startTime,
      endTime,
      meetingType = "scheduled",
      agenda,
      location,
      participantIds,
      password,
      maxParticipants = 100,
    } = this._request.body;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    if (!title || !startTime) {
      throw new createError.BadRequest("Title and start time are required");
    }

    const meetingId = uuidv4();
    const meetingLink = `${process.env.MEETING_BASE_URL || "https://meet.ortus.com"}/${meetingId}`;

    return await this.mysqlConnection.transaction(async (t) => {
      // Create meeting
      const meeting = await TeamsMeetings.create(
        {
          title,
          description: description || null,
          organizerId: userId,
          meetingType,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : null,
          duration: endTime
            ? Math.round((new Date(endTime) - new Date(startTime)) / 60000)
            : null,
          meetingLink,
          meetingId,
          agenda: agenda || null,
          location: location || null,
          password: password || null,
          maxParticipants,
          status: "scheduled",
        },
        { transaction: t }
      ).catch((err) => {
        console.log("Error creating meeting:", err);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });

      // Add participants
      if (participantIds && participantIds.length > 0) {
        const participants = participantIds.map((pid) => ({
          meetingId: meeting.id,
          userId: pid,
          role: pid === userId ? "organizer" : "attendee",
          status: "invited",
        }));

        // Add organizer as participant
        participants.push({
          meetingId: meeting.id,
          userId: userId,
          role: "organizer",
          status: "accepted",
        });

        await this.mysqlConnection.query(
          `
          INSERT INTO teams_meeting_participants (meetingId, userId, role, status)
          VALUES ${participants.map(() => "(?, ?, ?, ?)").join(", ")}
          `,
          {
            replacements: participants.flatMap((p) => [
              p.meetingId,
              p.userId,
              p.role,
              p.status,
            ]),
            transaction: t,
          }
        ).catch((err) => {
          console.log("Error adding participants:", err);
          throw new createError.InternalServerError(
            Constants.SOMETHING_ERROR_OCCURRED
          );
        });
      }

      // Fetch complete meeting
      const completeMeeting = await TeamsMeetings.findByPk(meeting.id, {
        include: [
          {
            model: UsersModel,
            as: "organizer",
            attributes: ["id", "fullName", "email"],
          },
        ],
        transaction: t,
      });

      return completeMeeting.toJSON();
    });
  }

  /**
   * Update meeting
   */
  async updateMeetingService() {
    const userId = this._request.userDetails?.id;
    const { meetingId } = this._request.params;
    const updateData = this._request.body;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    // Verify user is organizer
    const meeting = await TeamsMeetings.findByPk(meetingId);
    if (!meeting) {
      throw new createError.NotFound("Meeting not found");
    }

    if (meeting.organizerId !== userId) {
      throw new createError.Forbidden("Only organizer can update meeting");
    }

    // Update meeting
    const allowedFields = [
      "title",
      "description",
      "startTime",
      "endTime",
      "agenda",
      "location",
      "password",
      "status",
    ];

    const fieldsToUpdate = {};
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        fieldsToUpdate[field] = updateData[field];
      }
    });

    if (fieldsToUpdate.startTime && fieldsToUpdate.endTime) {
      fieldsToUpdate.duration = Math.round(
        (new Date(fieldsToUpdate.endTime) - new Date(fieldsToUpdate.startTime)) /
          60000
      );
    }

    await TeamsMeetings.update(fieldsToUpdate, {
      where: { id: meetingId },
    }).catch((err) => {
      console.log("Error updating meeting:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true };
  }

  /**
   * Join meeting
   */
  async joinMeetingService() {
    const userId = this._request.userDetails?.id;
    const { meetingId } = this._request.params;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    // Check if user is participant
    const participant = await this.mysqlConnection.query(
      `
      SELECT * FROM teams_meeting_participants
      WHERE meetingId = :meetingId AND userId = :userId
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { meetingId, userId },
      }
    );

    const meeting = await TeamsMeetings.findByPk(meetingId);
    if (!meeting) {
      throw new createError.NotFound("Meeting not found");
    }

    // Update participant status or add if organizer
    if (participant.length > 0) {
      await this.mysqlConnection.query(
        `
        UPDATE teams_meeting_participants
        SET status = 'joined', joinedAt = NOW()
        WHERE meetingId = :meetingId AND userId = :userId
        `,
        {
          replacements: { meetingId, userId },
        }
      );
    } else if (meeting.organizerId === userId) {
      await this.mysqlConnection.query(
        `
        INSERT INTO teams_meeting_participants (meetingId, userId, role, status, joinedAt)
        VALUES (:meetingId, :userId, 'organizer', 'joined', NOW())
        `,
        {
          replacements: { meetingId, userId },
        }
      );
    } else {
      throw new createError.Forbidden("You are not a participant of this meeting");
    }

    // Update meeting status to ongoing if it hasn't started
    if (meeting.status === "scheduled") {
      await TeamsMeetings.update(
        { status: "ongoing" },
        { where: { id: meetingId } }
      );
    }

    return { success: true, meetingLink: meeting.meetingLink };
  }
}

module.exports = MeetingsService;

