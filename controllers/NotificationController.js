import NotificationService from '../services/NotificationService.js'
import catchAsync from '../utils/catchAsync.js'
import BaseController from './BaseController.js'

class NotificationController extends BaseController {
  notificationService = new NotificationService()

  getUserNotifications = catchAsync(async (req, res, next) => {
    const data = await this.notificationService.getNotifications(req.query, req.user.id)

    this.sendResponse(res, 200, {
      message: 'Notifications received',
      ...data
    })
  })

  readNotifications = catchAsync(async (req, res, next) => {
    await this.notificationService.readNotifications(req.user.id)

    this.sendResponse(res, 200, {
      message: 'Notifications readed'
    })
  })

  clearNotifications = catchAsync(async (req, res, next) => {
    await this.notificationService.clearNotifications(req.user.id)

    this.sendResponse(res, 200, {
      message: 'Notifications deleted'
    })
  })
}

export default new NotificationController()
