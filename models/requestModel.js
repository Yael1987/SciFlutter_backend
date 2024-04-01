import mongoose from 'mongoose'

const requestSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'resolved'],
    default: 'pending',
    required: true
  },
  type: {
    type: String,
    enum: ['publish', 'ticket'],
    required: true
  },
  requester: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  },
  message: String,
  article: {
    type: mongoose.Schema.ObjectId,
    ref: 'Article'
  },
  draft: {
    type: mongoose.Schema.ObjectId,
    ref: 'Draft'
  }
})

requestSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'requester',
    select: 'name lastName'
  })

  next()
})

const Request = mongoose.model('Request', requestSchema)

export default Request
