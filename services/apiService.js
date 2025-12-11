const { Sequelize } = require("sequelize");
const Constants = require("../constants/constants");
const createError = require("http-errors");
const fs = require("fs");
const path = require("path");
const MySqlConnection = require("../connections/mysql_connection");
const {
  getStateQuery,
  getCitiesQuery,
  getDropdownInfo,
  getBillTypeValuesQuery,
  getAllCitiesQuery,
  getBillTypeValuesByBranchQuery,
  getBillTypeValuesByBranchQueryLab,
  getBillTypeValuesByBranchQueryScan,
  getBillTypeValuesByBranchQueryItem,
  getBillTypeValuesByBranchQueryEmbryology
} = require("../queries/api_queries");
const fsPromises = require("fs").promises;
const TreatmentTypeMasterModel = require("../models/Master/treatmentTypesMaster");
const RedisConnection = require("../connections/redis_connection");

class ApiService {
  constructor(request, response, next) {
    this._request = request;
    this._response = response;
    this._next = next;
    this.mysqlConnection = MySqlConnection._instance;
  }

  async dropdownOptionsService() {
    try {
      //getData from file
      const filePath = path.join(
        __dirname,
        "..",
        "configurations",
        "dropdownOptions.json"
      );
      const rawOptions = await fsPromises.readFile(filePath, "utf8");
      const dropdownOptions = JSON.parse(rawOptions);

      const dropDownData = await this.mysqlConnection
        .query(getDropdownInfo, {
          type: Sequelize.QueryTypes.SELECT
        })
        .catch(err => {
          console.log("Error while getting state data", err.message);
          throw new createError.InternalServerError(
            Constants.SOMETHING_ERROR_OCCURRED
          );
        });

      dropDownData.map(data => {
        dropdownOptions[data.Type] = data.List;
      });

      return dropdownOptions;
    } catch (error) {
      console.error("Error while loading dropdown options:", error.message);
      throw new createError.InternalServerError(
        Constants.SOMETHING_ERROR_OCCURRED
      );
    }
  }

  async getStatesService() {
    let stateData = await this.mysqlConnection
      .query(getStateQuery, {
        type: Sequelize.QueryTypes.SELECT
      })
      .catch(err => {
        console.log("Error while getting state data", err.message);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });
    return stateData;
  }

  async getCitiesService() {
    const stateParamId = this._request.params.stateId;
    const getCitiesData = await this.mysqlConnection
      .query(getCitiesQuery, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: {
          stateId: stateParamId
        }
      })
      .catch(err => {
        console.log("Error while getting city data", err.message);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });
    return getCitiesData;
  }

  async getBillTypeValuesService() {
    const billTypeParamId = parseInt(this._request.params.billTypeId);
    const { branchId } = this._request.query;
    let query, getBillTypeValuesData;
    
    if (branchId) {
      // Use optimized queries for each bill type to avoid evaluating all UNION parts
      switch (billTypeParamId) {
        case 1:
          query = getBillTypeValuesByBranchQueryLab;
          break;
        case 2:
          query = getBillTypeValuesByBranchQueryScan;
          break;
        case 3:
          query = getBillTypeValuesByBranchQueryItem;
          break;
        case 4:
          query = getBillTypeValuesByBranchQueryEmbryology;
          break;
        default:
          query = getBillTypeValuesByBranchQuery;
      }
      
      getBillTypeValuesData = await this.mysqlConnection
        .query(query, {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            billTypeId: billTypeParamId,
            branchId: branchId
          }
        })
        .catch(err => {
          console.log("Error while getting billType values data", err.message);
          throw new createError.InternalServerError(
            Constants.SOMETHING_ERROR_OCCURRED
          );
        });
    } else {
      query = getBillTypeValuesQuery;
      getBillTypeValuesData = await this.mysqlConnection
        .query(getBillTypeValuesQuery, {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            billTypeId: billTypeParamId
          }
        })
        .catch(err => {
          console.log("Error while getting city data", err.message);
          throw new createError.InternalServerError(
            Constants.SOMETHING_ERROR_OCCURRED
          );
        });
    }

    return getBillTypeValuesData || [];
  }

  async undoIcsiService() {
    const { patientId } = this._request.params;
    const deleteTimeStampQuery = `
      DELETE from treatment_timestamps where visitId  = (
        select id from patient_visits_association pva where pva.patientId  = :patientId
      )
    `;
    //using same service to undo fet also - setting pickUp and fetDate to null
    const undoIcsiQuery = `
      UPDATE visit_packages_associations SET day1Date = NULL,pickUpDate = NULL,
    fetDate = NULL where visitId = (
	      select id from patient_visits_association pva where pva.patientId  = :patientId
      )
    `;
    await this.mysqlConnection
      .query(undoIcsiQuery, {
        type: Sequelize.QueryTypes.UPDATE,
        replacements: {
          patientId: patientId
        }
      })
      .catch(err => {
        console.log("Error while updating icsi start ", err.message);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });

    await this.mysqlConnection
      .query(deleteTimeStampQuery, {
        type: Sequelize.QueryTypes.DELETE,
        replacements: {
          patientId: patientId
        }
      })
      .catch(err => {
        console.log("Error while updating icsi delte ", err.message);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });
    return Constants.DATA_UPDATED_SUCCESS;
  }

  async getTreatmentTypeService() {
    const cacheKey = "treatment_types_cache";
    try {
      // Try to get from cache first
      const cachedData = await RedisConnection._instance.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // If not in cache, fetch from database
      const treatmentTypes = await TreatmentTypeMasterModel.findAll({
        attributes: [
          "id",
          "name",
          "isPackageExists",
          "isConsentsExists",
          "follicularSheetExists"
        ]
      }).catch(err => {
        console.log("error while fetching treatmenttype list", err);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });

      // Cache for 1 hour (3600 seconds) - master data doesn't change frequently
      await RedisConnection._instance.setex(
        cacheKey,
        3600,
        JSON.stringify(treatmentTypes)
      );

      return treatmentTypes;
    } catch (err) {
      // If Redis fails, fallback to database query
      if (err.code !== "ECONNREFUSED" && !err.message.includes("Redis")) {
        throw err;
      }
      console.log("Redis unavailable, fetching from database directly");
      return await TreatmentTypeMasterModel.findAll({
        attributes: [
          "id",
          "name",
          "isPackageExists",
          "isConsentsExists",
          "follicularSheetExists"
        ]
      }).catch(err => {
        console.log("error while fetching treatmenttype list", err);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });
    }
  }

  async getAllCitiesService() {
    return await this.mysqlConnection
      .query(getAllCitiesQuery, {
        type: Sequelize.QueryTypes.SELECT
      })
      .catch(err => {
        console.log("Error while getting all cities", err.message);
        throw new createError.InternalServerError(
          Constants.SOMETHING_ERROR_OCCURRED
        );
      });
  }
}

module.exports = ApiService;
