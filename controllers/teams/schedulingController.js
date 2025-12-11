const SchedulingService = require("../../services/teams/schedulingService");
const Constants = require("../../constants/constants");

class SchedulingController {
  constructor(request, response, next) {
    this._request = request;
    this._response = response;
    this._next = next;
    this._service = new SchedulingService(request, response, next);
  }

  async getSchedulesHandler() {
    const data = await this._service.getSchedulesService();
    this._response.status(200).send({
      status: 200,
      message: Constants.SUCCESS,
      data: data,
    });
  }

  async createScheduleHandler() {
    const data = await this._service.createScheduleService();
    this._response.status(201).send({
      status: 201,
      message: "Schedule created successfully",
      data: data,
    });
  }

  async updateScheduleHandler() {
    const data = await this._service.updateScheduleService();
    this._response.status(200).send({
      status: 200,
      message: "Schedule updated successfully",
      data: data,
    });
  }

  async deleteScheduleHandler() {
    const data = await this._service.deleteScheduleService();
    this._response.status(200).send({
      status: 200,
      message: "Schedule deleted successfully",
      data: data,
    });
  }
}

module.exports = SchedulingController;

