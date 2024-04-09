import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { promisify } from 'util'

import AppError from '../utils/AppError.js'
import UserService from './UserService.js'

function signToken (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}
export default class AuthService extends UserService {
  createToken = (id) => {
    const token = signToken(id)

    return token
  }

  getDecoded = async (authorization) => {
    let token
    if (authorization?.startsWith('Bearer ')) {
      token = authorization.split(' ')[1]
    }

    if (!token) throw new AppError('You are not logged in, please login and try again', 401)

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    return decoded
  }

  hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  getLoggedUser = async (decoded) => {
    const user = await this.userRepository.getDocumentById(decoded.id)

    if (!user) throw new AppError('The user belogin this token does not longer exist.', 401)

    if (await user.changedPasswordAfter(decoded.iat)) throw new AppError('Your password has been changed since you logged in.', 401)

    return user
  }

  activateAccount = async (token) => {
    const user = await this.userRepository.getDocument({ activationToken: token })

    //  Checks if the user exists
    if (!user) throw new AppError('The user belonging to this token does not exist', 404)

    //  Update the user status and clear the activation token
    user.activationToken = undefined
    user.status = 'active'

    await user.save({ validateBeforeSave: false })
  }

  getUser = async (email, password) => {
    const user = await this.verifyPassword({ email }, password)

    if (user.status === 'deactivated') {
      user.status = 'active'
      await user.save({
        validateBeforeSave: false
      })
    }

    return user
  }

  forgotPassword = async (email) => {
    const user = await this.userRepository.getDocument({ email })

    if (!user) throw new AppError('No such user found for that email address', 404)

    const resetToken = user.createResetToken()
    await user.save({ validateBeforeSave: false })

    const url = `${process.env.FRONTEND_URL}/recover/${resetToken}`

    return { user, url }
  }

  resetPassword = async (token, data) => {
    const user = await this.userRepository.getDocument({
      passwordResetToken: token,
      passwordResetExpires: {
        $gt: Date.now()
      }
    })

    if (!user) throw new AppError('Password reset token is invalid or has been expired', 400)

    user.password = data.password
    user.passwordConfirm = data.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()
  }

  updatePassword = async (req) => {
    const user = this.verifyPassword({ id: req.user.id }, req.body.password)

    user.password = req.body.newPassword
    user.passwordConfirm = req.body.newPasswordConfirm

    await user.save()
    return user
  }

  deletePasswordToken = async (user) => {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save({ validateBeforeSave: false })
  }
}
