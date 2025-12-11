const Joi = require("@hapi/joi");

const createHysteroscopyReportSchema = Joi.object({
  visitId: Joi.number().integer().required(),
  // Allow either internal numeric ID or external patient code string
  patientId: Joi.alternatives()
    .try(Joi.number().integer(), Joi.string())
    .required(),
  branchLocation: Joi.string().valid("Khammam", "Hanmkonda", "Hyderabad", "Sathupalli").required(),
  clinicalDiagnosis: Joi.string().allow("").optional(),
  lmpDate: Joi.date().iso().allow(null).optional(),
  dayOfCycle: Joi.string().allow("").optional(),
  admissionDate: Joi.date().iso().required(),
  procedureDate: Joi.date().iso().required(),
  dischargeDate: Joi.date().iso().required(),
  gynaecologistName: Joi.string().required(),
  staffNurseName: Joi.string().required(),
  anesthetistName: Joi.string().required(),
  otAssistantName: Joi.string().required(),
  procedure: Joi.string().required(),
  indications: Joi.array().items(Joi.string()).optional(),
  chiefComplaints: Joi.string().allow("").optional(),
  intraOpFindings: Joi.string().allow("").optional(),
  distentionMedium: Joi.string().valid("Normal Saline", "Glycine").default("Normal Saline"),
  courseInHospital: Joi.string().allow("").optional(),
  postOpInstructions: Joi.string().allow("").optional(),
  followUp: Joi.string().allow("").optional(),
  imageUrls: Joi.array().items(Joi.string()).optional()
}).custom((value, helpers) => {
  // Validate dischargeDate >= procedureDate
  if (value.dischargeDate && value.procedureDate) {
    const discharge = new Date(value.dischargeDate);
    const procedure = new Date(value.procedureDate);
    if (discharge < procedure) {
      return helpers.error("date.invalid", {
        message: "Discharge Date must be greater than or equal to Procedure Date"
      });
    }
  }
  return value;
});

const updateHysteroscopyReportSchema = createHysteroscopyReportSchema.keys({
  id: Joi.number().integer().required(),
  // For update we don't actually use patientId / visitId in the service, so keep them optional
  patientId: Joi.alternatives()
    .try(Joi.number().integer(), Joi.string())
    .optional(),
  visitId: Joi.number().integer().optional()
});

const getHysteroscopyReportSchema = Joi.object({
  patientId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
  visitId: Joi.number().integer().optional()
});

module.exports = {
  createHysteroscopyReportSchema,
  updateHysteroscopyReportSchema,
  getHysteroscopyReportSchema
};

