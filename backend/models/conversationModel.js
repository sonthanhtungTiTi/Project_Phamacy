import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  type: {
    type: String,
    enum: ["video_call", "text_chat", "mixed"],
    default: "mixed"
  },
  callStatus: {
    type: String,
    enum: ["pending", "ongoing", "completed", "missed", "declined"],
    default: "pending"
  },
  topic: String,
  relatedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
  },
  startTime: Date,
  endTime: Date,
  duration: {
    type: Number,
    default: 0
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Conversation", conversationSchema);
