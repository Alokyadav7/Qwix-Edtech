import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    format: {
      type: String,
      enum: ["coding", "quiz", "hackathon", "hiring-challenge"],
      default: "coding"
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    languages: {
      type: [String],
      default: ["javascript"]
    },
    startsAt: {
      type: Date,
      required: true
    },
    endsAt: {
      type: Date,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);

