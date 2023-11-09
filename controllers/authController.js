import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import BaseController from "./BaseController.js";

const login = (req, res) => { };
const resetPassword = (req, res) => { };
const changePassword = (req, res) => { };

export {
  login,
  resetPassword,
  changePassword
}

class AuthenticationController extends BaseController{
  signup = catchAsync(async (req, res, next) => {
    await this.createDocument(req.body, User, {
      sendResponse: true,
      res,
      message: "User account created successfully"
    });
  });
};

export const authController = new AuthenticationController();