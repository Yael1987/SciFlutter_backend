import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['error', 'success', 'warning'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
