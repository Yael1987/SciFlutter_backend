import mongoose from 'mongoose'
import Article from '../models/articleModel.js'
import BaseRepository from './BaseRepository.js'
import Favorite from '../models/favoriteModel.js'

export default class ArticleRepository extends BaseRepository {
  constructor () {
    super(Article)
  }

  getRequestedArticle = (id) => {
    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: {
          path: '$author',
          includeArrayIndex: 'string',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          name: '$name',
          image: '$image',
          author: {
            name: '$author.name',
            photos: '$author.photos',
            lastName: '$author.lastName',
            _id: '$author._id'
          },
          resume: '$resume',
          discipline: '$discipline',
          createdAt: '$createdAt',
          introduction: '$introduction',
          content: '$content',
          bibliography: '$bibliography'
        }
      }
    ]

    return Article.aggregate(pipeline)
  }

  getSavedArticles = (id) => {
    const pipeline = [
      {
        $match: { userId: new mongoose.Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: 'articles',
          localField: 'articleId',
          foreignField: '_id',
          as: 'article'
        }
      },
      {
        $unwind: '$article'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'article.author',
          foreignField: '_id',
          as: 'article.author'
        }
      },
      {
        $unwind: '$article.author'
      },
      {
        $project: {
          _id: '$article._id',
          name: '$article.name',
          image: '$article.image',
          author: {
            name: '$article.author.name',
            lastName: '$article.author.lastName',
            photos: {
              profile: '$article.author.photos.profile'
            }
          },
          resume: '$article.resume',
          discipline: '$article.discipline',
          createdAt: '$article.createdAt'
        }
      }
    ]

    return Favorite.aggregate(pipeline)
  }

  getSearchFilters = (query) => {
    const pipeline = [
      {
        $match: {
          name: {
            $regex: query,
            $options: 'i'
          }
        }
      },
      {
        $group: {
          _id: null,
          disciplines: { $addToSet: '$discipline' },
          years: {
            $addToSet: { $year: '$createdAt' }
          }
        }
      },
      {
        $project: {
          _id: 0,
          disciplines: 1,
          years: 1
        }
      }
    ]

    return Article.aggregate(pipeline)
  }
}
