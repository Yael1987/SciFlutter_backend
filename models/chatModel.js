import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  users: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: [true, "A chat must belong to a two users"]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  readBy: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: true
    }
  ],
  readAt: {
    type: Date,
  }
})

chatSchema.index({ users: 1 });
chatSchema.index({ readBy: 1 });

chatSchema.pre("save", function (next) {
  if (this.readBy.length === this.users.length) {
    this.readAt = Date.now();
  }

  next();
})

chatSchema.methods.addUserToReadBy = function (userId) {
  if (!this.readBy.includes(userId)) {
    this.readBy.push(userId);
  }
}

chatSchema.methods.removeUserFromReadBy = function (userId) {
  this.readBy = this.readBy.filter(id => id.toString() !== userId.toString());
}

chatSchema.methods.removeReceiverFromReadBy = function (userId) {
  if (this.readBy.length > 1 && this.readBy.length) { 
    this.readBy = this.readBy.filter(id => id.toString() === userId.toString());
  }
}

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;