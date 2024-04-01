import FavoriteRepository from '../repository/FavoriteRepository.js'
import FollowRepository from '../repository/FollowRepository.js'
import LikeRepository from '../repository/LikeRepository.js'
import AppError from '../utils/AppError.js'

export default class FeaturesService {
  likeRepository = new LikeRepository()
  favoriteRepository = new FavoriteRepository()
  followRepository = new FollowRepository()

  checkAuthorFollow = async (req) => {
    const follow = await this.followRepository.getDocument({ authorId: req.params.authorId, userId: req.user.id })

    if (follow) return false
    else return true
  }

  checkArticleLike = async (req) => {
    const like = await this.likeRepository.getDocument({ articleId: req.params.articleId, userId: req.user.id })

    if (like) return false
    else return true
  }

  checkDocumentExist = async (modelName, req) => {
    switch (modelName) {
      case 'Follow':
        return await this.followRepository.getDocument({ userId: req.user._id, authorId: req.params.id })
      case 'Like':
        return await this.likeRepository.getDocument({ userId: req.user._id, articleId: req.params.id })
      case 'Favorite':
        return await this.favoriteRepository.getDocument({ userId: req.user._id, articleId: req.params.id })
      default:
        throw new AppError('Option invalid', 400)
    }
  }

  createDocument = async (modelName, req) => {
    switch (modelName) {
      case 'Follow':
        return await this.follow({ userId: req.user._id, authorId: req.params.id })
      case 'Like':
        return await this.like({ userId: req.user._id, articleId: req.params.id })
      case 'Favorite':
        return await this.addFavorite({ articleId: req.params.id, userId: req.user._id })
      default:
        throw new AppError('Option invalid', 400)
    }
  }

  deleteDocument = async (modelName, req) => {
    switch (modelName) {
      case 'Follow':
        return await this.unfollow({ userId: req.user._id, authorId: req.params.id })
      case 'Like':
        return await this.unlike({ userId: req.user._id, articleId: req.params.id })
      case 'Favorite':
        return await this.deleteFavorite({ articleId: req.params.id, userId: req.user._id })
      default:
        throw new AppError('Option invalid', 400)
    }
  }

  clearUserFeatures = async (id) => {
    await this.likeRepository.deleteDocuments({ userId: id })
    await this.followRepository.deleteDocuments({ $or: [{ userId: id }, { authorId: id }] })
    await this.favoriteRepository.deleteDocuments({ userId: id })
  }

  clearArticleInteractions = async (id) => {
    await this.favoriteRepository.deleteDocuments({ articleId: id })
    await this.likeRepository.deleteDocuments({ articleId: id })
  }

  addFavorite = async (data) => {
    await this.favoriteRepository.createDocument(data)

    return 'Article added to favorites'
  }

  follow = async (data) => {
    await this.followRepository.createDocument(data)

    return 'Now you are following this author'
  }

  like = async (data) => {
    await this.likeRepository.createDocument(data)

    return 'Article liked'
  }

  deleteFavorite = async (data) => {
    await this.favoriteRepository.deleteDocument(data)

    return 'Article deleted from favorites'
  }

  unfollow = async (data) => {
    await this.followRepository.deleteDocument(data)

    return 'Now you are not following this author'
  }

  unlike = async (data) => {
    await this.likeRepository.deleteDocument(data)

    return 'Article unliked'
  }
}
