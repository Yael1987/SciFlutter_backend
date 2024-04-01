import DraftService from '../services/DraftService.js'
import catchAsync from '../utils/catchAsync.js'
import BaseController from './BaseController.js'

class DraftController extends BaseController {
  draftService = new DraftService()

  getDrafts = catchAsync(async (req, res, next) => {
    const data = await this.draftService.getMyDrafts(req.query, req.user.id)

    this.sendResponse(res, 200, {
      message: 'Drafts received from the database',
      ...data
    })
  })

  getOneDraft = catchAsync(async (req, res, next) => {
    const draft = await this.draftService.getDraftById(req.draft.id)

    this.sendResponse(res, 200, {
      message: 'Draft received from the database',
      data: {
        draft
      }
    })
  })

  createDraft = catchAsync(async (req, res, next) => {
    const draft = await this.draftService.createDraft(req)

    this.sendResponse(res, 201, {
      message: 'Draft created successfully',
      data: {
        draft
      }
    })
  })

  copyDraft = catchAsync(async (req, res, next) => {
    const draft = await this.draftService.copyDraft(req)

    this.sendResponse(req, 200, {
      message: 'Draft copied',
      data: {
        draft
      }
    })
  })

  saveChanges = catchAsync(async (req, res, next) => {
    const draft = await this.draftService.updateDraft(req)

    this.sendResponse(res, 200, {
      message: 'Changes saved successfully',
      data: {
        draft
      }
    })
  })

  clearDraft = catchAsync(async (req, res, next) => {
    const draft = await this.draftService.clearDraft(req.draft)

    req.body.name = draft.name
    req.body.author = draft.author
    req.body.resume = draft.resume
    req.body.introduction = draft.introduction
    req.body.image = draft.image
    req.body.discipline = draft.discipline || req.user.discipline
    req.body.content = draft.content
    req.body.bibliography = draft.bibliography

    next()
  })

  deleteDraft = catchAsync(async (req, res, next) => {
    await this.draftService.deleteDraft(req)

    await this.sendResponse(res, 200, {
      message: 'Draft has been deleted'
    })
  })

  verifyOwner = catchAsync(async (req, res, next) => {
    const draft = await this.draftService.verifyOwner(req)
    req.draft = draft

    next()
  })
}

export default new DraftController()
