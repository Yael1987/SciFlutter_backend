import UserRepository from '../repository/UserRepository.js'
import AppError from '../utils/AppError.js'

class UserService {
  userRepository = new UserRepository()

  getAllUsers = async (query, filter = {}) => {
    const { pages, results, users } = await this.userRepository.getAllDocuments(query, filter)

    if (!users) throw new AppError('No users found', 404)

    return {
      pages,
      results,
      data: {
        users
      }
    }
  }

  getAuthors = async (req) => {
    const authors = await this.userRepository.getAuthors(req.query)

    return {
      results: authors.length,
      data: {
        users: authors
      }
    }
  }

  getAuthorFilters = async (req) => {
    const disciplines = await this.userRepository.getSearchFilters(req.query)

    return {
      data: {
        ...disciplines[0]
      }
    }
  }

  getUserStats = async (userId) => {
    const userStats = await this.userRepository.getUserStats(userId)

    if (!userStats.length) throw new AppError('An error has been ocurred searching the user data, please verify that the user exist', 404)

    return {
      data: {
        stats: userStats[0]
      }
    }
  }

  getUserById = async (id) => {
    const user = await this.userRepository.getDocumentById(id)

    if (!user) throw new AppError('User not found', 404)

    return {
      data: {
        user
      }
    }
  }

  createUser = async (data) => {
    const user = await this.userRepository.createDocument(data)

    const activationToken = user.createActivationToken()

    await user.save({ validateBeforeSave: false })

    const url = `${process.env.FRONTEND_URL}/confirm/${activationToken}`

    return { user, url }
  }

  updateUser = async (req) => {
    this.verifyUserExist({ id: req.user.id })

    const WHITELIST = ['name', 'lastName', 'email', 'photos', 'phoneNumber', 'photos[profile]', 'photos[cover]']
    const camposActualizar = {}

    if ((req.body.description || req.body.socialLinks) && req.user.role === 'author') {
      WHITELIST.push('description', 'socialLinks', 'discipline')
    }

    Object.keys(req.body).forEach(campo => {
      if (WHITELIST.includes(campo)) {
        if (campo === 'photos') {
          camposActualizar.photos = {
            cover:
              camposActualizar.photos?.cover ||
              req.body.photos?.cover ||
              req.user.photos.cover,
            profile:
              camposActualizar.photos?.profile ||
              req.body.photos?.profile ||
              req.user.photos.profile
          }
        } else if (campo === 'photos[profile]') {
          camposActualizar.photos = {
            cover: camposActualizar.photos?.cover || req.body.photos?.cover || req.user.photos.cover,
            profile: req.body[campo]
          }
        } else if (campo === 'photos[cover]') {
          camposActualizar.photos = {
            cover: req.body[campo],
            profile: camposActualizar.photos?.profile || req.body.photos?.profile || req.user.photos.profile
          }
        } else { camposActualizar[campo] = req.body[campo] }
      }
    })

    const userUpdated = await this.userRepository.updateDocumentById(req.user.id, camposActualizar)

    return userUpdated
  }

  makeUserAuthor = async (userId) => {
    await this.userRepository.updateDocumentById(userId, { role: 'author' })
  }

  deactivateMe = async (req) => {
    await this.verifyPassword({ _id: req.user.id }, req.body.password)

    const userUpdated = await this.userRepository.updateDocumentById(req.user.id, { status: 'deactivated' })

    return {
      data: {
        user: userUpdated
      }
    }
  }

  verifyUserExist = async (filter) => {
    const user = this.userRepository.getDocument(filter)

    if (!user) throw new AppError('User not found', 404)
  }

  deleteUserById = async (id) => {
    await this.userRepository.deleteDocumentById(id)
  }

  verifyPassword = async (filter, candidatePassword) => {
    if (!filter) throw new AppError('Invalid filter provided', 403)

    const user = await this.userRepository.getDocument(filter).select('+password +status')

    if (!user) throw new AppError('User not found', 404)

    if (!(await user.correctPassword(candidatePassword, user.password))) throw new AppError('Invalid password, please try again', 400)

    return user
  }
}

export default UserService
