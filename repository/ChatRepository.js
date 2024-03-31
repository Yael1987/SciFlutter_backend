import Chat from '../models/chatModel.js'
import BaseRepository from './BaseRepository.js'

export default class ChatRepository extends BaseRepository {
  constructor () {
    super(Chat)
  }

  getUserChats = (userId) => {
    const pipeline = [
      {
        $match: { users: userId }
      },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$chatId', '$$chatId'] },
                hiddeFor: { $ne: userId }
              }
            },
            {
              $sort: { createdAt: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: 'lastMessage'
        }
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ['$lastMessage', 0] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'usersData'
        }
      },
      {
        $project: {
          users: {
            $map: {
              input: '$usersData',
              as: 'usersData',
              in: {
                _id: '$$usersData._id',
                name: '$$usersData.name',
                lastName: '$$usersData.lastName',
                status: '$$usersData.status'
              }
            }
          },
          readBy: 1,
          readAt: 1,
          lastMessage: {
            sender: 1,
            content: 1,
            status: 1
          }
        }
      }
    ]

    return Chat.aggregate(pipeline)
  }
}
