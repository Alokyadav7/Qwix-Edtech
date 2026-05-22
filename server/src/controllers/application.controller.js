import { getIO } from "../config/socket.js";
import { Application } from "../models/Application.js";
import { Company } from "../models/Company.js";
import { Internship } from "../models/Internship.js";
import { Job } from "../models/Job.js";
import { Resume } from "../models/Resume.js";
import { Student } from "../models/Student.js";
import { createNotification } from "../services/notification.service.js";
import { ApiError } from "../utils/ApiError.js";
import { calculateATSScore, pageOptions, textArray } from "../utils/helpers.js";

async function studentForUser(userId) {
  const student = await Student.findOne({ user: userId });
  if (!student) throw new ApiError(404, "Student profile was not found.");
  return student;
}

async function companyForUser(userId) {
  const company = await Company.findOne({ user: userId });
  if (!company) throw new ApiError(404, "Company profile was not found.");
  return company;
}

export async function apply(request, response) {
  const student = await studentForUser(request.user.id);
  const [job, internship, resume] = await Promise.all([
    request.body.jobId ? Job.findById(request.body.jobId).populate({ path: "company", populate: "user" }) : null,
    request.body.internshipId ? Internship.findById(request.body.internshipId).populate({ path: "company", populate: "user" }) : null,
    request.body.resumeId ? Resume.findOne({ _id: request.body.resumeId, student: student.id }) : null
  ]);
  const opportunity = job ?? internship;
  if (!opportunity) throw new ApiError(404, "Job or internship was not found.");
  if (opportunity.applicationDeadline && opportunity.applicationDeadline < new Date()) throw new ApiError(409, "Application deadline has passed.");
  if (await Application.exists({ student: student.id, ...(job ? { job: job.id } : { internship: internship.id }) })) throw new ApiError(409, "You already applied.");

  const ats = calculateATSScore({
    skills: student.skills,
    projects: student.projects,
    resumeText: JSON.stringify(resume?.data ?? {})
  }, opportunity);
  const application = await Application.create({
    student: student.id,
    job: job?.id,
    internship: internship?.id,
    resume: resume?.id,
    resumeSnapshot: resume?.data,
    coverLetter: request.body.coverLetter,
    answers: request.body.screeningAnswers ?? [],
    atsScore: ats.score,
    timeline: [{ status: "applied", date: new Date() }]
  });
  await Promise.all([
    Student.updateOne({ _id: student.id }, { $inc: { "stats.applicationsSubmitted": 1 } }),
    opportunity.constructor.updateOne({ _id: opportunity.id }, { $inc: { applicationsCount: 1 } }),
    createNotification({
      userId: opportunity.company.user.id,
      type: "application_update",
      title: "New application received",
      body: `${request.user.name} applied for ${opportunity.title}.`,
      action: `/applications/${application.id}`
    })
  ]);
  getIO()?.of("/notifications").to(`user:${opportunity.company.user.id}`).emit("application-received", { applicationId: application.id });
  response.status(201).json({ success: true, data: { application, ats } });
}

export async function mine(request, response) {
  const student = await studentForUser(request.user.id);
  const applications = await Application.find({ student: student.id })
    .populate({ path: "job", populate: "company" })
    .populate({ path: "internship", populate: "company" })
    .sort({ createdAt: -1 });
  response.json({ success: true, data: { applications } });
}

export async function jobApplicants(request, response) {
  const company = await companyForUser(request.user.id);
  const job = await Job.findOne({ _id: request.params.jobId, company: company.id });
  if (!job) throw new ApiError(404, "Job was not found.");
  const filters = { job: job.id };
  if (request.query.status) filters.status = request.query.status;
  if (request.query.atsMin || request.query.atsMax) filters.atsScore = { $gte: Number(request.query.atsMin ?? 0), $lte: Number(request.query.atsMax ?? 100) };
  const { page, limit, skip } = pageOptions(request.query);
  const applications = await Application.find(filters)
    .populate({ path: "student", populate: "user" })
    .sort(request.query.sort === "date" ? { createdAt: -1 } : { atsScore: -1 })
    .skip(skip)
    .limit(limit);
  const skillFilter = textArray(request.query.skills);
  response.json({
    success: true,
    data: {
      applications: skillFilter.length
        ? applications.filter((item) => item.student.skills.some((skill) => skillFilter.includes(skill)))
        : applications,
      page,
      limit
    }
  });
}

export async function updateStatus(request, response) {
  const company = await companyForUser(request.user.id);
  const application = await Application.findById(request.params.id)
    .populate({ path: "job", populate: "company" })
    .populate({ path: "internship", populate: "company" })
    .populate({ path: "student", populate: "user" });
  const owner = application?.job?.company ?? application?.internship?.company;
  if (!application || owner.id !== company.id) throw new ApiError(404, "Application was not found.");
  application.status = request.body.status;
  application.interviewScheduled = request.body.interviewDetails ?? application.interviewScheduled;
  application.timeline.push({ status: request.body.status, note: request.body.note, date: new Date() });
  await application.save();
  await createNotification({
    userId: application.student.user.id,
    type: request.body.status === "interview" ? "interview_scheduled" : "application_update",
    title: `Application ${request.body.status}`,
    body: request.body.note ?? "Your application status changed.",
    action: `/applications/${application.id}`
  });
  response.json({ success: true, data: { application } });
}

export async function withdraw(request, response) {
  const student = await studentForUser(request.user.id);
  const application = await Application.findOne({ _id: request.params.id, student: student.id });
  if (!application || !["applied", "screening"].includes(application.status)) throw new ApiError(409, "Application cannot be withdrawn.");
  application.status = "withdrawn";
  application.timeline.push({ status: "withdrawn", date: new Date() });
  await application.save();
  response.json({ success: true, data: { application } });
}

export async function stats(request, response) {
  const company = await companyForUser(request.user.id);
  const jobIds = await Job.find({ company: company.id }).distinct("_id");
  const rows = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  response.json({ success: true, data: { total, byStatus: rows, conversionRate: total ? Math.round(((rows.find((row) => row._id === "offered")?.count ?? 0) / total) * 100) : 0 } });
}

