import { Server } from 'socket.io'
import { checkToken } from '../utils/checkToken.js'

export default class SocketController {
  constructor (server) {
    this.socket = new Server(server, {
      connectionStateRecovery: {},
      cors: {
        origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000'
      }
    })

    console.log(process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000')
  }

  init () {
    this.socket.on('connection', socket => {
      const token = socket.handshake.query['sciflutter-token']

      const [valid, id] = checkToken(token)

      if (!valid) {
        return socket.disconnect()
      }

      console.log(`Connected: ${id}`)
      socket.join(id)

      // let timeout
      socket.on('join-chat', (chatId) => {
        socket.join(chatId)

        socket.to(chatId).emit('chat-open', 'El otro usuario abrio el chat')
      })

      socket.on('new-message-s', chatId => {
        socket.to(chatId).emit('new-message-c', 'You received a new message')
      })

      // socket.on('chatReaded', () => {
      //   clearTimeout(timeout)

      //   timeout = setTimeout(
      //     () => socket.broadcast.emit('chatReaded', 'The other user has been readed your messages'),
      //     1000
      //   )
      // })

      socket.on('new-notification-s', (uid) => {
        socket.to(uid).emit('new-notification-c', 'There is a new notification')
      })
    })
  }
}
