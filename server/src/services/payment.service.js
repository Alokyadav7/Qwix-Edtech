import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";
import { PAYMENT_PLANS } from "../config/constants.js";
import { ApiError } from "../utils/ApiError.js";

function razorpayClient() {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new ApiError(503, "Razorpay is not configured.");
  }
  return new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret });
}

export function getPlan(plan) {
  const selected = PAYMENT_PLANS[plan];
  if (!selected) {
    throw new ApiError(422, "Unknown payment plan.");
  }
  return selected;
}

export async function createRazorpayOrder(plan, receipt) {
  const selected = getPlan(plan);
  return razorpayClient().orders.create({
    amount: selected.amount,
    currency: "INR",
    receipt
  });
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return Boolean(signature) && expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyWebhookSignature(rawBody, signature) {
  const expected = crypto.createHmac("sha256", env.razorpay.webhookSecret).update(rawBody).digest("hex");
  return signature && expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
