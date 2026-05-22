import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [], index: true },
    workMode: { type: String, enum: ["remote", "hybrid", "onsite"], default: "remote" },
    location: String,
    durationMonths: Number,
    stipendMin: Number,
    stipendMax: Number,
    currency: { type: String, default: "INR" },
    openings: { type: Number, default: 1 },
    applicationDeadline: Date,
    status: { type: String, enum: ["draft", "active", "paused", "closed"], default: "active", index: true },
    isSponsored: { type: Boolean, default: false },
    atsKeywords: { type: [String], default: [] },
    applicationsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

internshipSchema.index({ title: "text", description: "text", skills: "text", location: "text" });

export const Internship = mongoose.model("Internship", internshipSchema);

