import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["student", "company", "college", "admin"],
      default: "student"
    },
    skills: {
      type: [String],
      default: []
    },
    organizationName: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

