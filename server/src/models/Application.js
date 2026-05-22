import mongoose from "mongoose";
import { APPLICATION_STATUSES } from "../config/constants.js";

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship", index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    resumeSnapshot: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, enum: APPLICATION_STATUSES, default: "applied", index: true },
    coverLetter: String,
    answers: { type: [mongoose.Schema.Types.Mixed], default: [] },
    atsScore: { type: Number, default: 0, min: 0, max: 100, index: true },
    timeline: {
      type: [
        {
          status: String,
          note: String,
          date: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    interviewScheduled: { date: Date, link: String, type: String },
    companyNotes: { type: String, select: false },
    studentRating: { type: Number, min: 1, max: 5 }
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, job: 1 }, { unique: true, partialFilterExpression: { job: { $exists: true } } });
applicationSchema.index(
  { student: 1, internship: 1 },
  { unique: true, partialFilterExpression: { internship: { $exists: true } } }
);

export const Application = mongoose.model("Application", applicationSchema);

