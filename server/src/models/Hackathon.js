import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    theme: String,
    description: String,
    banner: String,
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    registrationStart: Date,
    registrationEnd: Date,
    hackStart: Date,
    hackEnd: Date,
    mode: { type: String, enum: ["online", "offline", "hybrid"], default: "online", index: true },
    venue: String,
    maxTeams: Number,
    rounds: { type: [mongoose.Schema.Types.Mixed], default: [] },
    judgingCriteria: { type: [mongoose.Schema.Types.Mixed], default: [] },
    prizes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    judges: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    submissionFormat: String,
    techStack: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "upcoming", "live", "judging", "announced", "ended"], default: "upcoming", index: true },
    soloParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    winners: { type: [mongoose.Schema.Types.Mixed], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);

