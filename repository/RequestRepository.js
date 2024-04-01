import Request from '../models/requestModel.js'
import BaseRepository from './BaseRepository.js'

export default class RequestRepository extends BaseRepository {
  constructor () {
    super(Request)
  }
}
