const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const NotificationMaster = MySqlConnection._instance.define(
  "notificationMaster",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      comment: "User who should receive this notification"
    },
    title: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: Sequelize.DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "info",
      comment: "Notification type: info, warning, success, error"
    },
    isRead: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    route: {
      type: Sequelize.DataTypes.STRING(500),
      allowNull: true,
      comment: "Route to navigate when notification is clicked"
    },
    relatedId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      comment: "ID of related entity (e.g., userId for new user registration)"
    },
    relatedType: {
      type: Sequelize.DataTypes.STRING(100),
      allowNull: true,
      comment: "Type of related entity (e.g., 'user_registration')"
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
    tableName: "notifications_master"
  }
);

module.exports = NotificationMaster;

