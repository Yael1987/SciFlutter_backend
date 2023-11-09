import express from "express";
import messageController, { deleteOneChat, updateOneChat } from "../controllers/messageController.js";

const router = express.Router();

router.post("/:receiverId", messageController.sendMessage);

router.get("/", messageController.getChats);

router.route("/:chatId")
  .get(messageController.getOneChat)
  .patch(updateOneChat)
  .delete(deleteOneChat);

export {
  router
}