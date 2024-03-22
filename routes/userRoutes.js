import express from 'express'
import fileUpload from 'express-fileupload'

import { authController } from '../controllers/authController.js'
import userController from '../controllers/userController.js'
import { saveUserPics } from '../controllers/imagesController.js'

const router = express.Router()

router.use(fileUpload())

//   Public routes
router.post('/signup', authController.signup) //  Create a new account
router.post('/login', authController.login) //  Log in
router.post('/forgotPassword', authController.forgotPassword) //  Recover my account if I forgot password
router.patch('/resetPassword/:token', authController.resetPassword) //  Reset my password, the token is sent on email
router.patch('/confirm/:token', authController.activateAccount) //  This change the account state to active, the token is sent on email

router.get('/', authController.restrictTo('admin'), userController.getAllUsers) //  We retreive the users, you can filter the results using the filter params
router.get('/me', authController.protectRoute, userController.getMe)
router.get('/authors', userController.getAuthors) //  We retreive just the users that are authors
router.get('/:id', userController.getOneUser) //  We retreive a user based on the userId, the id parameter is the id of the user
router.get('/:id/stats', userController.getUserStats) //  We retreive a user based on the userId, the id parameter is the id of the user

//  Private routes
router.use(authController.protectRoute) //  Middleware that will protect some routes against unauthorized access, you need an access token for that

router.route('/me')
  .patch(authController.isVerified, saveUserPics, userController.updateUser) //  Updates the user information, except the password, this route is also for desactivate the user account
  .delete(userController.deleteUser) //  Deletes the user account, for this you need to pass the userId and current password, this will delete the user account from db

router.patch('/me/deactivateAccount', userController.deactivateMe)
router.patch('/me/updatePassword', authController.updatePassword)//  Updates the user password, this updates the passwordChangeAfter field in the user account document

export {
  router
}
