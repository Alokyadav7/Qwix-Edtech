import mongoose from "mongoose";

const contestSubmissionSchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    problem: { type: mongoose.Schema.Types.ObjectId, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    verdict: { type: String, enum: ["PENDING", "AC", "WA", "TLE", "MLE", "RE", "CE"], default: "PENDING" },
    executionTime: Number,
    memoryUsed: Number,
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    isChecked: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false }
  },
  { timestamps: true }
);

contestSubmissionSchema.index({ contest: 1, user: 1, score: -1, submittedAt: 1 });

export const ContestSubmission = mongoose.model("ContestSubmission", contestSubmissionSchema);

