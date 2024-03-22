import Favorite from '../models/favoriteModel.js'
import Follow from '../models/followModel.js'
import Like from '../models/likeModel.js'
import User from '../models/userModel.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import BaseController from './BaseController.js'

const saveAsPdf = (req, res) => { }

export {
  saveAsPdf
}

class FeaturesController extends BaseController {
  checkAuthorFollow = catchAsync(async (req, res, next) => {
    const data = {}
    const follow = await Follow.find({ authorId: req.params.authorId, userId: req.user.id })

    if (!follow.length) data.follow = false
    else data.follow = true

    this.sendResponse(res, 200, {
      message: 'Follow check completed',
      data
    })
  })

  checkArticleLike = catchAsync(async (req, res, next) => {
    const data = {}

    const like = await Like.find({ articleId: req.params.articleId, userId: req.user.id })

    if (!like.length) data.like = false
    else data.like = true

    this.sendResponse(res, 200, {
      message: 'Like check completed',
      data
    })
  })

  createFeatureDocument = (modelName) => catchAsync(async (req, res, next) => {
    if (req.user.id === req.params.id) return next(new AppError('Cannot follow yourself', 403))

    if (modelName === 'Follow') {
      const userToFollow = await this.getDocumentById(User, req.params.id)

      if (userToFollow.role !== 'author') return next(new AppError('Just authors can be followed', 403))
    }

    let checkDocumentExist

    switch (modelName) {
      case 'Follow':
        checkDocumentExist = await Follow.findOne({ userId: req.user._id, authorId: req.params.id })
        break
      case 'Like':
        checkDocumentExist = await Like.findOne({ userId: req.user._id, articleId: req.params.id })
        break
      case 'Favorite':
        checkDocumentExist = await Favorite.findOne({ userId: req.user._id, articleId: req.params.id })
        break
    }

    if (checkDocumentExist) return next(new AppError('This document already exist', 400))

    const documentData = { userId: req.user.id }
    let model
    let message

    const features = {
      Favorite () {
        documentData.articleId = req.params.id
        model = Favorite
        message = 'Article added to favorites'
      },
      Follow () {
        documentData.authorId = req.params.id
        model = Follow
        message = 'Now you are following this author'
      },
      Like () {
        documentData.articleId = req.params.id
        model = Like
        message = 'Article liked'
      }
    }

    features[modelName]()

    if (!model) return next(new AppError('No such model found with that name', 404))

    await this.createDocument(documentData, model)

    this.sendResponse(res, 200, {
      message
    })
  })

  deleteFeatureDocument = (modelName) => catchAsync(async (req, res, next) => {
    const filter = { userId: req.user._id }
    let model
    let message

    const features = {
      Favorite () {
        filter.articleId = req.params.id
        model = Favorite
        message = 'Article deleted from favorites'
      },
      Follow () {
        filter.authorId = req.params.id
        model = Follow
        message = 'Now you are not following this author'
      },
      Like () {
        filter.articleId = req.params.id
        model = Like
        message = 'Article unliked'
      }
    }

    features[modelName]()

    if (!model) return next(new AppError('No such model found with that name', 404))

    console.log(filter)
    console.log(model)

    await this.deleteDocuments(
      model,
      filter,
      {
        sendResponse: true,
        res,
        message
      }
    )
  })
}

export default new FeaturesController()
