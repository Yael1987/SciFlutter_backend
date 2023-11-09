import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import catchAsync from "../utils/catchAsync.js";
import BaseController from "./BaseController.js";

const updateOneChat = (req, res) => { };
const deleteOneChat = (req, res) => { };

export {
  updateOneChat,
  deleteOneChat
}

class MessageController extends BaseController{
  sendMessage = catchAsync(async (req, res, next) => {
    let id;
    const chatExists = await this.getDocuments(Chat, {
      filter: { users: { $all: [req.params.receiverId, req.body.sender] } }
    })

    if (chatExists.length !== 0) {
      id = chatExists[0].id;
      await this.updateDocumentById(Chat, id, { status: "unread" })
    } else {
      const newChat = await this.createDocument(
        { users: [req.params.receiverId, req.body.sender] },
        Chat
      );
      
      id = newChat.id;
    }

    await this.createDocument(
      {
        ...req.body,
        receiver: req.params.receiverId,
        chatId: id
      },
      Message,
      {
        sendResponse: true,
        res,
        message: "Message sent successfully"
      }
    )
  })

  getChats = catchAsync(async (req, res, next) => {
    await this.getDocuments(Chat, {
      filter: { users: req.body.userId },
      sendResponse: true,
      res,
      message: "Chats received from the database",
    })
  })

  getOneChat = catchAsync(async (req, res, next) => {
    await this.getDocuments(Message, {
      filter: { chatId: req.params.chatId },
      sendResponse: true,
      res,
      message: "Messages of the chat received from the database"
    })
  })
}

export default new MessageController();