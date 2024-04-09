import catchAsync from '../utils/catchAsync.js'
import BaseController from './BaseController.js'
import RequestService from '../services/RequestService.js'
import ArticleService from '../services/ArticleService.js'
import DraftService from '../services/DraftService.js'
import NotificationService from '../services/NotificationService.js'
import UserService from '../services/UserService.js'

class RequestController extends BaseController {
  requestService = new RequestService()
  articleService = new ArticleService()
  draftService = new DraftService()
  userService = new UserService()
  notificationService = new NotificationService()

  getRequests = catchAsync(async (req, res, next) => {
    const data = await this.requestService.getAllRequests(req.query)

    this.sendResponse(res, 200, {
      message: 'Requests get from database',
      ...data
    })
  })

  getRequestById = catchAsync(async (req, res, next) => {
    const request = await this.requestService.getRequestById(req.params.id)

    this.sendResponse(res, 200, {
      message: 'Request get from database',
      data: {
        request
      }
    })
  })

  acceptPublishRequest = catchAsync(async (req, res, next) => {
    const article = await this.articleService.updateArticleById(req.body.article, { status: 'published' })

    await this.draftService.deleteDraftById(req.body.draft)

    await this.requestService.updateRequestById(req.params.id, { status: 'approved' })

    const notificationBody = {
      user: article.author,
      title: 'Article approved',
      message: req.body.message || 'Congratulations your article has been approved and published',
      type: 'success'
    }

    if (article.author.role !== 'author') await this.userService.makeUserAuthor(article.author.id)

    await this.notificationService.sendNotification(notificationBody)

    this.sendResponse(res, 200, {
      message: 'Request approved'
    })
  })

  rejectPublishRequest = catchAsync(async (req, res, next) => {
    await this.articleService.deleteArticleById(req.body.article)

    const draft = await this.draftService.updateDraftById(req.body.draft, { requested: false })

    await this.requestService.updateRequestById(req.params.id, { status: 'rejected' })

    const notificationBody = {
      user: draft.author,
      title: 'Article rejected',
      message: req.body.message || 'Sorry we can\'t find publish your article, please check them and try again',
      type: 'error'
    }

    await this.notificationService.sendNotification(notificationBody)

    this.sendResponse(res, 200, {
      message: 'Request rejected'
    })
  })
}

export default new RequestController()
