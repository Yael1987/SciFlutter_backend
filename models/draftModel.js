import mongoose from 'mongoose'

const draftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'An article must have a name'],
    minLength: [10, 'The name of the article is too short, please provide other name'],
    maxLength: [100, 'The name of the article is too long, please provide a name with a maximum length of 30 characters'],
    trim: true,
    unique: true
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'An article have to be published by one author']
  },
  image: {
    type: String,
    default: '/img/default-article.png'
  },
  requested: {
    type: Boolean,
    default: false
  },
  resume: String,
  introduction: String,
  discipline: String,
  content: String,
  bibliography: String,
  createdAt: {
    type: Date,
    default: Date.now()
  },
  images: [
    {
      type: String
    }
  ]
})

const Draft = mongoose.model('Draft', draftSchema)

export default Draft
