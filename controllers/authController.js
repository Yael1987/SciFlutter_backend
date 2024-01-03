import jwt from 'jsonwebtoken'
import crypto from 'crypto'

import { promisify } from 'util'

import User from '../models/userModel.js'
import catchAsync from '../utils/catchAsync.js'
import BaseController from './BaseController.js'
import AppError from '../utils/AppError.js'
import Email from '../utils/Email.js'

function signToken (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

class AuthenticationController extends BaseController {
  createToken (user, res, req, code, data) {
    const token = signToken(user.id)

    user.password = undefined

    return this.sendResponse(res, code, {
      token,
      ...data
    })
  }

  signup = catchAsync(async (req, res, next) => {
    const newUser = await this.createDocument({
      name: req.body.name,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    }, User)

    const activationToken = newUser.createActivationToken()

    await newUser.save({ validateBeforeSave: false })

    const url = `${process.env.FRONTEND_URL}/confirm/${activationToken}`

    try {
      await new Email(newUser, url).sendActivationToken()

      await this.createToken(newUser, res, req, 201, {
        message: 'User created succesfully',
        data: {
          user: newUser
        }
      })
    } catch (error) {
      await User.findByIdAndDelete(newUser.id)

      return next(
        new AppError(
          'There was an error sending the email, Try again later',
          500
        )
      )
    }
  })

  protectRoute = catchAsync(async (req, res, next) => {
    let token
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      next(new AppError('You are not logged in, please login and try again', 401))
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    const freshUser = await this.getDocumentById(User, decoded.id)

    if (!freshUser) next(new AppError('The user belogin this token does not longer exist.', 401))

    if (await freshUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('Your password has been changed since you logged in.', 401)
      )
    }

    req.user = freshUser

    next()
  })

  login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) return next(new AppError('All the fields are required, please provide a valid email and password.', 400))

    let user = await User.findOne({ email }).select('+password')

    if (!user) return next(new AppError('No user found for that email, please check the email of create an account', 400))

    if (!(await user.correctPassword(password, user.password))) return next(new AppError('Incorrect password, please try it again', 400))

    if (user.status === 'desactivated') {
      user = await this.updateDocumentById(User, user.id, { status: 'active' })
    }

    this.createToken(user, res, req, 200, {
      message: 'Logged in successfully',
      data: {
        user
      }
    })
  })

  restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(new AppError('Your are not authorized to access this route', 403))
      }

      next()
    }
  }

  isVerified = catchAsync(async (req, res, next) => {
    if (req.user.status !== 'active') return next(new AppError('Your account is not verified, please check your email where we send your instructions and try again', 403))

    next()
  })

  activateAccount = catchAsync(async (req, res, next) => {
    //  get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await this.getDocuments(User, {
      filter: {
        activationToken: hashedToken
      },
      query: req.query,
      justFirst: true
    })

    //  Checks if the user exists
    if (!user) return next(new AppError('The user belonging to this token does not exist', 404))

    //  Update the user status and clear the activation token
    user.activationToken = undefined
    user.status = 'active'

    await user.save({ validateBeforeSave: false })

    //  Send the response to the client
    this.sendResponse(res, 200, {
      success: true,
      message: 'Your account has been activated successfully',
      data: {
        user
      }
    })
  })

  forgotPassword = catchAsync(async (req, res, next) => {
    const user = await this.getDocuments(User, {
      filter: { email: req.body.email },
      justFirst: true
    })

    if (!user) return next(new AppError('No such user found for that email address', 404))

    const resetToken = user.createResetToken()
    await user.save({ validateBeforeSave: false })

    const url = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    try {
      await new Email(user, url).sendResetToken()

      this.sendResponse(res, 200, {
        success: true,
        message: 'We sent a email with instructions for recovering your account'
      })
    } catch (error) {
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save({ validateBeforeSave: false })

      return next(
        new AppError(
          'There was an error sending the email, Try again later',
          500
        )
      )
    }
  })

  resetPassword = catchAsync(async (req, res, next) => {
    //  Get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await this.getDocuments(User, {
      filter: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      },
      query: req.query,
      justFirst: true
    })

    if (!user) return next(new AppError('Password reset token is invalid or has been expired', 400))

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()

    this.createToken(user, res, req, 200, {
      message: 'Password reset has been successfully',
      data: {
        user
      }
    })
  })

  logout = (req, res) => {
    res.clearCookie('token')

    res.status(200).json({
      status: 'success'
    })
  }

  updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    if (!user) return next(new AppError('User not found', 404))

    if (!(user.correctPassword(req.body.passwordCurrent, user.password))) return next(new AppError('Current password is incorrect', 400))

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm

    await user.save()

    this.createToken(user, res, res, 200, {
      message: 'Login successfully, welcome back',
      data: {
        user
      }
    })
  })
}

export const authController = new AuthenticationController()
