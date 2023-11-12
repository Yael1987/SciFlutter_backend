import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: [true, "A message cannot be empty"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  chatId: {
    type: mongoose.Schema.ObjectId,
    ref: "Chat",
  },
  status: {
    type: String,
    enum: ["read", "unread"],
    default: "unread",
  },
  readAt: Date,
});

messageSchema.pre(/^find/, async function (next) {
  const chatId = this.getQuery().chatId;
  const chat = await mongoose.model("Chat").findById(chatId);
  
  const allUsersHaveRead = chat.users.length === chat.readBy.length;

  if (allUsersHaveRead){
    await Message.updateMany({ status: "unread" }, { $set: { status: "read", readAt: Date.now() } })
  }

  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;