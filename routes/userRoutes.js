import express from "express";
import { authController, changePassword, login, resetPassword } from "../controllers/authController.js";
import userController from "../controllers/userController.js";

const router = express.Router();

//Public routes
router.post("/signup", authController.signup); //Crear cuenta
router.post("/login", login); //Iniciar sesion
router.post("/forgotPassword", resetPassword); //Recuperar cuenta
router.get("/", userController.getAllUsers); //Obtener todos los usuarios
router.get("/authors", userController.getAuthors); //Obtener todos los autores
router.get("/:id", userController.getOneUser); //Obtener un usuario o mi perfil

//Private routes
router.route("/:id")
  .patch(userController.updateUser) //Actualizar usuario o desactivar cuenta
  .delete(userController.deleteUser); //Borrar cuenta

router.patch("/:id/updatePassword", changePassword)//Actualizar contraseña

export {
  router
}; 