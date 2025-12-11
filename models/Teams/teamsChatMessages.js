const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const TeamsChatMessages = MySqlConnection._instance.define(
  "teamsChatMessages",
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
    senderId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    messageType: {
      type: Sequelize.DataTypes.ENUM("text", "image", "video", "file", "voice", "system"),
      allowNull: false,
      defaultValue: "text"
    },
    message: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: false
    },
    fileName: {
      type: Sequelize.DataTypes.STRING(500),
      allowNull: true
    },
    fileUrl: {
      type: Sequelize.DataTypes.STRING(500),
      allowNull: true
    },
    fileSize: {
      type: Sequelize.DataTypes.BIGINT,
      allowNull: true
    },
    replyToMessageId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    isEdited: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    isDeleted: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    isPinned: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    mentions: {
      type: Sequelize.DataTypes.JSON,
      allowNull: true
    },
    readBy: {
      type: Sequelize.DataTypes.JSON,
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
    tableName: "teams_chat_messages"
  }
);

module.exports = TeamsChatMessages;

