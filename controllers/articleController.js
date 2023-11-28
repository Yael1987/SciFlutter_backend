import Article from '../models/articleModel.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import BaseController from './BaseController.js'

class ArticleController extends BaseController {
  createArticle = catchAsync(async (req, res, next) => {
    const articleObj = {
      name: req.body.name,
      image: req.body.image,
      author: req.user.id,
      resume: req.body.resume,
      introduction: req.body.introduction,
      discipline: req.user.discipline || req.body.discipline,
      content: req.body.content,
      bibliography: req.body.bibliography
    }

    await this.createDocument(articleObj, Article, {
      sendResponse: true,
      res,
      message: 'Article created successfully'
    })
  })

  getArticles = catchAsync(async (req, res, next) => {
    await this.getDocuments(Article, {
      filter: { status: { $eq: 'published' } },
      query: req.query,
      sendResponse: true,
      res,
      message: 'Articles received from the database'
    })
  })

  getOneArticle = catchAsync(async (req, res, next) => {
    await this.getDocumentById(Article, req.params.articleId, {
      sendResponse: true,
      res,
      message: 'Article received from the database'
    })
  })

  updateArticle = catchAsync(async (req, res, next) => {
    await this.updateDocumentById(Article, req.params.articleId, req.body, {
      sendResponse: true,
      res,
      message: 'Article updated successfully'
    })
  })

  deleteArticle = catchAsync(async (req, res, next) => {
    await this.deleteDocumentById(Article, req.params.articleId, {
      sendResponse: true,
      res,
      message: 'Article deleted successfully'
    })
  })

  verifyOwner = catchAsync(async (req, res, next) => {
    const article = this.getDocumentById(Article, req.params.article)

    if (!article) return next(new AppError('Article not found', 404))

    if (req.user.id !== article.author.id) return next(new AppError('You cannot update an article that you do not own', 403))

    next()
  })
}

export default new ArticleController()
