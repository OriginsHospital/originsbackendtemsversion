const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const TeamsCalendarEventParticipants = MySqlConnection._instance.define(
  "teamsCalendarEventParticipants",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    eventId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: Sequelize.DataTypes.ENUM("invited", "accepted", "declined", "tentative"),
      allowNull: false,
      defaultValue: "invited"
    }
  },
  {
    tableName: "teams_calendar_event_participants",
    indexes: [
      {
        unique: true,
        fields: ["eventId", "userId"]
      }
    ]
  }
);

module.exports = TeamsCalendarEventParticipants;

