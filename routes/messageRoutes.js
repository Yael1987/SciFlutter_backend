import express from 'express'
import messageController from '../controllers/messageController.js'
import { authController } from '../controllers/authController.js'

const router = express.Router()

router.use(authController.protectRoute)

router.post('/:receiverId', messageController.sendMessage)
router.patch('/updateMessage/:messageId', messageController.unsendMessage)
router.delete('/updateMessage/:messageId', messageController.deleteMessageForMe)

router.get('/', messageController.getChats)
router.patch('/:chatId', messageController.getOneChat)
router.patch('/clear/:chatId', messageController.clearChat)

export { router }
