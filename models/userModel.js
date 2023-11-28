import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your first name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'You must pass a valid email'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: [8, 'Your password must be at least 8 characters long'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on create and save
      validator: function (value) {
        return value === this.password
      },
      message: 'Passwords do not match'
    }
  },
  role: {
    type: String,
    enum: ['author', 'admin', 'user'],
    default: 'user'
  },
  photos: {
    profile: {
      type: String,
      default: 'defaultProfilePic.jpg'
    },
    cover: {
      type: String,
      default: 'defaultCoverPic.jpg'
    }
  },
  twoStepsAuthentication: {
    type: Boolean,
    default: false
  },
  phoneNumber: {
    type: Number,
    maxLength: [10, 'Please enter a valid phone number'],
    minLength: [10, 'Please enter a valid phone number']
  },
  status: {
    type: String,
    enum: ['unconfirmed', 'active', 'desactivated'],
    default: 'unconfirmed'
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  description: {
    type: String,
    maxLength: [100, 'Your description must be less than 100 characters']
  },
  socialLinks: [
    {
      type: String,
      validate: [validator.isURL, 'Please provide a valid social link']
    }
  ],
  discipline: String,
  activationToken: String
})

//  Hash the password before the user has been created in the database
userSchema.pre('save', async function (next) {
  //  If the password has not been modified just skip the middleware
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})

//  Look for all the queries that starts with 'find' and checks that just users that are currently active are returned
userSchema.pre(/^find/, function (next) {
  //  this points to the current query
  this.find({ status: { $ne: 'desactivated' } })
  next()
})

userSchema.methods.correctPassword = async function (candidatePassword, password) {
  return await bcrypt.compare(candidatePassword, password)
}

userSchema.methods.createActivationToken = function () {
  const activationToken = crypto.randomBytes(32).toString('hex')

  this.activationToken = crypto.createHash('sha256').update(activationToken).digest('hex')

  return activationToken
}

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

userSchema.methods.changedPasswordAfter = async function (JSTTimeStamp) {
  if (this.passwordChangedAt) {
    const chagedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

    return chagedTimeStamp > JSTTimeStamp
  }

  return false
}

const User = mongoose.model('User', userSchema)

export default User
