import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

import cors from 'cors'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import compression from 'compression'

// Middleware
import sanitizeHtml from './utils/sanitizeHtml.js'

//  Routes
import { router as usersRoutes } from './routes/userRoutes.js'
import { router as articlesRoutes } from './routes/articleRoutes.js'
import { router as featuresRoutes } from './routes/featuresRoutes.js'
import { router as messageRoutes } from './routes/messageRoutes.js'
import { router as imagesRoutes } from './routes/imagesRoutes.js'
import { router as requestsRoutes } from './routes/requestsRoutes.js'

//  Controllers
import { globalErrorHandler } from './controllers/ErrorController.js'
import cookieParser from 'cookie-parser'

const app = express()
const server = http.createServer(app)

export const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: 'http://localhost:3000'
  }
})

io.on('connection', socket => {
  let timeout
  socket.on('join-chat', (chatId) => {
    socket.join(chatId)

    socket.to(chatId).emit('chat-open', 'El otro usuario abrio el chat')
  })

  socket.on('new-message', chatId => {
    socket.to(chatId).emit('new-message', 'You received a new message')
  })

  socket.on('chatReaded', () => {
    clearTimeout(timeout)

    timeout = setTimeout(
      () => socket.broadcast.emit('chatReaded', 'The other user has been readed your messages'),
      1000
    )
  })
})

app.enable('trust proxy')
app.disable('x-powered-by')

app.set('view engine', 'pug')

app.use(helmet())

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:*'],
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
app.use((req, res, next) => {
  const whiteList = ['author', 'createdAt', 'discipline', 'userId', 'role', 'status', 'name', 'authorId', 'article', 'user', 'id', 'type', 'limit', 'page']

  req.query = Object.keys(req.query)
    .filter(key => whiteList.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.query[key]
      return obj
    }, {})

  next()
})

app.use(compression())

app.use('/api/v1/users', usersRoutes)
app.use('/api/v1/articles', articlesRoutes)
app.use('/api/v1/features', featuresRoutes)
app.use('/api/v1/messages', messageRoutes)
app.use('/api/v1/images', imagesRoutes)
app.use('/api/v1/requests', requestsRoutes)
app.all('*', (req, res, next) => {
  next(new Error('URL not found'))
})

app.use(globalErrorHandler)

export default server
