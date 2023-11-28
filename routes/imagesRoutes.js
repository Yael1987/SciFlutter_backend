import express from 'express'
import fileUpload from 'express-fileupload'

import {
  followAuthor,
  likeArticle,
  saveArticle,
  saveAsPdf,
  saveUserPics,
  unfollowAuthor,
  unlikeArticle,
  unsaveArticle,
} from '../controllers/imageController.js'

const router = express.Router()

router.use(fileUpload())

router.route('/upload-article-img')
  .post(saveArticle)

router.route('/upload-pics')
  .post(saveUserPics, likeArticle)

router.route('/:fileName')
  .get(followAuthor)

export { router }
