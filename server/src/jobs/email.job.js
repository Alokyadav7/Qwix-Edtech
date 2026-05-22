import { getQueue } from "./queues.js";
import { sendEmailNow } from "../services/email.service.js";

export const emailQueue = getQueue("email");

emailQueue?.process(async (job) => sendEmailNow(job.data));

export async function queueEmail(payload) {
  if (!emailQueue) {
    return sendEmailNow(payload);
  }
  return emailQueue.add(payload, { attempts: 3, backoff: { type: "exponential", delay: 2000 } });
}

