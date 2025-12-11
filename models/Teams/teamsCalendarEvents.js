const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const TeamsCalendarEvents = MySqlConnection._instance.define(
  "teamsCalendarEvents",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    title: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },
    eventType: {
      type: Sequelize.DataTypes.ENUM("meeting", "task", "reminder", "shift", "appointment"),
      allowNull: false
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    startTime: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    isAllDay: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    location: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    isRecurring: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    recurrencePattern: {
      type: Sequelize.DataTypes.STRING(100),
      allowNull: true
    },
    reminderMinutes: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: Sequelize.DataTypes.ENUM("scheduled", "in-progress", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "scheduled"
    },
    priority: {
      type: Sequelize.DataTypes.ENUM("low", "medium", "high", "urgent"),
      allowNull: false,
      defaultValue: "medium"
    },
    color: {
      type: Sequelize.DataTypes.STRING(20),
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    updatedAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "teams_calendar_events"
  }
);

module.exports = TeamsCalendarEvents;

