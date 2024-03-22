import Article from '../models/articleModel.js'
import Draft from '../models/draftModel.js'
import Request from '../models/requestModel.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import BaseController from './BaseController.js'

class RequestController extends BaseController {
  getRequests = catchAsync(async (req, res, next) => {
    await this.getDocuments(Request, {
      query: req.query,
      sendResponse: true,
      res,
      message: 'Requests get from database'
    })
  })

  acceptPublishRequest = catchAsync(async (req, res, next) => {
    const article = await this.getDocumentById(Article, req.body.article)

    if (!article) return next(new AppError('Could not find an article with that id', 404))

    await this.updateDocumentById(Article, article.id, { status: 'published' })

    await this.deleteDocumentById(Draft, req.body.draft)

    await this.updateDocumentById(Request, req.params.requestId, { status: 'approved' })
  })

  rejectPublishRequest = catchAsync(async (req, res, next) => {
    const article = await this.getDocumentById(Article, req.body.article)

    if (!article) return next(new AppError('Could not find an article with that id', 404))

    await this.deleteDocumentById(Article, article.id)

    await this.updateDocumentById(Draft, req.body.draft, { requested: false })

    await this.updateDocumentById(Request, req.params.requestId, { status: 'rejected' })
  })
}

export default new RequestController()
