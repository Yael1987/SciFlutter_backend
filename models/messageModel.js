import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  sender: mongoose.Schema.ObjectId,
  receiver: mongoose.Schema.ObjectId,
  content: String,
  createdAt: Date,
  status: String,
  chatId: mongoose.Schema.ObjectId,
})

const Message = mongoose.model("Message", messageSchema);

export default Message;