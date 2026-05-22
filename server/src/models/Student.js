import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    duration: String,
    description: String,
    startDate: Date,
    endDate: Date,
    isCurrent: { type: Boolean, default: false }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: String,
    desc: String,
    techStack: [String],
    link: String,
    githubUrl: String
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    collegeName: String,
    degree: String,
    branch: String,
    graduationYear: { type: Number, index: true },
    cgpa: { type: Number, min: 0, max: 10 },
    skills: { type: [String], default: [], index: true },
    bio: String,
    location: String,
    resumeUrl: String,
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String
    },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [mongoose.Schema.Types.Mixed], default: [] },
    projects: { type: [projectSchema], default: [] },
    achievements: { type: [String], default: [] },
    preferredRoles: { type: [String], default: [] },
    preferredLocations: { type: [String], default: [] },
    isOpenToWork: { type: Boolean, default: true },
    premiumMember: { type: Boolean, default: false },
    premiumExpiry: Date,
    stats: {
      contestsParticipated: { type: Number, default: 0 },
      hackathonsJoined: { type: Number, default: 0 },
      applicationsSubmitted: { type: Number, default: 0 },
      profileViews: { type: Number, default: 0 },
      certificatesEarned: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// ─── Auto-compute profile completeness on every save ─────────────────────────
studentSchema.pre("save", function computeCompleteness() {
  const checks = [
    !!this.bio?.trim(),                           // 10 pts
    this.skills.length >= 3,                      // 15 pts
    !!this.collegeName?.trim(),                   // 10 pts
    !!this.degree?.trim(),                        // 5 pts
    !!this.branch?.trim(),                        // 5 pts
    !!this.graduationYear,                        // 5 pts
    this.experience.length > 0,                   // 10 pts
    this.education.length > 0,                    // 5 pts
    this.projects.length > 0,                     // 10 pts
    !!this.location?.trim(),                      // 5 pts
    !!this.socialLinks?.linkedin?.trim(),         // 5 pts
    !!this.socialLinks?.github?.trim(),           // 5 pts
    this.preferredRoles.length > 0,              // 5 pts
    this.preferredLocations.length > 0,          // 5 pts
  ];

  const weights = [10, 15, 10, 5, 5, 5, 10, 5, 10, 5, 5, 5, 5, 5];
  const score = checks.reduce((sum, passed, i) => sum + (passed ? weights[i] : 0), 0);
  this.profileCompleteness = Math.min(100, score);
});

studentSchema.index({ skills: 1, preferredRoles: 1, preferredLocations: 1 });

studentSchema.virtual("isPremiumActive").get(function isPremiumActive() {
  return this.premiumMember && (!this.premiumExpiry || this.premiumExpiry > new Date());
});

export const Student = mongoose.model("Student", studentSchema);
