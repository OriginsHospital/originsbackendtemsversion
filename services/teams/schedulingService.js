const BaseService = require("../baseService");
const createError = require("http-errors");
const Constants = require("../../constants/constants");
const { Sequelize, Op } = require("sequelize");
const { TeamsScheduling } = require("../../models/Teams/teamsAssociations");
const UsersModel = require("../../models/Users/userModel");

class SchedulingService extends BaseService {
  /**
   * Get schedules
   */
  async getSchedulesService() {
    const userId = this._request.userDetails?.id;
    const { startDate, endDate, scheduleType, assignedTo, departmentId } =
      this._request.query;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    let whereClause = {};

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

    if (scheduleType) {
      whereClause.scheduleType = scheduleType;
    }

    if (assignedTo) {
      whereClause.assignedTo = assignedTo;
    }

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const schedules = await TeamsScheduling.findAll({
      where: whereClause,
      include: [
        {
          model: UsersModel,
          as: "assignedUser",
          attributes: ["id", "fullName", "email"],
        },
      ],
      order: [["startTime", "ASC"]],
    }).catch((err) => {
      console.log("Error fetching schedules:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return schedules;
  }

  /**
   * Create schedule
   */
  async createScheduleService() {
    const userId = this._request.userDetails?.id;
    const {
      title,
      description,
      scheduleType,
      assignedTo,
      departmentId,
      startTime,
      endTime,
      isRecurring = false,
      recurrencePattern,
      priority = "medium",
    } = this._request.body;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    if (!title || !scheduleType || !startTime || !endTime) {
      throw new createError.BadRequest(
        "Title, schedule type, start time, and end time are required"
      );
    }

    const schedule = await TeamsScheduling.create({
      title,
      description: description || null,
      scheduleType,
      assignedTo: assignedTo || null,
      departmentId: departmentId || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isRecurring,
      recurrencePattern: recurrencePattern || null,
      priority,
      status: "scheduled",
    }).catch((err) => {
      console.log("Error creating schedule:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return schedule.toJSON();
  }

  /**
   * Update schedule
   */
  async updateScheduleService() {
    const userId = this._request.userDetails?.id;
    const { scheduleId } = this._request.params;
    const updateData = this._request.body;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    const allowedFields = [
      "title",
      "description",
      "assignedTo",
      "startTime",
      "endTime",
      "priority",
      "status",
    ];

    const fieldsToUpdate = {};
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        fieldsToUpdate[field] = updateData[field];
      }
    });

    await TeamsScheduling.update(fieldsToUpdate, {
      where: { id: scheduleId },
    }).catch((err) => {
      console.log("Error updating schedule:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true };
  }

  /**
   * Delete schedule
   */
  async deleteScheduleService() {
    const userId = this._request.userDetails?.id;
    const { scheduleId } = this._request.params;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    await TeamsScheduling.destroy({
      where: { id: scheduleId },
    }).catch((err) => {
      console.log("Error deleting schedule:", err);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true };
  }
}

module.exports = SchedulingService;

