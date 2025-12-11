const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const TeamsMeetings = MySqlConnection._instance.define(
  "teamsMeetings",
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
    organizerId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    meetingType: {
      type: Sequelize.DataTypes.ENUM("instant", "scheduled", "recurring"),
      allowNull: false,
      defaultValue: "scheduled"
    },
    startTime: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    meetingLink: {
      type: Sequelize.DataTypes.STRING(500),
      allowNull: true
    },
    meetingId: {
      type: Sequelize.DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: Sequelize.DataTypes.ENUM("scheduled", "ongoing", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "scheduled"
    },
    isRecording: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    password: {
      type: Sequelize.DataTypes.STRING(50),
      allowNull: true
    },
    agenda: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    maxParticipants: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
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
    tableName: "teams_meetings"
  }
);

module.exports = TeamsMeetings;

