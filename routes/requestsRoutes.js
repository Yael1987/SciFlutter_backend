import express from 'express'
import { authController } from '../controllers/AuthController.js'
import requestController from '../controllers/RequestController.js'

const router = express.Router()

router.use(authController.protectRoute)

router.get('/', authController.restrictTo('admin'), requestController.getRequests)
router.get('/:id', authController.restrictTo('admin'), requestController.getRequestById)

router.patch('/:id/approve-publish', authController.restrictTo('admin'), requestController.acceptPublishRequest)
router.patch('/:id/reject-publish', authController.restrictTo('admin'), requestController.rejectPublishRequest)

export { router }
