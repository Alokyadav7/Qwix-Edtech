import crypto from "node:crypto";
import { Certificate } from "../models/Certificate.js";
import { Student } from "../models/Student.js";
import { generateCertificatePdf } from "../services/pdf.service.js";
import { createNotification } from "../services/notification.service.js";
import { getSignedDownloadUrl, uploadBuffer } from "../services/s3.service.js";
import { ApiError } from "../utils/ApiError.js";

export async function generate(request, response) {
  const student = await Student.findById(request.body.studentId).populate("user");
  if (!student) throw new ApiError(404, "Student was not found.");
  const certificateId = `CERT-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const verificationUrl = `${request.protocol}://${request.get("host")}/api/certificates/verify/${certificateId}`;
  const pdf = await generateCertificatePdf({
    name: student.user.name,
    title: request.body.title,
    certificateId,
    verificationUrl,
    issueDate: new Date()
  });
  const pdfUrl = await uploadBuffer({ buffer: pdf, contentType: "application/pdf", folder: "certificates", filename: `${certificateId}.pdf` });
  const certificate = await Certificate.create({ ...request.body, student: student.id, certificateId, verificationUrl, pdfUrl });
  await createNotification({ userId: student.user.id, type: "certificate_earned", title: request.body.title, body: "Your certificate is ready.", action: `/certificates/${certificate.id}` });
  response.status(201).json({ success: true, data: { certificate } });
}

export async function verify(request, response) {
  const certificate = await Certificate.findOne({ certificateId: request.params.certificateId }).populate({ path: "student", populate: "user" });
  response.json({ success: true, data: certificate ? { valid: true, certificate } : { valid: false } });
}

export async function mine(request, response) {
  const student = await Student.findOne({ user: request.user.id });
  const certificates = await Certificate.find({ student: student.id }).sort({ issueDate: -1 });
  response.json({ success: true, data: { certificates } });
}

export async function download(request, response) {
  const student = await Student.findOne({ user: request.user.id });
  const certificate = await Certificate.findOne({ _id: request.params.id, student: student.id });
  if (!certificate) throw new ApiError(404, "Certificate was not found.");
  response.json({ success: true, data: { url: await getSignedDownloadUrl(certificate.pdfUrl) } });
}

