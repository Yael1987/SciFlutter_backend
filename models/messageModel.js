import mongoose from 'mongoose'

const messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'A message cannot be empty']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  chatId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chat',
    required: [true, 'A message must belong to a chat']
  },
  status: {
    type: String,
    enum: ['read', 'unread'],
    default: 'unread'
  },
  hiddeFor: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  unsend: {
    type: Boolean
  },
  readAt: Date
})

messageSchema.pre('find', async function (next) {
  const chatId = this.getQuery().chatId

  if (chatId) {
    const chat = await mongoose.model('Chat').findById(chatId)

    // Elimina duplicados
    chat.readBy = chat.readBy.filter((user, index) => chat.readBy.indexOf(user) === index)
    await chat.save()

    const allUsersHaveRead = chat.users.length === chat.readBy.length

    if (allUsersHaveRead) {
      await Message.updateMany({ status: 'unread' }, { $set: { status: 'read', readAt: Date.now() } })
    }
  }

  next()
})

messageSchema.methods.hiddeMessageToUser = function (userId) {
  if (!this.hiddeFor.includes(userId)) {
    this.hiddeFor.push(userId)
  }
}

const Message = mongoose.model('Message', messageSchema)

export default Message
