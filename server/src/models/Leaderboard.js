import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true, unique: true },
    entries: {
      type: [
        {
          rank: Number,
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          username: String,
          avatar: String,
          score: Number,
          problemsSolved: Number,
          timeTaken: Number,
          lastSubmission: Date
        }
      ],
      default: []
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

