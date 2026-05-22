import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true
    },
    status: {
      type: String,
      enum: ["saved", "applied", "shortlisted", "interview", "rejected", "hired"],
      default: "applied"
    }
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);

