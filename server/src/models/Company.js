import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, trim: true, index: true },
    logo: String,
    website: String,
    industry: String,
    size: { type: String, enum: ["startup", "small", "medium", "large", "enterprise"] },
    description: String,
    location: String,
    founded: Number,
    isVerified: { type: Boolean, default: false, index: true },
    verificationDoc: String,
    socialLinks: { linkedin: String, twitter: String },
    contactPerson: { name: String, email: String, phone: String },
    subscription: {
      plan: { type: String, default: "free" },
      expiry: Date,
      jobPostsUsed: { type: Number, default: 0 },
      jobPostsLimit: { type: Number, default: 3 }
    }
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);

