//Name
//LastName
//Email
//Password
//ConfirmPassword
//Role
//Status
//Photos : [Profile, Cover]
//TwoStepsAuthentication:
//PhoneNumber
//Settings
//Description
//SocialLinks
//Discipline

import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your first name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email address"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "You must pass a valid email"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "Your password must be at least 8 characters long"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      //This only works on create and save
      validator: function (value) {
        return value === this.password;
      },
      message: "Passwords do not match",
    },
  },
  role: {
    type: String,
    enum: ["author", "admin", "user"],
    default: "user",
  },
  photos: {
    profile: {
      type: String,
      default: "defaultProfilePic.jpg",
    },
    cover: {
      type: String,
      default: "defaultCoverPic.jpg",
    },
  },
  twoStepsAuthentication: {
    type: Boolean,
    default: false,
  },
  phoneNumber: {
    type: Number,
    maxLength: [10, "Please enter a valid phone number"],
    minLength: [10, "Please enter a valid phone number"],
  },
  status: {
    type: String,
    enum: ["unconfirmed", "active", "desactivated"],
    default: "unconfirmed",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  description: {
    type: String,
    maxLength: [100, "Your description must be less than 100 characters"],
  },
  socialLinks: [
    {
      type: String,
      validate: [validator.isURL, "Please provide a valid social link"]
    },
  ],
  discipline: String,
});

const User = mongoose.model("User", userSchema);

export default User;