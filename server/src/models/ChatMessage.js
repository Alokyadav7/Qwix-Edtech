import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    conversation: { type: String, required: true, index: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: String,
    type: { type: String, enum: ["text", "file", "image"], default: "text" },
    fileUrl: String,
    isRead: { type: Boolean, default: false },
    readAt: Date
  },
  { timestamps: true }
);

chatMessageSchema.index({ conversation: 1, createdAt: -1 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

