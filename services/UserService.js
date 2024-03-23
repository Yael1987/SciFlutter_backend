import UserRepository from '../repository/UserRepository.js'

class UserService {
  userRepository = new UserRepository()

  getAllUsers = async (query, filter = {}) => {
    const { documents, pages, results } = await this.userRepository.getAllDocuments(query, filter)

    return {
      data: {
        users: documents
      },
      pages,
      results
    }
  }

  getUserById = async (id) => {
    const user = await this.userRepository.getDocumentById(id)

    return {
      data: {
        user
      }
    }
  }
}

export default UserService
