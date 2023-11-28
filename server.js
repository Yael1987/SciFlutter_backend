import 'dotenv/config'

import mongoose from 'mongoose'

import server from './app.js'

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log('Data base connection established'))
  .catch((err) => console.log(err))

const port = process.env.PORT || 4000

server.listen(port, () => {
  console.log('listening on port ' + port)
})
