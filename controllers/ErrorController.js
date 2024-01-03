import 'dotenv/config'
import AppError from '../utils/AppError.js'

export default class ErrorController {
  environment
  errorStatusCode = 500
  errorStatus = 'error'
  errorName
  errorCode

  constructor (environment) {
    this.environment = environment
  }

  handleError (err, req, res) {
    this.error = Object.assign(err)

    if (this.environment === 'production') {
      if (this.error.name === 'CastError') this.handleCastErrorDB()
      if (this.error.code === 11000) this.handleDuplicateErrorDB()
      if (this.error.name === 'ValidationError') this.handleValidationErrorDB()
      if (this.error.name === 'JsonWebTokenError') this.handleJWTError()
      if (this.error.name === 'TokenExpiredError') this.handleJWTExpiredError()

      this.sendErrorProd(req, res)
    } else if (this.environment === 'development') {
      this.sendErrorDev(req, res)
    }
  }

  sendErrorDev (req, res) {
    res.status(this.errorStatusCode).json({
      success: false,
      status: this.errorStatus,
      error: this.error,
      message: this.error.message,
      stack: this.error.stack
    })
  }

  sendErrorProd (req, res) {
    if (this.error.isOperational) {
      return res.status(this.error.statusCode).json({
        success: false,
        status: this.error.status,
        message: this.error.message
      })
    }

    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong'
    })
  }

  handleCastErrorDB () {
    const message = `Invalid ${this.error.path}: ${this.error.value}`

    this.error = new AppError(message, 400)
  }

  handleDuplicateErrorDB () {
    const value = this.error.match(/(["'])(\\?.)*?\1/)[0]

    const message = `Duplicate field value: ${value}. Please use another value.`

    this.error = new AppError(message, 400)
  }

  handleValidationErrorDB () {
    const errors = Object.values(this.error.errors).map((el) => el.message)

    const message = `Invalid input data. ${errors.join('. ')}`

    this.error = new AppError(message, 400)
  }

  handleJWTError = () => {
    const message = 'Invalid token. Please login again!'
    this.error = new AppError(message, 401)
  }

  handleJWTExpiredError = () => {
    const message = 'Your token has expired. Please login again!'
    this.error = new AppError(message, 401)
  }
}

const errorController = new ErrorController(process.env.NODE_ENV)

export const globalErrorHandler = (err, req, res, next) => {
  errorController.handleError(err, req, res)
}
