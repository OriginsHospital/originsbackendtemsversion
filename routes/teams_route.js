const express = require("express");
const ChatsController = require("../controllers/teams/chatsController");
const MeetingsController = require("../controllers/teams/meetingsController");
const CalendarController = require("../controllers/teams/calendarController");
const SchedulingController = require("../controllers/teams/schedulingController");
const CallsController = require("../controllers/teams/callsController");
const { asyncHandler } = require("../middlewares/errorHandlers");
const {
  checkActiveSession,
  tokenVerified,
} = require("../middlewares/authMiddlewares");
const multer = require("multer");
const upload = multer();

class TeamsRoute {
  _route = express.Router();
  constructor() {
    this.intializeRoutes();
  }

  async intializeRoutes() {
    // ============ CHATS ROUTES ============
    this._route.get(
      "/chats",
      checkActiveSession,
      tokenVerified,
      this.getUserChatsRoute
    );

    this._route.post(
      "/chats",
      checkActiveSession,
      tokenVerified,
      this.createChatRoute
    );

    this._route.get(
      "/chats/:chatId/messages",
      checkActiveSession,
      tokenVerified,
      this.getChatMessagesRoute
    );

    this._route.post(
      "/chats/:chatId/messages",
      checkActiveSession,
      tokenVerified,
      (req, res, next) => {
        // Only use multer if Content-Type is multipart/form-data
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
          return upload.single("file")(req, res, next);
        }
        // For JSON requests, skip multer and continue
        next();
      },
      this.sendMessageRoute
    );

    this._route.put(
      "/chats/:chatId/messages/:messageId",
      checkActiveSession,
      tokenVerified,
      this.editMessageRoute
    );

    this._route.delete(
      "/chats/:chatId/messages/:messageId",
      checkActiveSession,
      tokenVerified,
      this.deleteMessageRoute
    );

    this._route.post(
      "/chats/:chatId/members",
      checkActiveSession,
      tokenVerified,
      this.addChatMembersRoute
    );

    this._route.delete(
      "/chats/:chatId/members/:memberId",
      checkActiveSession,
      tokenVerified,
      this.removeChatMemberRoute
    );

    // ============ MEETINGS ROUTES ============
    this._route.get(
      "/meetings",
      checkActiveSession,
      tokenVerified,
      this.getUserMeetingsRoute
    );

    this._route.post(
      "/meetings",
      checkActiveSession,
      tokenVerified,
      this.createMeetingRoute
    );

    this._route.put(
      "/meetings/:meetingId",
      checkActiveSession,
      tokenVerified,
      this.updateMeetingRoute
    );

    this._route.delete(
      "/meetings/:meetingId",
      checkActiveSession,
      tokenVerified,
      this.deleteMeetingRoute
    );

    this._route.post(
      "/meetings/:meetingId/join",
      checkActiveSession,
      tokenVerified,
      this.joinMeetingRoute
    );

    // ============ CALENDAR ROUTES ============
    this._route.get(
      "/calendar/events",
      checkActiveSession,
      tokenVerified,
      this.getCalendarEventsRoute
    );

    this._route.post(
      "/calendar/events",
      checkActiveSession,
      tokenVerified,
      this.createCalendarEventRoute
    );

    this._route.put(
      "/calendar/events/:eventId",
      checkActiveSession,
      tokenVerified,
      this.updateCalendarEventRoute
    );

    this._route.delete(
      "/calendar/events/:eventId",
      checkActiveSession,
      tokenVerified,
      this.deleteCalendarEventRoute
    );

    // ============ SCHEDULING ROUTES ============
    this._route.get(
      "/scheduling",
      checkActiveSession,
      tokenVerified,
      this.getSchedulesRoute
    );

    this._route.post(
      "/scheduling",
      checkActiveSession,
      tokenVerified,
      this.createScheduleRoute
    );

