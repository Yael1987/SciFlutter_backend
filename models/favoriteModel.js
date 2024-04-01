import mongoose from 'mongoose'

const favoriteSchema = mongoose.Schema({
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

const Favorite = mongoose.model('Favorite', favoriteSchema)

export default Favorite
