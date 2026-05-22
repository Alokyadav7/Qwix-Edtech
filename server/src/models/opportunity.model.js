import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    organization: {
      type: String,
      required: true,
      trim: true
    },
    kind: {
      type: String,
      enum: ["internship", "job", "hackathon", "contest"],
      required: true
    },
    location: {
      type: String,
      default: "Remote",
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    skills: {
      type: [String],
      default: []
    },
    stipend: {
      type: Number,
      min: 0
    },
    deadline: {
      type: Date
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

opportunitySchema.index({ title: "text", organization: "text", skills: "text" });

export const Opportunity = mongoose.model("Opportunity", opportunitySchema);

