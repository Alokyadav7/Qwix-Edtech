import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "application_update",
        "contest_start",
        "contest_reminder",
        "contest_result",
        "hackathon_update",
        "job_match",
        "interview_scheduled",
        "certificate_earned",
        "message",
        "system"
      ],
      required: true
    },
    title: { type: String, required: true },
    body: String,
    data: mongoose.Schema.Types.Mixed,
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    action: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);

