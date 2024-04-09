import DraftRepository from '../repository/DraftRespository.js'
import { deleteFile } from '../s3.js'
import AppError from '../utils/AppError.js'

export default class DraftService {
  draftRepository = new DraftRepository()

  getMyDrafts = async (query, userId) => {
    const { drafts, pages, results } = await this.draftRepository.getAllDocuments(query, { author: userId })

    return {
      pages,
      results,
      data: {
        drafts
      }
    }
  }

  getDraftById = async (id) => {
    const draft = await this.draftRepository.getDocumentById(id)

    if (!draft) throw new AppError('Draft not found', 404)

    return draft
  }

  createDraft = async (req) => {
    const draftObj = {
      name: req.body.name,
      author: req.user.id,
      discipline: req.body.discipline || req.user.discipline,
      resume: req.body.resume
    }

    const draftCreated = await this.draftRepository.createDocument(draftObj)

    return draftCreated
  }

  updateDraft = async (req) => {
    const ALLOWEDFIELDS = ['resume', 'content', 'introduction', 'bibliography', 'image', 'name', 'discipline']

    const draft = await this.draftRepository.getDocumentById(req.draft.id)

    Object.keys(req.body).forEach(field => {
      if (ALLOWEDFIELDS.includes(field)) {
        draft[field] = req.body[field] || draft[field] || ''
      }
    })

    draft.save()

    return draft
  }

  updateDraftById = async (id, data) => {
    const draft = await this.draftRepository.updateDocumentById(id, data)

    return draft
  }

  copyDraft = async (req) => {
    const body = {
      name: `${req.draft.name} (copy)`,
      author: req.draft.author,
      resume: req.draft.resume,
      introduction: req.draft.introduction,
      discipline: req.draft.discipline,
      content: req.draft.content,
      bibliography: req.draft.bibliography
    }

    const draftCopy = await this.draftRepository.createDocument(body)

    return draftCopy
  }

  clearDraft = async (draft) => {
    // Gets all the imgURl from the content HTML using a regex /http:\/\/localhost[^"']*/g
    const contentUrls = draft.content.match(/http:\/\/(?:localhost|127\.0\.0\.1)[^"']*/g) ?? []

    if (draft.images.length > 0) {
      // filter the temp images array in order to verify if all the images submitted while drafting are being used
      const imgsDontUsed = draft.images.filter(imageUrl => !contentUrls.includes(imageUrl))
      // If there are images don't used then remove them from the bucket storage
      if (imgsDontUsed?.length > 0) await Promise.all(imgsDontUsed.map(async imageUrl => await deleteFile(imageUrl)))
    }

    const draftClean = await this.draftRepository.updateDocumentById(draft.id, { requested: true, images: draft.images })

    return draftClean
  }

  deleteDraft = async (req) => {
    const draftToDelete = await this.draftRepository.getDocumentById(req.draft.id)

    if (!draftToDelete) throw new AppError('Draft not found', 404)

    if (draftToDelete.images?.length > 0) {
      await Promise.all(draftToDelete.images.map(async imageUrl => {
        if (imageUrl.startsWith('/')) return null

        return await deleteFile(imageUrl)
      }))
    }

    if (!draftToDelete.image.startsWith('/')) await deleteFile(draftToDelete.image)

    await this.draftRepository.deleteDocumentById(draftToDelete.id)
  }

  deleteDraftById = async (id) => {
    await this.draftRepository.deleteDocumentById(id)
  }

  checkDraftQuantity = async (req) => {
    const drafts = await this.draftRepository.getAllDocuments(req.query, { author: req.user._id })

    if (drafts.length === 3) throw new AppError('You cannot have more than three drafts', 403)
  }

  verifyOwner = async (req) => {
    const draft = await this.draftRepository.getDocumentById(req.params.draftId)

    if (!draft) throw new AppError('Draft not found', 404)

    if (draft.author._id.toString() !== req.user._id.toString()) throw new AppError('You cannot access a draft that you do not own', 403)

    return draft
  }
}
