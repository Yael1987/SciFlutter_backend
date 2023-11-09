import express from "express";
import { followAuthor, likeArticle, saveArticle, saveAsPdf, unfollowAuthor, unlikeArticle, unsaveArticle } from "../controllers/featuresController.js";

const router = express.Router();

router.route("/saveArticle/:articleId")
  .post(saveArticle)
  .delete(unsaveArticle)

router.route("/likeArticle/:articleId")
  .post(likeArticle)
  .delete(unlikeArticle)

router.route("/followAuthor/:authorID")
  .post(followAuthor)
  .delete(unfollowAuthor)

router.get("/savePdf/:articleId", saveAsPdf)

export {
  router
}