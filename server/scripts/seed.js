import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { AITest } from "../src/models/AITest.js";
import { College } from "../src/models/College.js";
import { Company } from "../src/models/Company.js";
import { Contest } from "../src/models/Contest.js";
import { Hackathon } from "../src/models/Hackathon.js";
import { Internship } from "../src/models/Internship.js";
import { Job } from "../src/models/Job.js";
import { Student } from "../src/models/Student.js";
import { User } from "../src/models/User.js";

const indianNames = ["Aarav Sharma", "Diya Nair", "Kabir Rao", "Meera Iyer", "Vihaan Patel"];
const companies = ["CodeYatra", "Bharat Cloud", "Namma Robotics"];
const colleges = ["IIT Delhi", "BITS Pilani"];

async function ensureUser(payload) {
  return User.findOneAndUpdate({ email: payload.email }, payload, { upsert: true, new: true, setDefaultsOnInsert: true });
}

async function seed() {
  await connectDatabase();
  const admin = await ensureUser({ name: "Platform Admin", email: "admin@studentplatform.test", password: "Password123!", role: "admin", isEmailVerified: true });
  const studentUsers = await Promise.all(indianNames.map((name, index) => ensureUser({
    name,
    email: `student${index + 1}@studentplatform.test`,
    password: "Password123!",
    role: "student",
    isEmailVerified: true
  })));
  const companyUsers = await Promise.all(companies.map((name, index) => ensureUser({
    name: `${name} Recruiter`,
    email: `company${index + 1}@studentplatform.test`,
    password: "Password123!",
    role: "company",
    isEmailVerified: true
  })));
  const collegeUsers = await Promise.all(colleges.map((name, index) => ensureUser({
    name: `${name} Placement Cell`,
    email: `college${index + 1}@studentplatform.test`,
    password: "Password123!",
    role: "college",
    isEmailVerified: true
  })));

  const students = await Promise.all(studentUsers.map((user, index) => Student.findOneAndUpdate(
    { user: user.id },
    { collegeName: colleges[index % colleges.length], graduationYear: 2027, skills: ["javascript", "node", "mongodb", index % 2 ? "python" : "react"] },
    { upsert: true, new: true }
  )));
  const companyProfiles = await Promise.all(companyUsers.map((user, index) => Company.findOneAndUpdate(
    { user: user.id },
    { companyName: companies[index], isVerified: true, industry: "Technology", location: "Bengaluru" },
    { upsert: true, new: true }
  )));
  await Promise.all(collegeUsers.map((user, index) => College.findOneAndUpdate(
    { user: user.id },
    { collegeName: colleges[index], isVerified: true },
    { upsert: true, new: true }
  )));

  await Job.deleteMany({ title: /Seed/ });
  await Job.insertMany(Array.from({ length: 10 }, (_, index) => ({
    company: companyProfiles[index % companyProfiles.length].id,
    title: `Seed Full Stack Engineer ${index + 1}`,
    description: "Build Node.js and React products with MongoDB.",
    skills: ["javascript", "node", "react", "mongodb"],
    location: index % 2 ? "Remote" : "Bengaluru",
    salaryMin: 600000,
    salaryMax: 1400000,
    atsKeywords: ["javascript", "node", "react", "mongodb"]
  })));
  await Internship.deleteMany({ title: /Seed/ });
  await Internship.insertMany(Array.from({ length: 5 }, (_, index) => ({
    company: companyProfiles[index % companyProfiles.length].id,
    title: `Seed Product Internship ${index + 1}`,
    description: "Ship product features and learn backend fundamentals.",
    skills: ["javascript", "api"],
    stipendMin: 15000,
    stipendMax: 30000
  })));
  await Contest.deleteMany({ title: /Seed/ });
  await Contest.insertMany([1, 2].map((index) => ({
    title: `Seed Coding Sprint ${index}`,
    description: "DSA contest",
    startTime: new Date(Date.now() + index * 86400000),
    endTime: new Date(Date.now() + (index + 1) * 86400000),
    createdBy: admin.id,
    problems: [{ title: "Array Sum", points: 100, testCases: [{ input: "[1,2]", expected: "3" }] }]
  })));
  await Hackathon.findOneAndUpdate(
    { title: "Seed Bharat Build Hackathon" },
    { title: "Seed Bharat Build Hackathon", theme: "Student careers", description: "Build career tooling.", createdBy: admin.id },
    { upsert: true }
  );
  await AITest.deleteMany({ title: /Seed/ });
  await AITest.insertMany(["DSA", "Web Dev", "SQL"].map((topic) => ({
    title: `Seed ${topic} Test`,
    topic,
    duration: 30,
    questions: [{ id: "q1", type: "mcq", question: `${topic} starter question`, options: ["A", "B"], correctAnswer: "A", points: 5 }]
  })));
  console.log(`Seeded admin, ${students.length} students, companies, colleges, roles, contests, and tests.`);
  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectDatabase();
  process.exit(1);
});

