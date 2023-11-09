import Article from "../models/articleModel.js"
import catchAsync from "../utils/catchAsync.js"
import BaseController from "./BaseController.js"

class ArticleController extends BaseController{
  createArticle = catchAsync(async (req, res, next) => {
    await this.createDocument(req.body, Article, {
      sendResponse: true,
      res,
      message: "Article created successfully"
    });
  })

  getArticles = catchAsync(async (req, res, next) => {
    await this.getDocuments(Article, {
      sendResponse: true,
      res, 
      message: "Articles received from the database"
    })
  })

  getOneArticle = catchAsync(async (req, res, next) => {
    await this.getDocumentById(Article, req.params.articleId, {
      sendResponse: true,
      res,
      message: "Article received from the database"
    })
  })

  updateArticle = catchAsync(async (req, res, next) => {
    await this.updateDocumentById(Article, req.params.articleId, req.body, {
      sendResponse: true,
      res,
      message: "Article updated successfully"
    })
  })

  deleteArticle = catchAsync(async (req, res, next) => { 
    await this.deleteDocumentById(Article, req.params.articleId, {
      sendResponse: true,
      res, 
      message: "Article deleted successfully"
    })
  })
}

export default new ArticleController();