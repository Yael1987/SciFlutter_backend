import express from 'express'
import fileUpload from 'express-fileupload'

import articleController from '../controllers/ArticleController.js'
import draftController from '../controllers/DraftController.js'

import { uploadArticleImgs, uploadArticleMainImg } from '../controllers/imagesController.js'
import { authController } from '../controllers/AuthController.js'

const router = express.Router()

router.use(fileUpload())

router.get('/saves', authController.protectRoute, articleController.getSavedArticles)
router.get('/myArticles', authController.protectRoute, articleController.getMyArticles)
router.get('/filters', articleController.getSearchFilters)

router.get('/', articleController.getAllArticles) //  Obtener todos los articulos
router.get('/drafts', authController.protectRoute, draftController.getDrafts) //  Obtener todos los articulos
router.get('/:articleId', articleController.getArticleById) //  Obtener un articulo

router.use(authController.protectRoute)

router.get('/:articleId/requested', authController.restrictTo('admin'), articleController.getRequestedArticle) //  Obtener un articulo

router.post('/upload-img/:draftId', uploadArticleImgs)
router.post('/delete-img/:imgKey', uploadArticleImgs)

router.post('/', authController.isVerified, uploadArticleMainImg, articleController.createArticle) // Publicar un articulo

router.post('/publishDraft/:draftId', draftController.verifyOwner, draftController.clearDraft, uploadArticleMainImg, articleController.createArticle)

router.route('/drafts')
  .post(authController.isVerified, draftController.createDraft)

router.route('/copyDraft/:draftId')
  .post(authController.isVerified, draftController.verifyOwner, draftController.copyDraft)

router.route('/drafts/:draftId')
  .get(draftController.verifyOwner, draftController.getOneDraft)
  .patch(draftController.verifyOwner, uploadArticleMainImg, draftController.saveChanges)
  .delete(draftController.verifyOwner, draftController.deleteDraft)

router.route('/:articleId')
  .patch(articleController.verifyOwner, uploadArticleMainImg, articleController.updateArticle) //  Editar un articulo
  .delete(articleController.verifyOwner, articleController.deleteArticle) // ELiminar un articulo

export {
  router
}
