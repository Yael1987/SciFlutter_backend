import Chat from '../models/chatModel.js'
import Message from '../models/messageModel.js'

import BaseController from './BaseController.js'

import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import User from '../models/userModel.js'

class MessageController extends BaseController {
  sendMessage = catchAsync(async (req, res, next) => {
    const senderId = req.user.id
    const receiverId = req.params.receiverId
    let chatId

    if (senderId === receiverId) return next(new AppError('You cannot send a message to yourself', 403))

    const chatExists = await this.getDocuments(Chat, {
      filter: { users: { $all: [receiverId, senderId] } },
      query: req.query,
      justFirst: true
    })

    if (chatExists) {
      chatId = chatExists.id

      chatExists.addUserToReadBy(senderId)
      chatExists.removeReceiverFromReadBy(senderId)

      await chatExists.save()
    } else {
      const receiver = await this.getDocumentById(User, receiverId)

      if (!receiver || receiver.status === 'desactivated') return next(new AppError('The user does not exist or is desactivated', 410))

      if (req.user.role !== 'author') {
        if (receiver.role !== 'author') return next(new AppError('Just can send messages to authors', 403))
      }

      const newChat = await this.createDocument(
        {
          users: [receiverId, senderId],
          readBy: [senderId]
        },
        Chat
      )

      chatId = newChat.id
    }

    await this.createDocument(
      {
        ...req.body,
        sender: senderId,
        receiver: receiverId,
        chatId
      },
      Message,
      {
        sendResponse: true,
        res,
        message: 'Message sent successfully'
      }
    )
  })

  getChats = catchAsync(async (req, res, next) => {
    const chatsWithLastMessages = await Chat.aggregate([
      {
        $match: { users: req.user._id }
      },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$chatId', '$$chatId'] },
                hiddeFor: { $ne: req.user._id }
              }
            },
            {
              $sort: { createdAt: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: 'lastMessage'
        }
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ['$lastMessage', 0] }
        }
      },
      {
        $project: {
          users: 1,
          readBy: 1,
          readAt: 1,
          lastMessage: {
            sender: 1,
            content: 1,
            status: 1
          }
        }
      }
    ])

    const chatsFiltered = chatsWithLastMessages.filter(chat => chat.lastMessage)

    this.sendResponse(res, 200, {
      results: chatsFiltered.length,
      message: 'Chats received successfully',
      chats: chatsFiltered
    })
  })

  getOneChat = catchAsync(async (req, res, next) => {
    const searchedChat = await this.getDocuments(Chat, {
      filter: { _id: req.params.chatId, users: { $all: [req.user.id] } },
      query: req.query,
      justFirst: true
    })

    if (!searchedChat) next(new AppError('Not chat found with that id for this user', 404))

    searchedChat.addUserToReadBy(req.user.id)
    await searchedChat.save()

    await this.getDocuments(Message, {
      filter: { chatId: searchedChat.id, hiddeFor: { $ne: req.user.id } },
      query: req.query,
      sendResponse: true,
      res,
      message: 'Messages received from the database'
    })
  })

  unsendMessage = catchAsync(async (req, res, next) => {
    const message = await this.getDocuments(Message, {
      filter: { _id: req.params.messageId },
      query: req.query,
      justFirst: true
    })

    if (!message) return next(new AppError('Message not found', 404))

    if (message.sender.toString() !== req.user.id) return next(new AppError('You cannot unsend a message from someone else', 403))

    if (message.status === 'read') {
      message.unsend = true
      message.content = 'Envio anulado'
      await message.save()

      this.sendResponse(res, 200, {
        message: 'Message unsent'
      })
    } else {
      this.deleteDocumentById(Message, message.id, {
        sendResponse: true,
        res,
        message: 'Message unsent'
      })
    }
  })

  deleteMessageForMe = catchAsync(async (req, res, next) => {
    const message = await this.getDocumentById(Message, req.params.messageId)
    if (!message) return next(new AppError('No message found', 404))

    const chat = await this.getDocumentById(Chat, message.chatId)

    message.hiddeMessageToUser(req.user.id)
    await message.save()

    await this.deleteDocuments(Message, { hiddeFor: { $all: chat.users } })

    this.sendResponse(res, 200, {
      message: 'Deleted successfully'
    })
  })

  clearChat = catchAsync(async (req, res, next) => {
    const chat = await this.getDocumentById(Chat, req.params.chatId)

    if (!chat) return next(new AppError('Chat not found', 404))

    if (!chat.users.includes(req.user.id)) return next(new AppError('You cannot clear a chat for someone else', 403))

    await Message.updateMany(
      { chatId: req.params.chatId },
      { $addToSet: { hiddeFor: req.user.id } }
    )

    await this.deleteDocuments(Message, { hiddeFor: { $all: chat.users } })

    const messages = await this.getDocuments(Message, { filter: { chatId: chat.id }, query: req.query })

    if (messages.length === 0) {
      await this.deleteDocumentById(Chat, chat.id)
    }

    this.sendResponse(res, 200, {
      message: 'Chat cleared successfully'
    })
  })
}

export default new MessageController()
