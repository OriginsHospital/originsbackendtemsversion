const NotificationsService = require("../services/notificationsService");
const Constants = require("../constants/constants");

class NotificationsController {
  constructor(request, response, next) {
    this._request = request;
    this._response = response;
    this._next = next;
    this._service = new NotificationsService(request, response, next);
  }

  async getNotificationsHandler() {
    const data = await this._service.getNotificationsService();
    this._response.status(200).send({
      status: 200,
      message: Constants.SUCCESS,
      data: data
    });
  }

  async getUnreadNotificationsCountHandler() {
    const count = await this._service.getUnreadNotificationsCountService();
    this._response.status(200).send({
      status: 200,
      message: Constants.SUCCESS,
      data: { count: count }
    });
  }

  async markNotificationAsReadHandler() {
    const data = await this._service.markNotificationAsReadService();
    this._response.status(200).send({
      status: 200,
      message: Constants.SUCCESS,
      data: data
    });
  }

  async markAllNotificationsAsReadHandler() {
    const data = await this._service.markAllNotificationsAsReadService();
    this._response.status(200).send({
      status: 200,
      message: Constants.SUCCESS,
      data: data
    });
  }
}

module.exports = NotificationsController;

