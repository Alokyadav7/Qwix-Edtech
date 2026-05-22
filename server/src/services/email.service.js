import sendgrid from "@sendgrid/mail";
import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

if (env.sendgridApiKey) {
  sendgrid.setApiKey(env.sendgridApiKey);
}

export async function sendEmailNow({ to, subject, html, text }) {
  if (!to) {
    throw new ApiError(500, "Email recipient is missing.");
  }

  if (env.sendgridApiKey) {
    return sendgrid.send({ to, from: env.emailFrom, subject, html, text });
  }

  if (env.nodeEnv !== "production") {
    const transport = nodemailer.createTransport({ jsonTransport: true });
    return transport.sendMail({ to, from: env.emailFrom, subject, html, text });
  }

  throw new ApiError(503, "Email provider is not configured.");
}

