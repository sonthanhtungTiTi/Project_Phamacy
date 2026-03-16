import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  messageType: {
    type: String,
    enum: ["text", "image", "video_call_log"],
    default: "text"
  },
  content: String,
  imageUrl: String,
  metadata: {
    duration: Number,
    callStatus: {
      type: String,
      enum: ["completed", "missed", "declined"],
      default: null
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Message", messageSchema);
