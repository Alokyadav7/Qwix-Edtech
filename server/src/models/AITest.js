import mongoose from "mongoose";

const aiTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    topic: { type: String, required: true, index: true },
    difficulty: { type: String, default: "mixed" },
    duration: { type: Number, required: true },
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    createdBy: { type: String, enum: ["ai", "admin", "company"], default: "ai" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    targetRole: String,
    skills: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const AITest = mongoose.model("AITest", aiTestSchema);

