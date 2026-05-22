import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    collegeName: { type: String, trim: true, index: true },
    website: String,
    location: String,
    contactPerson: { name: String, email: String, phone: String },
    isVerified: { type: Boolean, default: false },
    departments: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const College = mongoose.model("College", collegeSchema);

