import express from "express";
import articleController from "../controllers/articleController.js";

const router = express.Router();

router.route("/")
  .get(articleController.getArticles) //Obtener todos los articulos
  .post(articleController.createArticle) //Publicar un articulo

router.route("/:articleId")
  .get(articleController.getOneArticle) //Obtener un articulo
  .patch(articleController.updateArticle) //Editar un articulo
  .delete(articleController.deleteArticle) //ELiminar un articulo

export {
  router
}