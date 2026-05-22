import mongoose from "mongoose";

const screeningQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    type: { type: String, enum: ["text", "boolean", "number", "select"], default: "text" },
    required: { type: Boolean, default: false }
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    skills: { type: [String], default: [], index: true },
    type: { type: String, enum: ["fulltime", "parttime", "contract", "freelance"], default: "fulltime" },
    workMode: { type: String, enum: ["remote", "hybrid", "onsite"], default: "onsite", index: true },
    location: { type: String, index: true },
    salaryMin: Number,
    salaryMax: Number,
    salaryCurrency: { type: String, default: "INR" },
    experienceMin: { type: Number, default: 0 },
    experienceMax: Number,
    openings: { type: Number, default: 1 },
    applicationDeadline: Date,
    status: { type: String, enum: ["draft", "active", "paused", "closed"], default: "active", index: true },
    isSponsored: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
    screeningQuestions: { type: [screeningQuestionSchema], default: [] },
    atsKeywords: { type: [String], default: [] },
    reportedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", skills: "text", location: "text" });
jobSchema.virtual("isOpen").get(function isOpen() {
  return this.status === "active" && (!this.applicationDeadline || this.applicationDeadline > new Date());
});

export const Job = mongoose.model("Job", jobSchema);

