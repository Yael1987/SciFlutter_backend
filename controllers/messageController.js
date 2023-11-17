import { io } from "../app.js";

import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

import BaseController from "./BaseController.js";

import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const updateOneChat = (req, res) => { };
const deleteOneChat = (req, res) => { };

export {
  updateOneChat,
  deleteOneChat
}

class MessageController extends BaseController {
  sendMessage = catchAsync(async (req, res, next) => {
    let id;
    if (req.body.sender === req.params.receiverId) return next(new AppError("You cannot send a message to yourself"));

    const chatExists = await this.getDocuments(Chat, {
      filter: {users: {$all: [req.params.receiverId, req.body.sender]}},
      justFirst: true,
    });

    if (chatExists) {
      id = chatExists.id;

      chatExists.addUserToReadBy(req.body.sender);
      chatExists.removeReceiverFromReadBy(req.body.sender);
      chatExists.lastMessage(req.body.content)

      await chatExists.save();
    } else {
      const newChat = await this.createDocument(
        {
          users: [req.params.receiverId, req.body.sender],
          readBy: [req.body.sender],
          lastMessage: req.body.content
        },
        Chat
      );

      id = newChat.id;
    }

    await this.createDocument(
      {
        ...req.body,
        sender: req.body.sender,
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
    io.emit("req", "You send a request")

    // await this.getDocuments(Chat, {
    //   filter: { users: req.body.userId },
    //   sendResponse: true,
    //   res,
    //   message: "Chats received from the database",
    // });
  });

  getOneChat = catchAsync(async (req, res, next) => {
    const currentChat = await this.getDocuments(Chat, {
      filter: { _id: req.params.chatId, users: { $all: [req.body.userId] } },
      query: req.query,
      justFirst: true,
    });

    if(!currentChat) next(new AppError("Not chat found with that id for this user"))

    currentChat.addUserToReadBy(req.body.userId);
    await currentChat.save();

    await this.getDocuments(Message, {
      filter: { chatId: currentChat.id },
      query: req.query,
      sendResponse: true,
      res,
      message: "Messages received from the database",
    });
  });
}

export default new MessageController();