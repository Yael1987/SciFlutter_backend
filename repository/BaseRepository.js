import APIFeatures from '../utils/apiFeatures.js'

class BaseRepository {
  model

  constructor (model) {
    this.model = model
  }

  async getAllDocuments (query, filter) {
    const { features, totalPages } = await new APIFeatures(this.model.find(filter), query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const documents = await features.query

    return { pages: totalPages, results: documents.length, documents }
  }

  async getDocumentById (id) {
    const document = await this.model.findById(id)

    return document
  }

  async createDocument (data) {
    const documentCreated = await this.model.create(data)

    return documentCreated
  }

  async updateDocument (filter, data) {
    const updatedDocument = await this.model.findOneAndUpdate(filter, data)

    return updatedDocument
  }

  async updateDocumentById (id, data) {
    const documentUpdated = await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    })

    return documentUpdated
  }

  async deleteDocumentById (id) {
    await this.model.findByIdAndDelete(id)
  }

  async deleteDocuments (filter) {
    await this.model.deleteMany(filter)
  }
}

export default BaseRepository
