const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const TeamsChats = MySqlConnection._instance.define(
  "teamsChats",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    chatType: {
      type: Sequelize.DataTypes.ENUM("direct", "group", "broadcast"),
      allowNull: false
    },
    name: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    avatarUrl: {
      type: Sequelize.DataTypes.STRING(500),
      allowNull: true
    },
    isArchived: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    lastMessageAt: {
      type: Sequelize.DataTypes.DATE,
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
    tableName: "teams_chats"
  }
);

module.exports = TeamsChats;

