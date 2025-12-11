const ChatsService = require("../../services/teams/chatsService");
const Constants = require("../../constants/constants");

class ChatsController {
  constructor(request, response, next) {
    this._request = request;
    this._response = response;
    this._next = next;
    this._service = new ChatsService(request, response, next);
  }

  async getUserChatsHandler() {
    const data = await this._service.getUserChatsService();
    this._response.status(200).send({
      status: 200,
      message: Constants.SUCCESS,
      data: data,
    });
  }

  async createChatHandler() {
    try {
      const data = await this._service.createChatService();
      this._response.status(201).send({
        status: 201,
        message: "Chat created successfully",
        data: data,
      });
    } catch (error) {
      console.log("Error in createChatHandler:", error);
      throw error;
    }
  }

  async getChatMessagesHandler() {
    const data = await this._service.getChatMessagesService();
    this._response.status(200).send({
      status: 200,
      message: Constants.SUCCESS,
      data: data,
    });
  }

  async sendMessageHandler() {
    const data = await this._service.sendMessageService();
    this._response.status(201).send({
      status: 201,
      message: "Message sent successfully",
      data: data,
    });
  }

  async editMessageHandler() {
    const data = await this._service.editMessageService();
    this._response.status(200).send({
      status: 200,
      message: "Message updated successfully",
      data: data,
    });
  }

  async deleteMessageHandler() {
    const data = await this._service.deleteMessageService();
    this._response.status(200).send({
      status: 200,
      message: "Message deleted successfully",
      data: data,
    });
  }

  async addChatMembersHandler() {
    const data = await this._service.addChatMembersService();
    this._response.status(200).send({
      status: 200,
      message: "Members added successfully",
      data: data,
    });
  }

  async removeChatMemberHandler() {
    const data = await this._service.removeChatMemberService();
    this._response.status(200).send({
      status: 200,
      message: "Member removed successfully",
      data: data,
    });
  }
}

module.exports = ChatsController;

