import mongoose from 'mongoose'
import Article from './articleModel.js'

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

likeSchema.statics.calcArticleLikes = async function (articleId) {
  const likes = await this.aggregate([
    {
      $match: { articleId }
    }, {
      $count: 'totalLikes'
    }
  ])[0]

  await Article.findByIdAndUpdate(articleId, {
    likes: likes?.totalLikes ?? 0
  })
}

likeSchema.post('save', function () {
  this.constructor.calcArticleLikes(this.articleId)
})

const Like = mongoose.model('Like', likeSchema)

export default Like
