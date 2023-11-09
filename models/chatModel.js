import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  users: [
    mongoose.Schema.ObjectId
  ],
  createdAt: Date,
  status: String,
})

chatSchema.index({ users: 1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;