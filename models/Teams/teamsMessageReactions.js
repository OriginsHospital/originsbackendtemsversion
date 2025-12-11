const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const TeamsMessageReactions = MySqlConnection._instance.define(
  "teamsMessageReactions",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    messageId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    reaction: {
      type: Sequelize.DataTypes.STRING(10),
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "teams_message_reactions",
    indexes: [
      {
        unique: true,
        fields: ["messageId", "userId", "reaction"]
      }
    ]
  }
);

module.exports = TeamsMessageReactions;

