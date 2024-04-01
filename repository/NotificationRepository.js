import Notification from '../models/notificationModel.js'
import BaseRepository from './BaseRepository.js'

export default class NotificationRepository extends BaseRepository {
  constructor () {
    super(Notification)
  }
}
