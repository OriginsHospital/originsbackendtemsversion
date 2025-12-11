const express = require("express");
const NotificationsController = require("../controllers/notificationsController");
const { asyncHandler } = require("../middlewares/errorHandlers");
const {
  checkActiveSession,
  tokenVerified
} = require("../middlewares/authMiddlewares");

class NotificationsRoute {
  _route = express.Router();
  constructor() {
    this.intializeRoutes();
  }

  async intializeRoutes() {
    this._route.get(
      "/notifications",
      checkActiveSession,
      tokenVerified,
      this.getNotificationsRoute
    );

    this._route.get(
      "/notifications/unread/count",
      checkActiveSession,
      tokenVerified,
      this.getUnreadNotificationsCountRoute
    );

    this._route.put(
      "/notifications/:notificationId/read",
      checkActiveSession,
      tokenVerified,
      this.markNotificationAsReadRoute
    );

    this._route.put(
      "/notifications/read-all",
      checkActiveSession,
      tokenVerified,
      this.markAllNotificationsAsReadRoute
    );
  }

  getNotificationsRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new NotificationsController(req, res, next);
    await controllerObj.getNotificationsHandler();
  });

  getUnreadNotificationsCountRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new NotificationsController(req, res, next);
    await controllerObj.getUnreadNotificationsCountHandler();
  });

  markNotificationAsReadRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new NotificationsController(req, res, next);
    await controllerObj.markNotificationAsReadHandler();
  });

  markAllNotificationsAsReadRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new NotificationsController(req, res, next);
    await controllerObj.markAllNotificationsAsReadHandler();
  });
}

module.exports = NotificationsRoute;

