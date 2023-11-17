import express from "express";
import messageController, { deleteOneChat, updateOneChat } from "../controllers/messageController.js";
import { authController } from "../controllers/authController.js";

const router = express.Router();

// router.use(authController.protectRoute)
router.post("/:receiverId", messageController.sendMessage);

router.get("/", messageController.getChats);

router.route("/:chatId")
  .patch(messageController.getOneChat)
  .patch(updateOneChat)
  .delete(deleteOneChat);

export { router };