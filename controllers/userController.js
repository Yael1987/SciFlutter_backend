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

class UserController extends BaseController {
  getAllUsers = catchAsync(async (req, res, next) => {
    await this.getDocuments(User, {
      sendResponse: true,
      res,
      query: req.query,
      message: 'All users received from the database'
    })
  })

  getAuthors = catchAsync(async (req, res, next) => {
    await this.getDocuments(User, {
      filter: { role: 'author' },
      query: req.query,
      sendResponse: true,
      res,
      message: 'All authors received from the database'
    })
  })

  getOneUser = catchAsync(async (req, res, next) => {
    // const user = User.findById(req.params.id).populate('articles followers')

    await this.getDocumentById(User, req.params.id, {
      sendResponse: true,
      res,
      message: 'User received from the database'
    })
  })

  updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    if (!user) return next(new AppError('User not found', 404))

    const whiteList = ['name', 'lastName', 'email', 'photos', 'phoneNumber']
    const camposActualizar = {}

    if ((req.body.description || req.body.socialLinks) && req.user.role === 'author') {
      whiteList.push('description', 'socialLinks')
    }

    Object.keys(req.body).forEach(campo => {
      if (whiteList.includes(campo)) {
        if (campo === 'photos') {
          camposActualizar.photos = {
            cover:
              req.body.photos.cover ||
              req.user.photos.cover ||
              'defaultCoverPic.jpg',
            profile:
              req.body.photos.profile ||
              req.user.photos.profile ||
              'defaultProfilePic.jpg'
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

  getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if (!user) return next(new AppError('User not found', 404))

    this.sendResponse(res, 200, {
      data: {
        user
      },
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
