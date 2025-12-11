const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const TeamsScheduling = MySqlConnection._instance.define(
  "teamsScheduling",
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
    scheduleType: {
      type: Sequelize.DataTypes.ENUM("shift", "task", "rotation"),
      allowNull: false
    },
    assignedTo: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    departmentId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    startTime: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false
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
    priority: {
      type: Sequelize.DataTypes.ENUM("low", "medium", "high", "urgent"),
      allowNull: false,
      defaultValue: "medium"
    },
    status: {
      type: Sequelize.DataTypes.ENUM("scheduled", "in-progress", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "scheduled"
    },
    reminderSent: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
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
    tableName: "teams_scheduling"
  }
);

module.exports = TeamsScheduling;

