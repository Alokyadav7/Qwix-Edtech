import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: String,
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending", index: true },
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);

