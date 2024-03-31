import catchAsync from '../utils/catchAsync.js'
import BaseController from './BaseController.js'
import ArticleService from '../services/ArticleService.js'
import FeaturesService from '../services/FeaturesService.js'
import RequestService from '../services/RequestService.js'

class ArticleController extends BaseController {
  articleService = new ArticleService()
  featuresService = new FeaturesService()
  requestService = new RequestService()

  // Refactored
  getAllArticles = catchAsync(async (req, res, next) => {
    const data = await this.articleService.getAllArticles(req.query)

    this.sendResponse(res, 200, {
      message: 'Articles received from the database',
      ...data
    })
  })

  // Refactored
  getArticleById = catchAsync(async (req, res, next) => {
    const article = await this.articleService.getArticleById(req.params.articleId)

    this.sendResponse(res, 200, {
      message: 'Article received from the database',
      data: {
        article
      }
    })
  })

  // Refactored
  getRequestedArticle = catchAsync(async (req, res, next) => {
    const article = await this.articleService.getRequestedArticle(req.params.articleId)

    this.sendResponse(res, 200, {
      message: 'Requested article retrieved successfully',
      data: {
        article
      }
    })
  })

  // Refactored
  getMyArticles = catchAsync(async (req, res, next) => {
    const data = await this.articleService.getMyArticles(req.query, req.user.id)

    this.sendResponse(res, 200, {
      message: 'Articles received from the database',
      ...data
    })
  })

  // Refactored
  getSavedArticles = catchAsync(async (req, res, next) => {
    const data = await this.articleService.getSavedArticles(req)

    this.sendResponse(res, 200, {
      message: 'Saved articles retrived from database',
      ...data
    })
  })

  // Refactored
  createArticle = catchAsync(async (req, res, next) => {
    const articleCreated = await this.articleService.createArticle(req)

    const requestBody = {
      requester: req.user.id,
      article: articleCreated.id,
      draft: req.params.draftId,
      type: 'publish',
      message: req.body.message || 'I wish you can read approve my article'
    }

    await this.requestService.createRequest(requestBody)

    this.sendResponse(res, 200, {
      message: 'Article created successfully',
      data: {
        article: articleCreated
      }
    })
  })

  // Refactored
  getSearchFilters = catchAsync(async (req, res, next) => {
    const filters = await this.articleService.getSearchFilters(req)

    this.sendResponse(res, 200, {
      message: 'Filters get from database',
      data: {
        filters
      }
    })
  })

  // Refactored
  updateArticle = catchAsync(async (req, res, next) => {
    const article = await this.articleService.updateArticleById(req.article.id, req.body)

    this.sendResponse(res, 200, {
      message: 'Article updated successfully',
      data: {
        article
      }
    })
  })

  // Refactored
  deleteArticle = catchAsync(async (req, res, next) => {
    await this.featuresService.clearArticleInteractions(req.article._id)

    await this.articleService.deleteArticle(req.article)

    this.sendResponse(res, 200, {
      message: 'Article has beendeleted'
    })
  })

  // Refactored
  verifyOwner = catchAsync(async (req, res, next) => {
    const article = await this.articleService.verifyOwner(req)

    req.article = article

    next()
  })
}

export default new ArticleController()
