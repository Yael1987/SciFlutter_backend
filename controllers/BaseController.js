export default class BaseController {
  async sendResponse(res, code, data) {
    res.status(code).json({
      success: true,
      ...data,
    });
  }

  async createDocument(
    data,
    Model,
    options = {
      sendResponse: false,
      res: null,
      message: "Document created successfully",
    }
  ) {
    const documentCreated = await Model.create(data);

    if (options.sendResponse) {
      return this.sendResponse(options.res, 201, {
        message: options.message,
        data: documentCreated,
      });
    }

    return documentCreated;
  }

  async getDocuments(
    Model,
    options = {
      filter: {},
      sendResponse: false,
      res: null,
      message: "Data fetched successfully",
    }
  ) {
    const documents = await Model.find(options.filter);

    if (options.sendResponse) {
      return this.sendResponse(options.res, 200, {
        message: options.message,
        results: documents.length,
        data: documents,
      });
    }

    return documents;
  }

  async getDocumentById(
    Model,
    id,
    options = {
      sendResponse: false,
      res: null,
      message: "User fetched successfully",
    }
  ) {
    const document = await Model.findById(id);

    if (!document) return "No user found for this id";

    if (options.sendResponse) {
      return this.sendResponse(options.res, 200, {
        message: options.message,
        data: document,
      });
    }

    return document;
  }

  async updateDocument(
    Model,
    data,
    options = {
      filter: {},
      sendResponse: false,
      res: null,
      message: "Document updated successfully",
    }
  ) {
    const updatedDocument = await Model.findOneAndUpdate(options.filter, data);

    if (options.sendResponse) {
      return this.sendResponse(options.res, 200, {
        message: options.message,
        data: updatedDocument,
      });
    }

    return updatedDocument
  }

  async updateDocumentById(
    Model,
    id,
    data,
    options = {
      sendResponse: false,
      res: null,
      message: "Document updated successfully",
    }
  ) {
    const updatedDocument = await Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (options.sendResponse) {
      return this.sendResponse(options.res, 200, {
        message: options.message,
        data: updatedDocument,
      });
    }

    return updatedDocument
  }

  async deleteDocumentById(Model, id, options = {
    sendResponse: false,
    res: null,
    message: "Document deleted successfully"
  }) {
    await Model.findByIdAndDelete(id);

    if (options.sendResponse) {
      return this.sendResponse(options.res, 204, {
        message: options.message
      });
    }
  }
}