import mongoose from 'mongoose'

const articleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'An article must have a name'],
    minLength: [10, 'The name of the article is too short, please provide other name'],
    maxLength: [100, 'The name of the article is too long, please provide a name with a maximum length of 30 characters'],
    trim: true
  },
  image: {
    type: String,
    default: '/img/default-article.png'
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'An article have to be published by one author']
  },
  resume: {
    type: String,
    required: [true, 'Please provide a resume and a introduction for your article'],
    minLength: [200, 'Your resume and introduction are too short please try again with at least 200 characters']
  },
  introduction: {
    type: String,
    required: [true, 'An article can be published without introduction'],
    minLength: [200, 'Your article is too short please try again with at least 200 characters']
  },
  discipline: {
    type: String,
    trim: true,
    lowerCase: true
  },
  content: {
    type: String,
    required: [true, 'An article can be published without content'],
    minLength: [200, 'Your article is too short please try again with at least 200 characters']
  },
  bibliography: {
    type: String,
    required: [true, 'An article must have a bibliography']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  status: {
    type: String,
    default: 'requested',
    enum: ['requested', 'published']
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// articleSchema.virtual('likes', {
//   ref: 'Like',
//   foreignField: 'articleId',
//   localField: '_id',
//   count: true
// })

articleSchema.pre('find', function (next) {
  this.find({ status: { $ne: 'requested' } })

  next()
})

articleSchema.pre('findById', function (next) {
  this.find({ status: { $ne: 'requested' } })

  next()
})

articleSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: 'name lastName photos.profile'
  })

  next()
})

articleSchema.pre('find', function (next) {
  this.select('-introduction -bibliography -content -status -likes')

  next()
})

const Article = mongoose.model('Article', articleSchema)

export default Article
