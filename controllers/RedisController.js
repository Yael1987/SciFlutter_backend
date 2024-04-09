import redis from 'redis'

export default class RedisController {
  constructor () {
    if (process.env.NODE_ENV === 'production') {
      this.client = redis.createClient({
        url: process.env.REDIS_URL
      })
    } else {
      this.client = redis.createClient()
    }
  }

  connect = async () => {
    await this.client.connect()
  }

  setNotificationsCache = (key, data) => {
    this.client.set(`user-notifications:${key}`, JSON.stringify(data))
  }

  getNotificationsCache = async (key) => {
    const data = await this.client.get(`user-notifications:${key}`)

    if (data) {
      return JSON.parse(JSON.parse(data))
    } else {
      return null
    }
  }

  resetNotificationsCache = async (key) => {
    await this.client.DEL(`user-notifications:${key}`)
  }
}
