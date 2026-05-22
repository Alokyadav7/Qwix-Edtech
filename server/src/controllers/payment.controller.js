import { PAYMENT_PLANS } from "../config/constants.js";
import { env } from "../config/env.js";
import { Payment } from "../models/Payment.js";
import { Student } from "../models/Student.js";
import { queueEmail } from "../jobs/email.job.js";
import { createRazorpayOrder, getPlan, verifyPaymentSignature, verifyWebhookSignature } from "../services/payment.service.js";
import { ApiError } from "../utils/ApiError.js";

export async function createOrder(request, response) {
  const plan = getPlan(request.body.plan);
  const order = await createRazorpayOrder(request.body.plan, `payment_${Date.now()}`);
  const payment = await Payment.create({
    user: request.user.id,
    plan: request.body.plan,
    amount: plan.amount,
    razorpayOrderId: order.id
  });
  response.status(201).json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, key: env.razorpay.keyId, paymentId: payment.id } });
}

export async function verify(request, response) {
  if (!verifyPaymentSignature({
    orderId: request.body.razorpay_order_id,
    paymentId: request.body.razorpay_payment_id,
    signature: request.body.razorpay_signature
  })) throw new ApiError(400, "Payment signature is invalid.");

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: request.body.razorpay_order_id, user: request.user.id },
    { status: "success", razorpayPaymentId: request.body.razorpay_payment_id },
    { new: true }
  );
  if (!payment) throw new ApiError(404, "Payment was not found.");
  const plan = PAYMENT_PLANS[payment.plan];
  if (request.user.role === "student" && plan.duration) {
    await Student.updateOne({ user: request.user.id }, {
      premiumMember: true,
      premiumExpiry: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000)
    });
  }
  await queueEmail({ to: request.user.email, subject: "Payment confirmed", text: "Your payment was confirmed.", html: "<p>Your payment was confirmed.</p>" });
  response.json({ success: true, data: { payment, features: plan.features ?? [] } });
}

export async function webhook(request, response) {
  const rawBody = request.rawBody ?? Buffer.from(JSON.stringify(request.body));
  if (!verifyWebhookSignature(rawBody, request.get("x-razorpay-signature"))) throw new ApiError(400, "Webhook signature is invalid.");
  const paymentId = request.body.payload?.payment?.entity?.id;
  if (request.body.event === "payment.failed") await Payment.updateOne({ razorpayPaymentId: paymentId }, { status: "failed" });
  response.json({ received: true });
}

export async function history(request, response) {
  response.json({ success: true, data: { payments: await Payment.find({ user: request.user.id }).sort({ createdAt: -1 }) } });
}

