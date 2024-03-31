import { redisClient } from '../app.js'
import NotificationRepository from '../repository/NotificationRepository.js'

export default class NotificationService {
  notificationRepository = new NotificationRepository()

  getNotifications = async (query, userId) => {
    let data = await redisClient.getNotificationsCache(userId)

    if (!data) data = await this.refreshNotificationsCache(query, userId)

    return data
  }

  readNotifications = async (userId) => {
    await this.notificationRepository.updateDocuments({ user: userId }, { read: true })

    await this.refreshNotificationsCache(null, userId)
  }

  sendNotification = async (data) => {
    const { user } = data
    const notification = await this.notificationRepository.createDocument(data)

    if (user.id) this.refreshNotificationsCache(null, user.id)
    else this.refreshNotificationsCache(null, user)
    return notification
  }

  clearNotifications = async (userId) => {
    await this.notificationRepository.deleteDocuments({ user: userId })
    await redisClient.resetNotificationsCache(userId)
  }

  refreshNotificationsCache = async (query, userId) => {
    const { notifications, results } = await this.notificationRepository.getAllDocuments(query, { user: userId })
    const data = {
      results,
      data: {
        notifications
      }
    }

    redisClient.setNotificationsCache(userId, JSON.stringify(data))

    return data
  }
}
