export default class BaseController {
  async sendResponse (res, code, data) {
    res.status(code).json({
      success: true,
      ...data
    })
  }
}
