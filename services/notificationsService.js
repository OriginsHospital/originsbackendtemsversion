const createError = require("http-errors");
const NotificationMaster = require("../models/Master/notificationMaster");
const MySqlConnection = require("../connections/mysql_connection");
const Constants = require("../constants/constants");
const { Sequelize } = require("sequelize");
const {
  getAdminUsersQuery,
  getNotificationsQuery,
  getUnreadNotificationsCountQuery,
  markNotificationAsReadQuery,
  markAllNotificationsAsReadQuery
} = require("../queries/notification_queries");
const UserModel = require("../models/Users/userModel");

class NotificationsService {
  constructor(request, response, next) {
    this._request = request;
    this._response = response;
    this._next = next;
    this.mysqlConnection = MySqlConnection._instance;
  }

  /**
   * Create notification for admin users when new member registers
   */
  async createNewUserRegistrationNotification(newUserId, newUserName, newUserEmail) {
    try {
      // Get all admin users
      const adminUsers = await this.mysqlConnection.query(
        getAdminUsersQuery,
        {
          type: Sequelize.QueryTypes.SELECT
        }
      ).catch(err => {
        console.log("Error while fetching admin users", err.message);
        return [];
      });

      if (!adminUsers || adminUsers.length === 0) {
        console.log("No admin users found to send notification");
        return;
      }

      // Create notification for each admin user
      const notifications = adminUsers.map(admin => ({
        userId: admin.id,
        title: "New Member Registration",
        message: `${newUserName} (${newUserEmail}) has requested to register`,
        type: "info",
        isRead: 0,
        route: `/users?pending=true&userId=${newUserId}`,
        relatedId: newUserId,
        relatedType: "user_registration"
      }));

      await NotificationMaster.bulkCreate(notifications).catch(err => {
        console.log("Error while creating notifications", err.message);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });

      return { success: true, notificationsCreated: notifications.length };
    } catch (error) {
      console.log("Error in createNewUserRegistrationNotification:", error);
      // Don't throw error - notification failure shouldn't break registration
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotificationsService() {
    const userId = this._request.userDetails?.id;
    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    const limit = parseInt(this._request.query.limit) || 50;
    const offset = parseInt(this._request.query.offset) || 0;

    const notifications = await this.mysqlConnection.query(
      getNotificationsQuery,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: {
          userId: userId,
          limit: limit,
          offset: offset
        }
      }
    ).catch(err => {
      console.log("Error while fetching notifications", err.message);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return notifications;
  }

  /**
   * Get unread notifications count
   */
  async getUnreadNotificationsCountService() {
    const userId = this._request.userDetails?.id;
    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    const result = await this.mysqlConnection.query(
      getUnreadNotificationsCountQuery,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: {
          userId: userId
        }
      }
    ).catch(err => {
      console.log("Error while fetching unread notifications count", err.message);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return result[0]?.count || 0;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsReadService() {
    const userId = this._request.userDetails?.id;
    const { notificationId } = this._request.params;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    if (!notificationId) {
      throw new createError.BadRequest(
        Constants.PARAMS_ERROR.replace("{params}", "notificationId")
      );
    }

    await this.mysqlConnection.query(
      markNotificationAsReadQuery,
      {
        type: Sequelize.QueryTypes.UPDATE,
        replacements: {
          notificationId: notificationId,
          userId: userId
        }
      }
    ).catch(err => {
      console.log("Error while marking notification as read", err.message);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true };
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsReadService() {
    const userId = this._request.userDetails?.id;

    if (!userId) {
      throw new createError.Unauthorized("User not authenticated");
    }

    await this.mysqlConnection.query(
      markAllNotificationsAsReadQuery,
      {
        type: Sequelize.QueryTypes.UPDATE,
        replacements: {
          userId: userId
        }
      }
    ).catch(err => {
      console.log("Error while marking all notifications as read", err.message);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    });

    return { success: true };
  }
}

module.exports = NotificationsService;

