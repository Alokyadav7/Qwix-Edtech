import mongoose from "mongoose";

const aiTestAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    aiTest: { type: mongoose.Schema.Types.ObjectId, ref: "AITest", required: true, index: true },
    answers: { type: [mongoose.Schema.Types.Mixed], default: [] },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeTaken: Number,
    feedback: mongoose.Schema.Types.Mixed,
    topicsToImprove: { type: [String], default: [] },
    strongTopics: { type: [String], default: [] },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    status: { type: String, enum: ["in-progress", "submitted", "expired"], default: "in-progress" },
    proctoringFlags: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const AITestAttempt = mongoose.model("AITestAttempt", aiTestAttemptSchema);

