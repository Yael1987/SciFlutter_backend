import Article from '../models/articleModel.js'
import Chat from '../models/chatModel.js'
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

    await this.deleteDocuments(Article, { author: req.user._id })
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
