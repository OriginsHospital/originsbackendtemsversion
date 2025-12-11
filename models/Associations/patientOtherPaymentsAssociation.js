const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const PatientOtherPaymentsAssociation = MySqlConnection._instance.define(
  "PatientOtherPaymentsAssociationModel",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    patientId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    billingCategory: {
      type: Sequelize.DataTypes.STRING(100),
      allowNull: true // Temporarily allow null for backward compatibility
    },
    appointmentReason: {
      type: Sequelize.DataTypes.STRING(100),
      allowNull: true // Keep for backward compatibility during migration
    },
    amount: {
      type: Sequelize.DataTypes.STRING(10),
      allowNull: false
    },
    notes: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    updatedBy: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  },
  {
    tableName: "patient_other_payment_associations"
  }
);

module.exports = PatientOtherPaymentsAssociation;
