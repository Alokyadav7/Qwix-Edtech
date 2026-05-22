import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    sessionType: { type: String, enum: ["technical", "hr", "behavioral", "system-design"], required: true },
    targetRole: { type: String, required: true },
    targetCompany: String,
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    duration: { type: Number, default: 30 },
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    responses: { type: [mongoose.Schema.Types.Mixed], default: [] },
    overallScore: Number,
    overallFeedback: String,
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    finalReport: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
    completedAt: Date
  },
  { timestamps: true }
);

export const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);

