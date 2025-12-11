const TeamsChats = require("./teamsChats");
const TeamsChatMessages = require("./teamsChatMessages");
const TeamsChatMembers = require("./teamsChatMembers");
const TeamsMeetings = require("./teamsMeetings");
const TeamsMeetingParticipants = require("./teamsMeetingParticipants");
const TeamsCalendarEvents = require("./teamsCalendarEvents");
const TeamsCalendarEventParticipants = require("./teamsCalendarEventParticipants");
const TeamsCallsLogs = require("./teamsCallsLogs");
const TeamsScheduling = require("./teamsScheduling");
const UsersModel = require("../Users/userModel");

// TeamsChats Associations
TeamsChats.hasMany(TeamsChatMessages, {
  foreignKey: "chatId",
  as: "messages"
});

TeamsChats.hasMany(TeamsChatMembers, {
  foreignKey: "chatId",
  as: "members"
});

TeamsChats.belongsTo(UsersModel, {
  foreignKey: "createdBy",
  as: "creator"
});

// TeamsChatMessages Associations
TeamsChatMessages.belongsTo(TeamsChats, {
  foreignKey: "chatId",
  as: "chat"
});

TeamsChatMessages.belongsTo(UsersModel, {
  foreignKey: "senderId",
  as: "sender"
});

TeamsChatMessages.belongsTo(TeamsChatMessages, {
  foreignKey: "replyToMessageId",
  as: "replyTo"
});

// TeamsChatMembers Associations
TeamsChatMembers.belongsTo(TeamsChats, {
  foreignKey: "chatId",
  as: "chat"
});

TeamsChatMembers.belongsTo(UsersModel, {
  foreignKey: "userId",
  as: "user"
});

// TeamsMeetings Associations
TeamsMeetings.belongsTo(UsersModel, {
  foreignKey: "organizerId",
  as: "organizer"
});

TeamsMeetings.hasMany(TeamsMeetingParticipants, {
  foreignKey: "meetingId",
  as: "participants"
});

TeamsMeetingParticipants.belongsTo(TeamsMeetings, {
  foreignKey: "meetingId",
  as: "meeting"
});

TeamsMeetingParticipants.belongsTo(UsersModel, {
  foreignKey: "userId",
  as: "user"
});

// TeamsCalendarEvents Associations
TeamsCalendarEvents.belongsTo(UsersModel, {
  foreignKey: "userId",
  as: "user"
});

TeamsCalendarEvents.hasMany(TeamsCalendarEventParticipants, {
  foreignKey: "eventId",
  as: "participants"
});

TeamsCalendarEventParticipants.belongsTo(TeamsCalendarEvents, {
  foreignKey: "eventId",
  as: "event"
});

TeamsCalendarEventParticipants.belongsTo(UsersModel, {
  foreignKey: "userId",
  as: "user"
});

// TeamsCallsLogs Associations
TeamsCallsLogs.belongsTo(UsersModel, {
  foreignKey: "callerId",
  as: "caller"
});

TeamsCallsLogs.belongsTo(UsersModel, {
  foreignKey: "receiverId",
  as: "receiver"
});

TeamsCallsLogs.belongsTo(TeamsChats, {
  foreignKey: "chatId",
  as: "chat"
});

// TeamsScheduling Associations
TeamsScheduling.belongsTo(UsersModel, {
  foreignKey: "assignedTo",
  as: "assignedUser"
});

module.exports = {
  TeamsChats,
  TeamsChatMessages,
  TeamsChatMembers,
  TeamsMeetings,
  TeamsMeetingParticipants,
  TeamsCalendarEvents,
  TeamsCalendarEventParticipants,
  TeamsCallsLogs,
  TeamsScheduling
};

