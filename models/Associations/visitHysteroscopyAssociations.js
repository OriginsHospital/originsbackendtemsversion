const Sequelize = require("sequelize");
const MySqlConnection = require("../../connections/mysql_connection");

const VisitHysteroscopyAssociations = MySqlConnection._instance.define(
  "VisitHysteroscopyAssociations",
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
    visitId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    formType: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    clinicalDiagnosis: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    lmp: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    dayOfCycle: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    admissionDate: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    procedureDate: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    dischargeDate: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    procedureType: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    hospitalBranch: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    gynecologist: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    assistant: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    anesthesiaType: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    anesthetist: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    otAssistant: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    diagnosis: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    distensionMedia: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    entry: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    uterus: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    endometrialThickness: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    operativeFindings: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    intraopComplications: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    postopCourse: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    reviewOn: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    },
    dischargeMedications: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    consultantName: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true
    },
    indications: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of selected indications"
    },
    chiefComplaints: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },
    intraOpFindings: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },
    courseInHospital: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },
    postOpInstructions: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },
    followUp: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    },
    imageUrls: {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array of uploaded image URLs"
    },
    createdBy: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    updatedBy: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: "visit_hysteroscopy_associations",
    timestamps: true
  }
);

module.exports = VisitHysteroscopyAssociations;
