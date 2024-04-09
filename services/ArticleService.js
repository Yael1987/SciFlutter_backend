import ArticleRepository from '../repository/ArticleRepository.js'
import { deleteFile } from '../s3.js'
import AppError from '../utils/AppError.js'

export default class ArticleService {
  articleRepository = new ArticleRepository()

  getAllArticles = async (query) => {
    const { pages, results, articles } = await this.articleRepository.getAllDocuments(query)

    return {
      pages,
      results,
      data: {
        articles
      }
    }
  }

  getArticleById = async (id) => {
    const article = await this.articleRepository.getDocumentById(id)

    if (!article) throw new AppError('Article not found', 404)

    return article
  }

  getRequestedArticle = async (id) => {
    const results = await this.articleRepository.getRequestedArticle(id)
    const article = results[0]

    if (!article) throw new AppError('Article not found', 404)

    return article
  }

  getMyArticles = async (query, userId) => {
    const { pages, results, articles } = await this.articleRepository.getAllDocuments(query, { author: userId })

    return {
      pages,
      results,
      data: {
        articles
      }
    }
  }

  createArticle = async (req) => {
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

    const articleCreated = await this.articleRepository.createDocument(articleObj)

    return articleCreated
  }

  getSavedArticles = async (req) => {
    const saves = await this.articleRepository.getSavedArticles(req.user.id)

    return {
      results: saves.length,
      data: {
        articles: saves
      }
    }
  }

  getSearchFilters = async (req) => {
    const results = await this.articleRepository.getSearchFilters(req.query.name)
    const filters = results[0]

    return filters ?? { disciplines: [], years: [] }
  }

  updateArticleById = async (id, data) => {
    const article = await this.articleRepository.updateDocumentById(id, data)

    return article
  }

  deleteArticle = async (article) => {
    const contentUrls = article.content.match(/http:\/\/(?:localhost|127\.0\.0\.1)[^"']*/g)

    if (contentUrls) {
      await Promise.all(contentUrls.map(async url => await deleteFile(url)))
    }

    if (!article.image.startsWith('/')) await deleteFile(article.image)

    await this.articleRepository.deleteDocumentById(article.id)
  }

  deleteArticleById = async (id) => {
    await this.articleRepository.deleteDocumentById(id)
  }

  verifyOwner = async (req) => {
    const article = await this.articleRepository.getDocumentById(req.params.articleId)

    if (!article) throw new AppError('Article not found', 404)

    if (req.user._id.toString() !== article.author._id.toString()) throw new AppError('Your cannot edit an article that you do not own', 403)

    return article
  }
}
