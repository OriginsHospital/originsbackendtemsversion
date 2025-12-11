const CallsService = require("../../services/teams/callsService");
const Constants = require("../../constants/constants");

class CallsController {
  constructor(request, response, next) {
    this._request = request;
    this._response = response;
    this._next = next;
    this._service = new CallsService(request, response, next);
  }

  async initiateCallHandler() {
    const data = await this._service.initiateCallService();
    this._response.status(201).send({
      status: 201,
      message: "Call initiated successfully",
      data: data,
    });
  }

  async updateCallStatusHandler() {
    const data = await this._service.updateCallStatusService();
    this._response.status(200).send({
      status: 200,
      message: "Call status updated successfully",
      data: data,
    });
  }

  async getCallHistoryHandler() {
    const data = await this._service.getCallHistoryService();
    this._response.status(200).send({
      status: 200,
      message: Constants.SUCCESS,
      data: data,
    });
  }
}

module.exports = CallsController;

