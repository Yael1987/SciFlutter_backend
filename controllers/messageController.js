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

class MessageController extends BaseController {
  sendMessage = catchAsync(async (req, res, next) => {
    let id;
    const chatExists = await this.getDocuments(Chat, {
      filter: {users: {$all: [req.params.receiverId, req.body.sender]}},
      justFirst: true,
    });

    if (chatExists) {
      id = chatExists.id;

      chatExists.addUserToReadBy(req.body.sender);
      chatExists.removeReceiverFromReadBy(req.body.sender);

      await chatExists.save();
    } else {
      const newChat = await this.createDocument(
        {
          users: [req.params.receiverId, req.body.sender],
          readBy: [req.body.sender],
        },
        Chat
      );

      id = newChat.id;
    }

    await this.createDocument(
      {
        ...req.body,
        receiver: req.params.receiverId,
        chatId: id,
      },
      Message,
      {
        sendResponse: true,
        res,
        message: "Message sent successfully",
      }
    );
  });

  getChats = catchAsync(async (req, res, next) => {
    await this.getDocuments(Chat, {
      filter: {users: req.body.userId},
      sendResponse: true,
      res,
      message: "Chats received from the database",
    });
  });

  getOneChat = catchAsync(async (req, res, next) => {
    const currentChat = await this.getDocumentById(Chat, req.params.chatId);

    currentChat.addUserToReadBy(req.body.userId);
    await currentChat.save();

    await this.getDocuments(Message, {
      filter: {chatId: currentChat.id},
      sendResponse: true,
      res,
      message: "Messages received from the database",
    });
  });
}

export default new MessageController();