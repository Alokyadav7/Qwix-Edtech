import crypto from "node:crypto";
import { Certificate } from "../models/Certificate.js";
import { Student } from "../models/Student.js";
import { createNotification } from "../services/notification.service.js";
import { generateCertificatePdf } from "../services/pdf.service.js";
import { uploadBuffer } from "../services/s3.service.js";
import { getQueue } from "./queues.js";

export const certificateQueue = getQueue("certificate");

// Process queued certificate generation
certificateQueue?.process(async (job) => {
  const { studentId, title, type } = job.data;

  const student = await Student.findById(studentId).populate("user");
  if (!student) return null;

  const certificateId = `CERT-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const verificationUrl = `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/certificates/verify/${certificateId}`;

  const pdf = await generateCertificatePdf({
    name: student.user.name,
    title,
    certificateId,
    verificationUrl,
    issueDate: new Date()
  });

  let pdfUrl = "";
  try {
    pdfUrl = await uploadBuffer({
      buffer: pdf,
      contentType: "application/pdf",
      folder: "certificates",
      filename: `${certificateId}.pdf`
    });
  } catch {
    // S3 not configured — store empty URL and let admin re-generate
    pdfUrl = "";
  }

  const certificate = await Certificate.create({
    student: student.id,
    title,
    type: type ?? "achievement",
    certificateId,
    verificationUrl,
    pdfUrl,
    issueDate: new Date()
  });

  await Student.updateOne({ _id: student.id }, { $inc: { "stats.certificatesEarned": 1 } });

  await createNotification({
    userId: student.user.id,
    type: "certificate_earned",
    title,
    body: "Your certificate is ready. Download it from your profile.",
    action: `/certificates/${certificate.id}`
  });

  return certificate;
});

export async function queueCertificate(payload) {
  if (!certificateQueue) {
    // Fallback: process synchronously when Redis is not available
    const { studentId, title, type } = payload;
    const student = await Student.findById(studentId).populate("user");
    if (!student) return null;
    const certificateId = `CERT-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const verificationUrl = `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/certificates/verify/${certificateId}`;
    const certificate = await Certificate.create({
      student: student.id,
      title,
      type: type ?? "achievement",
      certificateId,
      verificationUrl,
      pdfUrl: "",
      issueDate: new Date()
    });
    await createNotification({ userId: student.user.id, type: "certificate_earned", title, body: "Your certificate is ready.", action: `/certificates/${certificate.id}` });
    return certificate;
  }
  return certificateQueue.add(payload, { attempts: 3, backoff: 3000 });
}
