import APIFeatures from '../utils/ApiFeatures.js'

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

    return { pages: totalPages, results: documents.length, [this.model.modelName.toLowerCase() + 's']: documents }
  }

  getDocument = (filter = {}) => {
    return this.model.findOne(filter)
  }

  getDocumentById = (id) => {
    return this.model.findById(id)
  }

  createDocument = (data) => {
    return this.model.create(data)
  }

  updateDocument = (filter, data) => {
    return this.model.findOneAndUpdate(filter, data)
  }

  updateDocuments = (filter, data) => {
    return this.model.updateMany(filter, data)
  }

  updateDocumentById = (id, data) => {
    return this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    })
  }

  deleteDocumentById (id) {
    return this.model.findByIdAndDelete(id)
  }

  deleteDocuments (filter) {
    return this.model.deleteMany(filter)
  }

  deleteDocument (filter) {
    return this.model.deleteOne(filter)
  }
}

export default BaseRepository