    this._route.put(
      "/scheduling/:scheduleId",
      checkActiveSession,
      tokenVerified,
      this.updateScheduleRoute
    );

    this._route.delete(
      "/scheduling/:scheduleId",
      checkActiveSession,
      tokenVerified,
      this.deleteScheduleRoute
    );

    // ============ CALLS ROUTES ============
    this._route.post(
      "/calls",
      checkActiveSession,
      tokenVerified,
      this.initiateCallRoute
    );

    this._route.put(
      "/calls/:callId/status",
      checkActiveSession,
      tokenVerified,
      this.updateCallStatusRoute
    );

    this._route.get(
      "/calls/history",
      checkActiveSession,
      tokenVerified,
      this.getCallHistoryRoute
    );
  }

  // ============ CHATS ROUTE HANDLERS ============
  getUserChatsRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new ChatsController(req, res, next);
    await controllerObj.getUserChatsHandler();
  });

  createChatRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new ChatsController(req, res, next);
    await controllerObj.createChatHandler();
  });

  getChatMessagesRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new ChatsController(req, res, next);
    await controllerObj.getChatMessagesHandler();
  });

  sendMessageRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new ChatsController(req, res, next);
    await controllerObj.sendMessageHandler();
  });

  editMessageRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new ChatsController(req, res, next);
    await controllerObj.editMessageHandler();
  });

  deleteMessageRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new ChatsController(req, res, next);
    await controllerObj.deleteMessageHandler();
  });

  addChatMembersRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new ChatsController(req, res, next);
    await controllerObj.addChatMembersHandler();
  });

  removeChatMemberRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new ChatsController(req, res, next);
    await controllerObj.removeChatMemberHandler();
  });

  // ============ MEETINGS ROUTE HANDLERS ============
  getUserMeetingsRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new MeetingsController(req, res, next);
    await controllerObj.getUserMeetingsHandler();
  });

  createMeetingRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new MeetingsController(req, res, next);
    await controllerObj.createMeetingHandler();
  });

  updateMeetingRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new MeetingsController(req, res, next);
    await controllerObj.updateMeetingHandler();
  });

  deleteMeetingRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new MeetingsController(req, res, next);
    await controllerObj.deleteMeetingHandler();
  });

  joinMeetingRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new MeetingsController(req, res, next);
    await controllerObj.joinMeetingHandler();
  });

  // ============ CALENDAR ROUTE HANDLERS ============
  getCalendarEventsRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new CalendarController(req, res, next);
    await controllerObj.getCalendarEventsHandler();
  });

  createCalendarEventRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new CalendarController(req, res, next);
    await controllerObj.createCalendarEventHandler();
  });

  updateCalendarEventRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new CalendarController(req, res, next);
    await controllerObj.updateCalendarEventHandler();
  });

  deleteCalendarEventRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new CalendarController(req, res, next);
    await controllerObj.deleteCalendarEventHandler();
  });

  // ============ SCHEDULING ROUTE HANDLERS ============
  getSchedulesRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new SchedulingController(req, res, next);
    await controllerObj.getSchedulesHandler();
  });

  createScheduleRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new SchedulingController(req, res, next);
    await controllerObj.createScheduleHandler();
  });

  updateScheduleRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new SchedulingController(req, res, next);
    await controllerObj.updateScheduleHandler();
  });

  deleteScheduleRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new SchedulingController(req, res, next);
    await controllerObj.deleteScheduleHandler();
  });

  // ============ CALLS ROUTE HANDLERS ============
  initiateCallRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new CallsController(req, res, next);
    await controllerObj.initiateCallHandler();
  });

  updateCallStatusRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new CallsController(req, res, next);
    await controllerObj.updateCallStatusHandler();
  });

  getCallHistoryRoute = asyncHandler(async (req, res, next) => {
    const controllerObj = new CallsController(req, res, next);
    await controllerObj.getCallHistoryHandler();
  });
}

module.exports = TeamsRoute;

