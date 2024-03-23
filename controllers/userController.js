import mongoose from 'mongoose'
import Article from '../models/articleModel.js'
import Chat from '../models/chatModel.js'
import Draft from '../models/draftModel.js'
import Favorite from '../models/favoriteModel.js'
import Follow from '../models/followModel.js'
import Like from '../models/likeModel.js'
import Message from '../models/messageModel.js'
import User from '../models/userModel.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import { deleteFile } from '../utils/minio.js'
import BaseController from './BaseController.js'
import UserService from '../services/UserService.js'

class UserController extends BaseController {
  userService = new UserService()

  getAllUsers = catchAsync(async (req, res, next) => {
    const response = await this.userService.getAllUsers(req.query)

    if (!response.data.users) return next(new AppError('Not users found', 404))

    this.sendResponse(res, 200, {
      message: 'Users received from the database',
      ...response
    })
  })

  getAuthors = catchAsync(async (req, res, next) => {
    const authors = await User.aggregate([
      {
        $match: { role: 'author', status: { $ne: 'deactivated' } }
      },
      {
        $lookup: {
          from: 'articles',
          localField: '_id',
          foreignField: 'author',
          as: 'articles'
        }
      },
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'authorId',
          as: 'followers'
        }
      },
      {
        $unwind: { path: '$articles', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          lastName: { $first: '$lastName' },
          discipline: { $first: '$discipline' },
          followers: { $sum: { $cond: { if: { $isArray: '$followers' }, then: 1, else: 0 } } },
          articles: { $sum: 1 },
          likes: { $sum: '$articles.likes' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          lastName: 1,
          discipline: 1,
          followers: 1,
          articles: 1,
          likes: 1
        }
      }
    ])

    this.sendResponse(res, 200, {
      message: 'All authors received from the database',
      results: authors.length,
      data: {
        authors
      }
    })
  })

  getUserStats = catchAsync(async (req, res, next) => {
    const userStats = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
      },
      {
        $lookup: {
          from: 'articles',
          localField: '_id',
          foreignField: 'author',
          as: 'articles'
        }
      },
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'authorId',
          as: 'followers'
        }
      },
      {
        $unwind: { path: '$articles', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: '$author',
          followers: { $sum: { $cond: { if: { $isArray: '$followers' }, then: 1, else: 0 } } },
          articles: { $sum: 1 },
          likes: { $sum: '$articles.likes' }
        }
      },
      {
        $project: {
          _id: 0,
          followers: 1,
          articles: 1,
          likes: 1
        }
      }
    ])

    if (!userStats.length) return next(new AppError('And error has been ocurred searching the user data, please verify that the user exist', 404))

    this.sendResponse(res, 200, {
      message: 'User stats retrieved from database',
      data: {
        stats: userStats[0]
      }
    })
  })

  getOneUser = catchAsync(async (req, res, next) => {
    const user = await this.userService.getUserById(req.params.userId)

    if (!user) return next(new AppError('User not found', 404))

    this.sendResponse(res, 200, {
      message: 'User retrieved from database',
      data: {
        user
      }
    })
  })

  updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    if (!user) return next(new AppError('User not found', 404))

    const whiteList = ['name', 'lastName', 'email', 'photos', 'phoneNumber', 'photos[profile]', 'photos[cover]']
    const camposActualizar = {}

    if ((req.body.description || req.body.socialLinks) && req.user.role === 'author') {
      whiteList.push('description', 'socialLinks', 'discipline')
    }

    Object.keys(req.body).forEach(campo => {
      if (whiteList.includes(campo)) {
        if (campo === 'photos') {
          camposActualizar.photos = {
            cover:
              camposActualizar.photos?.cover ||
              req.body.photos?.cover ||
              req.user.photos.cover,
            profile:
              camposActualizar.photos?.profile ||
              req.body.photos?.profile ||
              req.user.photos.profile
          }
        } else if (campo === 'photos[profile]') {
          camposActualizar.photos = {
            cover: camposActualizar.photos?.cover || req.body.photos?.cover || req.user.photos.cover,
            profile: req.body[campo]
          }
        } else if (campo === 'photos[cover]') {
          camposActualizar.photos = {
            cover: req.body[campo],
            profile: camposActualizar.photos?.profile || req.body.photos?.profile || req.user.photos.profile
          }
        } else { camposActualizar[campo] = req.body[campo] }
      }
    })

    await this.updateDocumentById(User, req.user.id, camposActualizar, {
      sendResponse: true,
      res,
      message: 'User data has been updated successfully'
    })
  })

  deactivateMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    if (!user) return next(new AppError('User not found', 404))

    if (!(await user.correctPassword(req.body.password, user.password))) return next(new AppError('Invalid password, please try again', 400))

    await this.updateDocumentById(User, req.user.id, { status: 'deactivated' }, {
      sendResponse: true,
      res,
      message: 'User account has been deactivated successfully'
    })
  })

  getMe = catchAsync(async (req, res, next) => {
    await this.getDocumentById(User, req.user.id, {
      sendResponse: true,
      res,
      message: 'Logged user retreived from database'
    })
  })

  deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    if (!user) return next(new AppError('User not found', 404))
    if (!(await user.correctPassword(req.body.password, user.password))) return next(new AppError('Invalid password, please try again', 400))

    for (const photo of Object.keys(user.photos)) {
      await deleteFile(user.photos[photo])
    }

    const chats = await this.getDocuments(Chat, { filter: { users: req.user.id }, query: req.query })

    for (const chat of chats) {
      await Message.updateMany(
        { chatId: chat.id },
        { $addToSet: { hiddeFor: req.user.id } }
      )

      await this.deleteDocuments(Message, { hiddeFor: { $all: chat.users } })

      const messages = await this.getDocuments(Message, {
        filter: { chatId: chat.id },
        query: req.query
      })

      if (messages.length === 0) {
        await this.deleteDocumentById(Chat, chat.id)
      } else {
        chat.users = chat.users.filter(user => user.toString() !== req.user.id)

        await chat.save()
      }
    }

    const articles = await this.getDocuments(Article, {
      filter: { author: req.user._id },
      query: req.query
    })

    await Promise.all(articles.map(async article => {
      const contentUrls = article.content.match(/http:\/\/(?:localhost|127\.0\.0\.1)[^"']*/g)

      if (contentUrls) {
        await Promise.all(contentUrls.map(async url => deleteFile(url)))
      }

      await deleteFile(article.image)

      await this.deleteDocumentById(Article, article.id)
    }))

    const drafts = await this.getDocuments(Draft, {
      filter: { author: req.user._id },
      query: req.query
    })

    await Promise.all(
      drafts.map(async draft => {
        if (draft.images) {
          await Promise.all(draft.images.map(async (url) => deleteFile(url)))
        }

        await this.deleteDocumentById(Draft, draft.id)
      })
    )

    await this.deleteDocuments(Like, { userId: req.user._id })
    await this.deleteDocuments(Follow, { $or: [{ userId: req.user._id }, { authorId: req.user._id }] })
    await this.deleteDocuments(Favorite, { userId: req.user._id })

    await this.deleteDocumentById(User, req.user.id, {
      sendResponse: true,
      res,
      message: 'User account has been deleted successfully'
    })
  })
}

export default new UserController()
