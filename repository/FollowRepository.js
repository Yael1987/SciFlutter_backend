import Follow from '../models/followModel.js'
import BaseRepository from './BaseRepository.js'

export default class FollowRepository extends BaseRepository {
  constructor () {
    super(Follow)
  }
}
