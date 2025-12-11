const MeetingsService = require("../../services/teams/meetingsService");
const Constants = require("../../constants/constants");

class MeetingsController {
  constructor(request, response, next) {
    this._request = request;
    this._response = response;
    this._next = next;
    this._service = new MeetingsService(request, response, next);
  }

  async getUserMeetingsHandler() {
    const data = await this._service.getUserMeetingsService();
    this._response.status(200).send({
      status: 200,
      message: Constants.SUCCESS,
      data: data,
    });
  }

  async createMeetingHandler() {
    const data = await this._service.createMeetingService();
    this._response.status(201).send({
      status: 201,
      message: "Meeting created successfully",
      data: data,
    });
  }

  async updateMeetingHandler() {
    const data = await this._service.updateMeetingService();
    this._response.status(200).send({
      status: 200,
      message: "Meeting updated successfully",
      data: data,
    });
  }

  async joinMeetingHandler() {
    const data = await this._service.joinMeetingService();
    this._response.status(200).send({
      status: 200,
      message: "Joined meeting successfully",
      data: data,
    });
  }
}

module.exports = MeetingsController;

