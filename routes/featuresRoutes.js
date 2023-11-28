import express from 'express'
import featuresController, { saveAsPdf } from '../controllers/featuresController.js'
import { authController } from '../controllers/authController.js'

const router = express.Router()

router.use(authController.protectRoute)

router.route('/saveArticle/:id')
  .post(featuresController.createFeatureDocument('Favorite'))
  .delete(featuresController.deleteFeatureDocument('Favorite'))

router.route('/likeArticle/:id')
  .post(featuresController.createFeatureDocument('Like'))
  .delete(featuresController.deleteFeatureDocument('Like'))

router.route('/followAuthor/:id')
  .post(featuresController.createFeatureDocument('Follow'))
  .delete(featuresController.deleteFeatureDocument('Follow'))

router.get('/savePdf/:articleId', saveAsPdf)

export {
  router
}
