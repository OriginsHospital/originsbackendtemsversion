const BaseService = require("../baseService");
const createError = require("http-errors");
const Constants = require("../../constants/constants");
const { Sequelize, Op } = require("sequelize");
const { TeamsCalendarEvents } = require("../../models/Teams/teamsAssociations");

class CalendarService extends BaseService {
  /**
   * Get calendar events for a user
   */
  async getCalendarEventsService() {
    const userId = this._request.userDetails?.id;
    const { startDate, endDate, eventType } = this._request.query;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    let whereClause = {
      userId: userId,
    };

    if (startDate && endDate) {
      whereClause[Op.or] = [
        {
          startTime: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        {
          endTime: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
      ];
    }

    if (eventType) {
      whereClause.eventType = eventType;
    }

    const events = await TeamsCalendarEvents.findAll({
      where: whereClause,
      order: [["startTime", "ASC"]],
    }).catch((err) => {
      console.log("Error fetching calendar events:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return events;
  }

  /**
   * Create calendar event
   */
  async createCalendarEventService() {
    const userId = this._request.userDetails?.id;
    const {
      title,
      description,
      eventType,
      startTime,
      endTime,
      isAllDay = false,
      location,
      isRecurring = false,
      recurrencePattern,
      reminderMinutes,
      priority = "medium",
      color,
      participantIds,
    } = this._request.body;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    if (!title || !startTime || !eventType) {
      throw new createError.BadRequest(
        "Title, start time, and event type are required"
      );
    }

    return await this.mysqlConnection.transaction(async (t) => {
      const event = await TeamsCalendarEvents.create(
        {
          title,
          description: description || null,
          eventType,
          userId,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : null,
          isAllDay,
          location: location || null,
          isRecurring,
          recurrencePattern: recurrencePattern || null,
          reminderMinutes: reminderMinutes || null,
          priority,
          color: color || null,
          status: "scheduled",
        },
        { transaction: t }
      ).catch((err) => {
        console.log("Error creating calendar event:", err);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });

      // Add participants if provided
      if (participantIds && participantIds.length > 0) {
        const participants = participantIds.map((pid) => ({
          eventId: event.id,
          userId: pid,
          status: "invited",
        }));

        await this.mysqlConnection.query(
          `
          INSERT INTO teams_calendar_event_participants (eventId, userId, status)
          VALUES ${participants.map(() => "(?, ?, ?)").join(", ")}
          `,
          {
            replacements: participants.flatMap((p) => [
              p.eventId,
              p.userId,
              p.status,
            ]),
            transaction: t,
          }
        );
      }

      return event.toJSON();
    });
  }

  /**
   * Update calendar event
   */
  async updateCalendarEventService() {
    const userId = this._request.userDetails?.id;
    const { eventId } = this._request.params;
    const updateData = this._request.body;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    // Verify user owns the event
    const event = await TeamsCalendarEvents.findByPk(eventId);
    if (!event) {
      throw new createError.NotFound("Event not found");
    }

    if (event.userId !== userId) {
      throw new createError.Forbidden("You can only update your own events");
    }

    const allowedFields = [
      "title",
      "description",
      "startTime",
      "endTime",
      "isAllDay",
      "location",
      "priority",
      "color",
      "status",
      "reminderMinutes",
    ];

    const fieldsToUpdate = {};
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        fieldsToUpdate[field] = updateData[field];
      }
    });

    await TeamsCalendarEvents.update(fieldsToUpdate, {
      where: { id: eventId },
    }).catch((err) => {
      console.log("Error updating event:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true };
  }

  /**
   * Delete calendar event
   */
  async deleteCalendarEventService() {
    const userId = this._request.userDetails?.id;
    const { eventId } = this._request.params;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    const event = await TeamsCalendarEvents.findByPk(eventId);
    if (!event) {
      throw new createError.NotFound("Event not found");
    }

    if (event.userId !== userId) {
      throw new createError.Forbidden("You can only delete your own events");
    }

    await TeamsCalendarEvents.destroy({
      where: { id: eventId },
    }).catch((err) => {
      console.log("Error deleting event:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true };
  }
}

module.exports = CalendarService;

