import catchAsync from '../utils/catchAsync.js'
import { deleteFile } from '../utils/minio.js'
import BaseController from './BaseController.js'
import UserService from '../services/UserService.js'
import MessageService from '../services/MessageService.js'
import ArticleService from '../services/ArticleService.js'
import FeaturesService from '../services/FeaturesService.js'
import DraftService from '../services/DraftService.js'

class UserController extends BaseController {
  userService = new UserService()
  messageService = new MessageService()
  articleService = new ArticleService()
  draftService = new DraftService()
  featuresService = new FeaturesService()

  // Refactored
  getAllUsers = catchAsync(async (req, res, next) => {
    const data = await this.userService.getAllUsers(req.query)

    this.sendResponse(res, 200, {
      message: 'Users received from the database',
      ...data
    })
  })

  // Refactored
  getAuthors = catchAsync(async (req, res, next) => {
    const data = await this.userService.getAuthors(req)

    await this.sendResponse(res, 200, {
      message: 'All authors received from the database',
      ...data
    })
  })

  // Refactored
  getUserStats = catchAsync(async (req, res, next) => {
    const data = await this.userService.getUserStats(req.params.id)

    this.sendResponse(res, 200, {
      message: 'User stats retrieved from database',
      ...data
    })
  })

  // Refactored
  getOneUser = catchAsync(async (req, res, next) => {
    const data = await this.userService.getUserById(req.params.id)

    this.sendResponse(res, 200, {
      message: 'User retrieved from database',
      ...data
    })
  })

  // Refactored
  updateUser = catchAsync(async (req, res, next) => {
    const user = await this.userService.updateUser(req)

    this.sendResponse(res, 200, {
      message: 'User data has been updated successfully',
      data: {
        user
      }
    })
  })

  // Refactored
  deactivateMe = catchAsync(async (req, res, next) => {
    const data = await this.userService.deactivateMe(req)

    this.sendResponse(res, 200, {
      message: 'User account has been deactivated successfully',
      ...data
    })
  })

  // Refactored
  getMe = catchAsync(async (req, res, next) => {
    const data = await this.userService.getUserById(req.user.id)

    this.sendResponse(res, 200, {
      message: 'Logger user retreived from database',
      ...data
    })
  })

  // Refactored
  getAuthorFilters = catchAsync(async (req, res, next) => {
    const data = await this.userService.getAuthorFilters(req)

    this.sendResponse(res, 200, {
      message: 'Filters get from database',
      ...data
    })
  })

  // Refactored
  deleteUser = catchAsync(async (req, res, next) => {
    const user = await this.userService.verifyPassword({ _id: req.user.id }, req.body.password)

    for (const photo of Object.keys(user.photos)) {
      await deleteFile(user.photos[photo])
    }

    await this.messageService.clearChats(user.id)

    const { data } = await this.articleService.getMyArticles(req.query, user.id)
    const articles = data.articles ?? []

    await Promise.all(articles.map(async article => {
      await this.featuresService.clearArticleInteractions(article.id)
      await this.articleService.deleteArticle(article)
    }))

    const { dataDrafts } = await this.draftService.getMyDrafts(req.query, user.id)
    const drafts = dataDrafts.drafts ?? []

    await Promise.all(
      drafts.map(this.draftService.deleteDraft)
    )

    await this.featuresService.clearUserFeatures(user.id)
    await this.userService.deleteUserById(user.user.id)
    req.user = null

    await this.sendResponse(res, 200, {
      message: 'User account has been deleted successfully'
    })
  })
}

export default new UserController()
