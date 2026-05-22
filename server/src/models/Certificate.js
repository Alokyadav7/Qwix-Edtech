import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon" },
    certificateId: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    verificationUrl: String,
    pdfUrl: String,
    blockchainHash: String
  },
  { timestamps: true }
);

export const Certificate = mongoose.model("Certificate", certificateSchema);

