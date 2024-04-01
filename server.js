import 'dotenv/config'

import mongoose from 'mongoose'

import server from './app.js'

process.on('uncaughtException', err => {
  console.log('uncaught exception! Shutting down...')
  console.log(err)
  process.exit(1)
})

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log('Data base connection established'))
  .catch((err) => console.log(err))

const port = process.env.PORT || 4000

server.listen(port, () => {
  console.log('listening on port ' + port)
})

process.on('unhandledRejection', err => {
  console.log('Unhandled rejection! Shutting down...')
  console.log(err)

  server.close(() => {
    process.exit(1)
  })
})

process.on('SIGTERM', () => {
  console.log('Sigterm received! Shutting down...')

  server.close(() => {
    console.log('Process terminated.')
  })
})
