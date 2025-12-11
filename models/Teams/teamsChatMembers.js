const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const TeamsChatMembers = MySqlConnection._instance.define(
  "teamsChatMembers",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    chatId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    role: {
      type: Sequelize.DataTypes.ENUM("admin", "member", "viewer"),
      allowNull: false,
      defaultValue: "member"
    },
    joinedAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    leftAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    lastReadAt: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    isMuted: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    isPinned: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: "teams_chat_members",
    indexes: [
      {
        unique: true,
        fields: ["chatId", "userId"]
      }
    ]
  }
);

module.exports = TeamsChatMembers;

