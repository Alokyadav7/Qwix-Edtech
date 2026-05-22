import crypto from "node:crypto";
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    projectName: String,
    description: String,
    techStack: [String],
    githubUrl: String,
    demoUrl: String,
    videoUrl: String,
    presentation: String,
    submittedAt: Date
  },
  { _id: false }
);

const hackathonTeamSchema = new mongoose.Schema(
  {
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true, index: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    teamName: { type: String, required: true },
    description: String,
    lookingFor: { type: [String], default: [] },
    inviteCode: { type: String, default: () => crypto.randomBytes(4).toString("hex"), unique: true },
    submission: submissionSchema,
    judging: { type: [mongoose.Schema.Types.Mixed], default: [] },
    weightedScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

hackathonTeamSchema.index({ hackathon: 1, teamName: 1 }, { unique: true });

export const HackathonTeam = mongoose.model("HackathonTeam", hackathonTeamSchema);

