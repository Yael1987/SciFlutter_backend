import catchAsync from '../utils/catchAsync.js'
import BaseController from './BaseController.js'
import AppError from '../utils/AppError.js'
import Email from '../utils/Email.js'
import AuthService from '../services/AuthService.js'
import UserService from '../services/UserService.js'

class AuthenticationController extends BaseController {
  authService = new AuthService()
  userService = new UserService()

  // Refactored
  signup = catchAsync(async (req, res, next) => {
    const body = {
      name: req.body.name,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    }

    const { url, user } = await this.userService.createUser(body)

    try {
      await new Email(user, url).sendActivationToken()

      const token = this.authService.createToken(user.id)
      user.password = undefined

      this.sendResponse(res, 201, {
        message: 'User created succesfully',
        token,
        data: {
          user
        }
      })
    } catch (error) {
      await this.userService.deleteUserById(user.id)

      return next(
        new AppError(
          'There was an error creating your account, Try again later',
          500
        )
      )
    }
  })

  // refactored
  protectRoute = catchAsync(async (req, res, next) => {
    const decoded = await this.authService.getDecoded(req.headers.authorization)

    const user = await this.authService.getLoggedUser(decoded)

    req.user = user

    next()
  })

  // Refactored
  login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) return next(new AppError('All the fields are required, please provide a valid email and password.', 400))

    const user = await this.authService.getUser(email, password)
    const token = this.authService.createToken(user.id)

    // redisClient.client.

    this.sendResponse(res, 200, {
      message: 'Logged in successfully',
      token,
      data: {
        user
      }
    })
  })

  // Refactored
  restrictTo = (...roles) => {
    return (req, res, next) => {
      if (roles.includes('admin') && req.user.isAdmin) return next()

      if (!roles.includes(req.user.role)) {
        return next(new AppError('Your are not authorized to access this route', 403))
      }

      next()
    }
  }

  // Refactored
  isVerified = catchAsync(async (req, res, next) => {
    if (req.user.status !== 'active') return next(new AppError('Your account is not verified, please check your email where we send your instructions and try again', 403))

    next()
  })

  // Refactored
  activateAccount = catchAsync(async (req, res, next) => {
    if (!req.params.token) return next(new AppError('Por favor ingresa un token valido', 400))

    //  get user based on the token
    const hashedToken = this.authService.hashToken(req.params.token)

    await this.authService.activateAccount(hashedToken)

    //  Send the response to the client
    this.sendResponse(res, 200, {
      success: true,
      message: 'Your account has been activated successfully'
    })
  })

  // Refactored
  forgotPassword = catchAsync(async (req, res, next) => {
    if (!req.body.email) return next(new AppError('An email is required', 400))

    const { user, url } = await this.authService.forgotPassword(req.body.email)

    try {
      await new Email(user, url).sendResetToken()

      this.sendResponse(res, 200, {
        success: true,
        message: 'We sent a email with instructions for recovering your account'
      })
    } catch (error) {
      await this.authService.deletePasswordToken(user)

      return next(
        new AppError(
          'There was an error sending the email, Try again later',
          500
        )
      )
    }
  })

  // Refactored
  resetPassword = catchAsync(async (req, res, next) => {
    if (!req.params.token) return next(new AppError('Por favor ingresa un token valido', 400))
    if (!req.body.password || !req.body.passwordConfirm) return next(new AppError('All fields are required', 400))

    //  Get user based on token
    const hashedToken = this.authService.hashToken(req.params.token)

    const user = await this.authService.resetPassword(hashedToken, req.body)
    const token = this.authService.createToken(user.id)

    this.sendResponse(res, 200, {
      message: 'Password has been reseted successfully',
      token,
      data: {
        user
      }
    })
  })

  // Refactored
  logout = (req, res) => {
    res.clearCookie('token')

    res.status(200).json({
      status: 'success'
    })
  }

  // Refactored
  updatePassword = catchAsync(async (req, res, next) => {
    const user = await this.authService.updatePassword(req)
    const token = this.authService.createToken(user.id)

    this.sendResponse(res, 200, {
      message: 'Password updated successfully',
      token,
      data: {
        user
      }
    })
  })
}

export const authController = new AuthenticationController()
