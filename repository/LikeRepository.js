import Like from '../models/likeModel.js'
import BaseRepository from './BaseRepository.js'

export default class LikeRepository extends BaseRepository {
  constructor () {
    super(Like)
  }
}
