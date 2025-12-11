const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const TeamsCallsLogs = MySqlConnection._instance.define(
  "teamsCallsLogs",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    callType: {
      type: Sequelize.DataTypes.ENUM("voice", "video"),
      allowNull: false
    },
    callerId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    chatId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    callStatus: {
      type: Sequelize.DataTypes.ENUM("initiated", "ringing", "answered", "missed", "rejected", "ended", "busy", "failed"),
      allowNull: false,
      defaultValue: "initiated"
    },
    startTime: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    endTime: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    recordingUrl: {
      type: Sequelize.DataTypes.STRING(500),
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "teams_calls_logs"
  }
);

module.exports = TeamsCallsLogs;

