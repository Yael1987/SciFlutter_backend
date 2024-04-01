import Draft from '../models/draftModel.js'
import BaseRepository from './BaseRepository.js'

export default class DraftRepository extends BaseRepository {
  constructor () {
    super(Draft)
  }
}
