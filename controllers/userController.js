import User from "../models/userModel.js"
import catchAsync from "../utils/catchAsync.js"
import BaseController from "./BaseController.js"

const deleteUser = (req, res) => { }

export {
  deleteUser,
}

class UserController extends BaseController{
  getAllUsers = catchAsync(async (req, res, next) => {
    await this.getDocuments(User, {
      sendResponse: true,
      res, 
      message: "All users received from the database"
    });
  });

  getAuthors = catchAsync(async (req, res, next) => {
    await this.getDocuments(User, {
      filter: { role: "author" },
      sendResponse: true,
      res,
      message: "All authors received from the database"
    });
  });

  getOneUser = catchAsync(async (req, res, next) => {
    await this.getDocumentById(User, req.params.id, {
      sendResponse: true,
      res,
      message: "User received from the database"
    });
  });

  updateUser = catchAsync(async (req, res, next) => {
    await this.updateDocumentById(User, req.params.id, req.body, {
      sendResponse: true,
      res,
      message: "User data has been updated successfully"
    });
  });

  deleteUser = catchAsync(async (req, res, next) => {
    await this.deleteDocumentById(User, req.params.id, {
      sendResponse: true,
      res, 
      message: "User account has been deleted successfully"
    })
  })
}

export default new UserController();