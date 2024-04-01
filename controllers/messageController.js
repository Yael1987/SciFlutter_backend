import BaseController from './BaseController.js'

import catchAsync from '../utils/catchAsync.js'
import MessageService from '../services/MessageService.js'

class MessageController extends BaseController {
  messageService = new MessageService()

  // Refactored
  sendMessage = catchAsync(async (req, res, next) => {
    await this.messageService.sendMessage(req)

    this.sendResponse(res, 200, {
      message: 'Message sent successfully'
    })
  })

  // Refactored
  getChats = catchAsync(async (req, res, next) => {
    const data = await this.messageService.getUserChats(req.user._id)

    this.sendResponse(res, 200, {
      message: 'Chats received successfully',
      ...data
    })
  })

  // Refactored
  getOneChat = catchAsync(async (req, res, next) => {
    const data = await this.messageService.getChatMessages(req.params.chatId, req.user._id, req.query)

    this.sendResponse(res, 200, {
      message: 'Messages received from the database',
      ...data
    })
  })

  // Refactored
  unsendMessage = catchAsync(async (req, res, next) => {
    await this.messageService.unsendMessage(req.params.messageId, req.user.id)

    this.sendResponse(res, 200, {
      message: 'Message unsent'
    })
  })

  // Refactored
  deleteMessageForMe = catchAsync(async (req, res, next) => {
    await this.messageService.deleteMessageForMe(req.params.messageId, req.user.id)

    this.sendResponse(res, 200, {
      message: 'Deleted successfully'
    })
  })

  // Refactored
  clearChat = catchAsync(async (req, res, next) => {
    await this.messageService.clearChat(req.params.chatId, req.user.id)

    this.sendResponse(res, 200, {
      message: 'Chat cleared successfully'
    })
  })
}

export default new MessageController()
