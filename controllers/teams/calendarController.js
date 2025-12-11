const CalendarService = require("../../services/teams/calendarService");
const Constants = require("../../constants/constants");

class CalendarController {
  constructor(request, response, next) {
    this._request = request;
    this._response = response;
    this._next = next;
    this._service = new CalendarService(request, response, next);
  }

  async getCalendarEventsHandler() {
    const data = await this._service.getCalendarEventsService();
    this._response.status(200).send({
      status: 200,
      message: Constants.SUCCESS,
      data: data,
    });
  }

  async createCalendarEventHandler() {
    const data = await this._service.createCalendarEventService();
    this._response.status(201).send({
      status: 201,
      message: "Event created successfully",
      data: data,
    });
  }

  async updateCalendarEventHandler() {
    const data = await this._service.updateCalendarEventService();
    this._response.status(200).send({
      status: 200,
      message: "Event updated successfully",
      data: data,
    });
  }

  async deleteCalendarEventHandler() {
    const data = await this._service.deleteCalendarEventService();
    this._response.status(200).send({
      status: 200,
      message: "Event deleted successfully",
      data: data,
    });
  }
}

module.exports = CalendarController;

