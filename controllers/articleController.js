import Article from '../models/articleModel.js'
import Draft from '../models/draftModel.js'
import Favorite from '../models/favoriteModel.js'
import Like from '../models/likeModel.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import { deleteFile } from '../utils/minio.js'
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

  createDraft = catchAsync(async (req, res, next) => {
    const draftObj = {
      name: req.body.name,
      author: req.user.id,
      discipline: req.user.discipline || req.body.discipline
    }

    await this.createDocument(draftObj, Draft, {
      sendResponse: true,
      res,
      message: 'Draft created successfully'
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

  getUserArticles = catchAsync(async (req, res, next) => {
    await this.getDocuments(Article, {
      filter: { author: req.user.id },
      query: req.query,
      sendResponse: true,
      res,
      message: 'Articles received from the database'
    })
  })

  getDrafts = catchAsync(async (req, res, next) => {
    await this.getDocuments(Draft, {
      filter: { author: req.user.id },
      query: req.query,
      sendResponse: true,
      res,
      message: 'Drafts received from the database'
    })
  })

  getOneArticle = catchAsync(async (req, res, next) => {
    await this.getDocumentById(Article, req.params.articleId, {
      sendResponse: true,
      res,
      message: 'Article received from the database'
    })
  })

  getOneDraft = catchAsync(async (req, res, next) => {
    await this.getDocumentById(Draft, req.params.articleId, {
      sendResponse: true,
      res,
      message: 'Draft received from the database'
    })
  })

  updateArticle = catchAsync(async (req, res, next) => {
    await this.updateDocumentById(Article, req.params.articleId, req.body, {
      sendResponse: true,
      res,
      message: 'Article updated successfully'
    })
  })

  saveDraftChanges = catchAsync(async (req, res, next) => {
    const draft = await this.getDocumentById(Draft, req.params.articleId)
    const allowedFields = ['resume', 'content', 'introduction', 'bibliography']

    if (!draft) return next(new AppError('Draft not found with that id', 404))

    if (req.user.id !== draft.author.id) return next(new AppError('You are not allowed to update this draft', 403))

    Object.keys(req.body).forEach(field => {
      if (allowedFields.includes(field)) {
        draft[field] = req.body[field] || draft[field] || ''
      }
    })

    draft.save()

    this.sendResponse(res, 200, {
      message: 'Changes saved successfully',
      data: {
        draftArticle: draft
      }
    })
  })

  deleteArticle = catchAsync(async (req, res, next) => {
    const contentUrls = req.article.content.match(process.env.FILTER_URL_REGEX)

    if (contentUrls) {
      await Promise.all(contentUrls.map(async url => await deleteFile(url)))
    }

    await deleteFile(req.article.image)

    await this.deleteDocuments(Favorite, { articleId: req.article.id })
    await this.deleteDocuments(Like, { articleId: req.article.id })

    await this.deleteDocumentById(Article, req.article.id, {
      sendResponse: true,
      res,
      message: 'Article deleted successfully'
    })
  })

  deleteDraft = catchAsync(async (req, res, next) => {
    if (req.article.images.length > 0) {
      await Promise.all(req.article.images.map(async imageUrl => await deleteFile(imageUrl)))
    }

    await this.deleteDocumentById(Draft, req.article.id, {
      sendResponse: true,
      res,
      message: 'Draft deleted successfully'
    })
  })

  publishDraft = catchAsync(async (req, res, next) => {
    // Get the draft from database
    const draft = await this.getDocumentById(Draft, req.params.draftId)

    // Check if the draft exists and if belongs to the current user
    if (!draft) return next(new AppError('Draft not found with that id', 404))

    if (req.user.id !== draft.author) return next(new AppError('You are not allowed to update this draft', 403))

    // Gets all the imgURl from the content HTML using a regex /http:\/\/localhost[^"']*/g
    const contentUrls = draft.content.match(process.env.FILTER_URL_REGEX)

    if (draft.images.length > 0) {
      // filter the temp images array in order to verify if all the images submitted while drafting are being used
      const imgsDontUsed = draft.images.filter(imageUrl => !contentUrls.includes(imageUrl))

      // If there are images don't used then remove them from the bucket storage
      if (imgsDontUsed?.length > 0) await Promise.all(imgsDontUsed.map(async imageUrl => await deleteFile(imageUrl)))
    }

    // Build the article using the draft data
    const articleObj = {
      name: draft.name,
      image: req.body.image,
      author: draft.author,
      resume: draft.resume,
      introduction: draft.introduction,
      discipline: draft.discipline || req.user.discipline,
      content: draft.content,
      bibliography: draft.bibliography
    }

    // Save the article
    await this.createDocument(articleObj, Article)

    // Delete the draft once the article has been created
    await this.deleteDocumentById(Draft, draft.id, {
      sendResponse: true,
      res,
      message: 'Draft published successfully'
    })
  })

  verifyOwner = catchAsync(async (req, res, next) => {
    const article = this.getDocumentById(Article, req.params.article)

    if (!article) return next(new AppError('Article not found', 404))

    if (req.user.id !== article.author.id) return next(new AppError('You cannot update an article that you do not own', 403))

    req.article = article

    next()
  })
}

export default new ArticleController()
