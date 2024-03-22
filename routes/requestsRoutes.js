import express from 'express'
import { authController } from '../controllers/authController.js'
import requestController from '../controllers/requestController.js'

const router = express.Router()

router.use(authController.protectRoute)

router.get('/', authController.restrictTo('admin'), requestController.getRequests)

export { router }
