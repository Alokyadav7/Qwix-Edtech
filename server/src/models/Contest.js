import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    testCases: { type: [mongoose.Schema.Types.Mixed], default: [] },
    timeLimit: Number,
    memoryLimit: Number,
    points: { type: Number, default: 100 }
  },
  { timestamps: false }
);

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: String,
    type: { type: String, enum: ["coding", "quiz", "hackathon"], default: "coding", index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    duration: Number,
    maxParticipants: Number,
    isTeamContest: { type: Boolean, default: false },
    teamSize: { min: Number, max: Number },
    problems: { type: [problemSchema], default: [] },
    prizes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    eligibility: { colleges: [String], minCGPA: Number, skills: [String] },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["upcoming", "live", "ended"], default: "upcoming", index: true },
    leaderboard: { type: [mongoose.Schema.Types.Mixed], default: [] },
    sponsoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    antiCheatEnabled: { type: Boolean, default: true },
    proctoring: { webcam: Boolean, screenShare: Boolean },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

contestSchema.virtual("participantsCount").get(function participantsCount() {
  return this.registeredUsers.length;
});

export const Contest = mongoose.model("Contest", contestSchema);

