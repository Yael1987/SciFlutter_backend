import User from '../models/userModel.js'
import BaseRepository from './BaseRepository.js'

class UserRepository extends BaseRepository {
  constructor () {
    super(User)
  }

  getDocumentById = async (id) => {
    const user = await this.model.findOne({ _id: id, status: { $ne: 'deactivated' } }).select('-__v -email -twoStepsAuthentication -status')

    return user
  }
}

export default UserRepository
