import FeaturesService from '../services/FeaturesService.js'
import UserService from '../services/UserService.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import BaseController from './BaseController.js'

class FeaturesController extends BaseController {
  featuresService = new FeaturesService()
  userService = new UserService()

  // Refactored
  checkAuthorFollow = catchAsync(async (req, res, next) => {
    const follow = await this.featuresService.checkAuthorFollow(req)

    this.sendResponse(res, 200, {
      message: 'Follow check completed',
      data: {
        follow
      }
    })
  })

  // Refactored
  checkArticleLike = catchAsync(async (req, res, next) => {
    const like = await this.featuresService.checkArticleLike(req)

    this.sendResponse(res, 200, {
      message: 'Like check completed',
      data: {
        like
      }
    })
  })

  // Refactored
  createFeatureDocument = (modelName) => catchAsync(async (req, res, next) => {
    if (req.user.id === req.params.id) return next(new AppError('Cannot follow yourself', 403))

    if (modelName === 'Follow') {
      const userToFollow = await this.userService.getUserById(req.params.id)

      if (userToFollow.role !== 'author') return next(new AppError('Just authors can be followed', 403))
    }

    const checkDocumentExist = await this.featuresService.checkDocumentExist(modelName, req)

    if (checkDocumentExist) return next(new AppError('This document already exist', 400))

    const message = await this.featuresService.createDocument(modelName, req)

    this.sendResponse(res, 200, {
      message
    })
  })

  // Refactored
  deleteFeatureDocument = (modelName) => catchAsync(async (req, res, next) => {
    const message = await this.featuresService.deleteDocument(modelName, req)

    this.sendResponse(res, 200, {
      message
    })
  })
}

export default new FeaturesController()
