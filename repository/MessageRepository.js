import Message from '../models/messageModel.js'
import BaseRepository from './BaseRepository.js'

export default class MessageRepository extends BaseRepository {
  constructor () {
    super(Message)
  }
}
