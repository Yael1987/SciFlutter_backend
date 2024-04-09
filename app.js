import express from 'express'
import http from 'http'

// Middleware
import cors from 'cors'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import compression from 'compression'
import cookieParser from 'cookie-parser'

import sanitizeHtml from './utils/sanitizeHtml.js'
import filterQueryParams from './utils/filterQueryParams.js'

//  Routes
import { router as usersRoutes } from './routes/userRoutes.js'
import { router as articlesRoutes } from './routes/articleRoutes.js'
import { router as featuresRoutes } from './routes/featuresRoutes.js'
import { router as messageRoutes } from './routes/messageRoutes.js'
import { router as requestsRoutes } from './routes/requestsRoutes.js'
import { router as notificationRoutes } from './routes/notificationsRoutes.js'

//  Controllers
import { globalErrorHandler } from './controllers/ErrorController.js'
import SocketController from './controllers/SocketController.js'
import RedisController from './controllers/RedisController.js'

const app = express()
const server = http.createServer(app)

// Socket io
const io = new SocketController(server)
io.init()

// Redis
export const redisClient = new RedisController()
await redisClient.connect()

app.enable('trust proxy')
app.disable('x-powered-by')

app.set('view engine', 'pug')

app.use(helmet())

// cors config
app.use(cors({
  origin: ['https://sciflutter.vercel.app/*', 'http://localhost:*'],
  credentials: true
}))

app.options('*', cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Sanitize request
app.use(mongoSanitize())
app.use(sanitizeHtml)

// Prevent params pollution filtering the request query using a white list
app.use(filterQueryParams)

app.use(compression())

app.use('/api/v1/users', usersRoutes)
app.use('/api/v1/articles', articlesRoutes)
app.use('/api/v1/features', featuresRoutes)
app.use('/api/v1/messages', messageRoutes)
app.use('/api/v1/requests', requestsRoutes)
app.use('/api/v1/notifications', notificationRoutes)

app.all('*', (req, res, next) => {
  next(new Error('URL not found'))
})

app.use(globalErrorHandler)

export default server
