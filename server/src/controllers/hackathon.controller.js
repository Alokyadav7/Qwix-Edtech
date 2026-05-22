import { Hackathon } from "../models/Hackathon.js";
import { HackathonTeam } from "../models/HackathonTeam.js";
import { Student } from "../models/Student.js";
import { User } from "../models/User.js";
import { queueEmail } from "../jobs/email.job.js";
import { sendBulkNotification } from "../services/notification.service.js";
import { uploadBuffer } from "../services/s3.service.js";
import { ApiError } from "../utils/ApiError.js";

async function studentForUser(userId) {
  const student = await Student.findOne({ user: userId });
  if (!student) throw new ApiError(404, "Student profile was not found.");
  return student;
}

export async function createHackathon(request, response) {
  const banner = request.file
    ? await uploadBuffer({ buffer: request.file.buffer, contentType: request.file.mimetype, folder: "hackathons", filename: request.file.originalname })
    : request.body.banner;
  const hackathon = await Hackathon.create({ ...request.body, banner, createdBy: request.user.id });
  response.status(201).json({ success: true, data: { hackathon } });
}

export async function listHackathons(request, response) {
  const filters = {};
  if (request.query.status) filters.status = request.query.status;
  if (request.query.mode) filters.mode = request.query.mode;
  if (request.query.upcoming === "true") filters.registrationEnd = { $gte: new Date() };
  const hackathons = await Hackathon.find(filters).sort({ registrationEnd: 1 });
  response.json({ success: true, data: { hackathons } });
}

export async function getHackathon(request, response) {
  const hackathon = await Hackathon.findById(request.params.id).populate("sponsor mentors judges");
  if (!hackathon) throw new ApiError(404, "Hackathon was not found.");
  response.json({ success: true, data: { hackathon } });
}

export async function registerSolo(request, response) {
  const student = await studentForUser(request.user.id);
  const hackathon = await Hackathon.findById(request.params.id);
  if (!hackathon) throw new ApiError(404, "Hackathon was not found.");
  if (!hackathon.soloParticipants.some((id) => id.equals(student.id))) {
    hackathon.soloParticipants.push(student.id);
    await hackathon.save();
  }
  response.json({ success: true, data: { hackathonId: hackathon.id, registered: true } });
}

export async function createTeam(request, response) {
  const student = await studentForUser(request.user.id);
  const team = await HackathonTeam.create({
    hackathon: request.params.id,
    leader: student.id,
    members: [student.id],
    ...request.body
  });
  response.status(201).json({ success: true, data: { team } });
}

export async function joinTeam(request, response) {
  const student = await studentForUser(request.user.id);
  const team = await HackathonTeam.findOne({
    hackathon: request.params.id,
    ...(request.body.teamId ? { _id: request.body.teamId } : { inviteCode: request.body.inviteCode })
  });
  if (!team) throw new ApiError(404, "Team was not found.");
  if (!team.members.some((id) => id.equals(student.id))) {
    team.members.push(student.id);
    await team.save();
  }
  response.json({ success: true, data: { team } });
}

export async function invite(request, response) {
  const student = await studentForUser(request.user.id);
  const team = await HackathonTeam.findOne({ hackathon: request.params.id, leader: student.id });
  if (!team) throw new ApiError(404, "Team was not found.");
  await queueEmail({
    to: request.body.email,
    subject: `Hackathon team invite: ${team.teamName}`,
    text: `Join with invite code ${team.inviteCode}`,
    html: `<p>Join ${team.teamName} with invite code <b>${team.inviteCode}</b>.</p>`
  });
  response.json({ success: true, message: "Invite sent." });
}

export async function teams(request, response) {
  const filters = { hackathon: request.params.id };
  if (request.query.skills) filters.lookingFor = { $in: String(request.query.skills).split(",") };
  const teams = await HackathonTeam.find(filters).populate({ path: "members", populate: "user" });
  response.json({ success: true, data: { teams } });
}

export async function submitProject(request, response) {
  const student = await studentForUser(request.user.id);
  const team = await HackathonTeam.findOne({ hackathon: request.params.id, leader: student.id });
  if (!team) throw new ApiError(404, "Team leader submission target was not found.");
  team.submission = { ...request.body, submittedAt: new Date() };
  await team.save();
  response.json({ success: true, data: { team } });
}

export async function submissions(request, response) {
  const teams = await HackathonTeam.find({ hackathon: request.params.id, submission: { $exists: true } }).populate("members leader");
  response.json({ success: true, data: { submissions: teams } });
}

export async function judge(request, response) {
  const hackathon = await Hackathon.findById(request.params.id);
  const team = await HackathonTeam.findById(request.body.teamId);
  if (!hackathon || !team || !hackathon.judges.some((id) => id.equals(request.user.id))) throw new ApiError(403, "Judge access is required.");
  team.judging.push({ judge: request.user.id, scores: request.body.scores, feedback: request.body.feedback });
  const weighted = Object.entries(request.body.scores ?? {}).reduce((sum, [, score]) => sum + Number(score), 0);
  team.weightedScore = weighted;
  await team.save();
  response.json({ success: true, data: { team } });
}

export async function results(request, response) {
  const hackathon = await Hackathon.findById(request.params.id);
  if (!hackathon || hackathon.status !== "announced") throw new ApiError(404, "Results are not announced.");
  const winners = await HackathonTeam.find({ hackathon: hackathon.id }).sort({ weightedScore: -1 }).limit(10);
  response.json({ success: true, data: { winners } });
}

export async function announce(request, response) {
  const hackathon = await Hackathon.findById(request.params.id);
  if (!hackathon) throw new ApiError(404, "Hackathon was not found.");

  const topTeams = await HackathonTeam.find({ hackathon: hackathon.id })
    .sort({ weightedScore: -1 })
    .limit(3)
    .populate({ path: "members", populate: "user" });

  hackathon.status = "announced";
  hackathon.winners = topTeams.map((team, index) => ({ rank: index + 1, team: team.id, score: team.weightedScore }));
  await hackathon.save();

  const soloUsers = await User.find({ _id: { $in: hackathon.soloParticipants } });
  await sendBulkNotification({
    userIds: soloUsers.map((u) => u.id),
    type: "hackathon_update",
    title: `${hackathon.title} results announced`,
    body: "Open the results page to view rankings."
  });

  // Issue winner + participation certificates asynchronously
  const { queueCertificate } = await import("../jobs/certificate.job.js");
  const rankLabels = ["1st Place", "2nd Place", "3rd Place"];
  for (const [i, team] of topTeams.entries()) {
    for (const member of team.members ?? []) {
      await queueCertificate({ studentId: String(member.student ?? member._id), title: `${rankLabels[i] ?? "Top Finisher"} — ${hackathon.title}`, type: "hackathon" });
    }
  }

  response.json({ success: true, data: { hackathon } });
}

