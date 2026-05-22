import mongoose from "mongoose";

const contestSubmissionSchema = new mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    score: {
      type: Number,
      min: 0,
      default: 0
    },
    summary: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

contestSubmissionSchema.index({ contest: 1, score: -1 });

export const ContestSubmission = mongoose.model("ContestSubmission", contestSubmissionSchema);

