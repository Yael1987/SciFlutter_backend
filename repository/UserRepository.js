import mongoose from 'mongoose'
import User from '../models/userModel.js'
import PipelineFeatures from '../utils/PipelineFeatures.js'
import BaseRepository from './BaseRepository.js'

class UserRepository extends BaseRepository {
  constructor () {
    super(User)
  }

  getDocumentById = (id) => {
    return this.getDocument({ _id: id, status: { $ne: 'deactivated' } }).select('-__v -email -twoStepsAuthentication')
  }

  getAuthors = (query) => {
    const pipeline = [
      {
        $match: { role: 'author', status: { $ne: 'deactivated' } }
      },
      {
        $lookup: {
          from: 'articles',
          localField: '_id',
          foreignField: 'author',
          as: 'articles'
        }
      },
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'authorId',
          as: 'followers'
        }
      },
      {
        $unwind: { path: '$articles', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          lastName: { $first: '$lastName' },
          discipline: { $first: '$discipline' },
          photos: { $first: '$photos' },
          followers: { $sum: { $cond: { if: { $isArray: '$followers' }, then: 1, else: 0 } } },
          articles: { $sum: 1 },
          likes: { $sum: '$articles.likes' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          lastName: 1,
          discipline: 1,
          followers: 1,
          articles: 1,
          likes: 1,
          photos: 1
        }
      }
    ]

    const features = new PipelineFeatures(pipeline, query).filter().sort()

    return User.aggregate(features.pipeline)
  }

  getUserStats = (userId) => {
    return User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) }
      },
      {
        $lookup: {
          from: 'articles',
          localField: '_id',
          foreignField: 'author',
          as: 'articles'
        }
      },
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'authorId',
          as: 'followers'
        }
      },
      {
        $unwind: { path: '$articles', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: '$author',
          followers: { $sum: { $cond: { if: { $isArray: '$followers' }, then: 1, else: 0 } } },
          articles: { $sum: 1 },
          likes: { $sum: '$articles.likes' }
        }
      },
      {
        $project: {
          _id: 0,
          followers: 1,
          articles: 1,
          likes: 1
        }
      }
    ])
  }

  getSearchFilters = (query) => {
    return User.aggregate([
      {
        $match: { name: { $regex: query.name, $options: 'i' } }
      },
      {
        $group: {
          _id: null,
          disciplines: { $addToSet: '$discipline' }
        }
      },
      {
        $project: {
          _id: 0,
          disciplines: 1
        }
      }
    ])
  }
}

export default UserRepository
