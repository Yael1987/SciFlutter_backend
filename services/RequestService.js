import RequestRepository from '../repository/RequestRepository.js'
import AppError from '../utils/AppError.js'

export default class RequestService {
  requestRepository = new RequestRepository()

  getAllRequests = async (query) => {
    const { requests, pages, results } = await this.requestRepository.getAllDocuments(query)

    return {
      pages,
      results,
      data: {
        requests
      }
    }
  }

  getRequestById = async (id) => {
    const request = await this.requestRepository.getDocumentById(id)

    if (!request) throw new AppError('Request not found', 404)

    return request
  }

  createRequest = async (data) => {
    await this.requestRepository.createDocument(data)
  }

  updateRequestById = async (id, data) => {
    await this.requestRepository.updateDocumentById(id, data)
  }
}
