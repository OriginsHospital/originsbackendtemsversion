const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const TeamsMeetingParticipants = MySqlConnection._instance.define(
  "teamsMeetingParticipants",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    meetingId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    role: {
      type: Sequelize.DataTypes.ENUM("organizer", "presenter", "attendee"),
      allowNull: false,
      defaultValue: "attendee"
    },
    status: {
      type: Sequelize.DataTypes.ENUM("invited", "accepted", "declined", "tentative", "joined", "left"),
      allowNull: false,
      defaultValue: "invited"
    },
    joinedAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    leftAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: "teams_meeting_participants",
    indexes: [
      {
        unique: true,
        fields: ["meetingId", "userId"]
      }
    ]
  }
);

module.exports = TeamsMeetingParticipants;

