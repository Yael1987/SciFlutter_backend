import express from 'express'
import { authController } from '../controllers/AuthController.js'
import notificationController from '../controllers/NotificationController.js'

const router = express.Router()

router.use(authController.protectRoute)

router.get('/', notificationController.getUserNotifications)
router.patch('/', notificationController.readNotifications)
router.delete('/', notificationController.clearNotifications)

export {
  router
}
