import mongoose from 'mongoose'

const likeSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  articleId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Article',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const Like = mongoose.model('Like', likeSchema)

export default Like
