import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      trim: true,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    experience: {
      type: [String],
      default: []
    },
    projects: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeSchema);

