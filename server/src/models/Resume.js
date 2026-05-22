import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    templateId: { type: String, default: "ats-clean" },
    name: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    pdfUrl: String,
    atsScore: { type: Number, min: 0, max: 100 },
    atsFeedback: mongoose.Schema.Types.Mixed,
    lastAnalyzed: Date,
    targetJobTitle: String,
    keywords: { type: [String], default: [] },
    versions: { type: [mongoose.Schema.Types.Mixed], default: [] }
  },
  { timestamps: true }
);

resumeSchema.index({ student: 1, updatedAt: -1 });

export const Resume = mongoose.model("Resume", resumeSchema);

