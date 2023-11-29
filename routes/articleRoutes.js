import express from 'express'
import fileUpload from 'express-fileupload'

import articleController from '../controllers/articleController.js'

import { uploadArticleImgs, uploadArticleMainImg } from '../controllers/imagesController.js'
import { authController } from '../controllers/authController.js'

const router = express.Router()

router.use(fileUpload())

router.get('/', articleController.getArticles) //  Obtener todos los articulos
router.get('/:articleId', articleController.getOneArticle) //  Obtener un articulo
router.get('/user', articleController.getUserArticles)

router.use(authController.protectRoute)

router.post('/upload-img/:draftId', uploadArticleImgs)
router.post('/delete-img/:imgKey', uploadArticleImgs)

router.post('/', authController.isVerified, uploadArticleMainImg, articleController.createArticle) // Publicar un articulo

router.post('/publishDraft/:draftId', uploadArticleMainImg, articleController.publishDraft)

router.route('/drafts')
  .post(authController.isVerified, articleController.createDraft)
  .get(articleController.getDrafts)

router.route('/drafts/:articleId')
  .patch(articleController.verifyOwner, articleController.saveDraftChanges)
  .delete(articleController.verifyOwner, articleController.deleteDraft)

router.route('/:articleId')
  .patch(articleController.verifyOwner, uploadArticleMainImg, articleController.updateArticle) //  Editar un articulo
  .delete(articleController.verifyOwner, articleController.deleteArticle) // ELiminar un articulo

export {
  router
}
