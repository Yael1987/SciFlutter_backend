import ChatRepository from '../repository/ChatRepository.js'
import MessageRepository from '../repository/MessageRepository.js'
import UserRepository from '../repository/UserRepository.js'
import AppError from '../utils/AppError.js'

export default class MessageService {
  messageRepository = new MessageRepository()
  chatRepository = new ChatRepository()
  userRepository = new UserRepository()

  sendMessage = async (req) => {
    const senderId = req.user.id
    const receiverId = req.params.receiverId

    if (senderId === receiverId) throw new AppError('You cannot send a message to yourself', 403)
    const chatId = this.getChatId([senderId, receiverId])

    const messageBody = {
      ...req.body,
      sender: senderId,
      receiver: receiverId,
      chatId
    }

    await this.messageRepository.createDocument(messageBody)
  }

  getUserChats = async (userId) => {
    const chats = await this.chatRepository.getUserChats(userId)

    return {
      results: chats.length,
      data: {
        chats
      }
    }
  }

  getChatMessages = async (chatId, userId, query) => {
    const searchedChat = await this.readChat(chatId, userId)
    const { messages, results } = await this.messageRepository.getAllDocuments(query, { chatId: searchedChat.id, hiddeFor: { $ne: userId } })

    return {
      results,
      data: { messages }
    }
  }

  readChat = async (chatId, userId) => {
    const searchedChat = await this.chatRepository.getDocument({ _id: chatId, users: { $all: [userId] } })

    if (!searchedChat) throw new AppError('Not chat found with that id for this user', 404)

    searchedChat.addUserToReadBy(userId)
    await searchedChat.save()
    return searchedChat
  }

  unsendMessage = async (messageId, userId) => {
    const message = await this.getMessageById(messageId)

    if (message.sender.toString() !== userId) throw new AppError('You cannot unsend a message from someone else', 403)

    if (message.status === 'read') {
      message.unsend = true
      message.content = 'Envio anulado'
      await message.save()
    } else {
      await this.messageRepository.deleteDocumentById(message.id)
    }
  }

  deleteMessageForMe = async (messageId, userId) => {
    const message = await this.getMessageById(messageId)

    const chat = await this.chatRepository.getDocumentById(message.chatId)

    message.hiddeMessageToUser(userId)
    await message.save()

    await this.messageRepository.deleteDocuments({ hiddeFor: { $all: chat.users } })
  }

  clearChat = async (chatId, userId) => {
    // const chat = await this.getDocumentById(Chat, req.params.chatId)
    const chat = await this.chatRepository.getDocumentById(chatId)

    if (!chat) throw new AppError('Chat not found', 404)

    if (!chat.users.includes(userId)) throw new AppError('You cannot clear a chat for someone else', 403)

    const messages = await this.clearChatMessages(chat, userId)

    if (messages.length === 0) {
      await this.chatRepository.deleteDocumentById(chat.id)
    }
  }

  clearChats = async (userId) => {
    const chats = await this.getUserChats(userId)

    for (const chat of chats) {
      const messages = await this.clearChatMessages(chat, userId)

      if (messages.length === 0) {
        await this.chatRepository.deleteDocumentById(chat.id)
      } else {
        chat.users = chat.users.filter(user => user.toString() !== userId)

        await chat.save()
      }
    }
  }

  clearChatMessages = async (chat, userId) => {
    await this.messageRepository.updateDocuments(
      { chatId: chat.id },
      { $addToSet: { hiddeFor: userId } }
    )

    await this.messageRepository.deleteDocuments({ hiddeFor: { $all: chat.users } })

    const messages = await this.messageRepository({ chatId: chat.id })

    return messages
  }

  getMessageById = async (id) => {
    const message = await this.messageRepository.getDocumentById(id)

    if (!message) throw new AppError('Not message found', 404)

    return message
  }

  getChatId = async (users) => {
    const [senderId, receiverId] = users

    const chatExists = await this.chatRepository.getDocument({ users: { $all: users } })

    if (chatExists) {
      chatExists.addUserToReadBy(senderId)
      chatExists.removeReceiverFromReadBy(senderId)

      await chatExists.save()

      return chatExists.id
    } else {
      // const receiver = await this.getDocumentById(User, receiverId)
      const receiver = await this.userRepository.getDocumentById(receiverId)

      if (!receiver) throw new AppError('The user does not exist or is deactivated', 410)

      // if (req.user.role !== 'author') {
      //   if (receiver.role !== 'author') throw new AppError('Just can send messages to authors', 403)
      // }

      const newChat = await this.chatRepository.createDocument({
        users: [receiverId, senderId],
        readBy: [senderId]
      })

      return newChat.id
    }
  }
}
