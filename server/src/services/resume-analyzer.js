function normalize(items = []) {
  return items.map((item) => item.toLowerCase().trim()).filter(Boolean);
}

export function analyzeResume(resume, targetSkills = []) {
  const resumeSkills = normalize(resume.skills);
  const keywords = normalize(targetSkills);
  const matchedSkills = keywords.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = keywords.filter((skill) => !resumeSkills.includes(skill));
  const coverage = keywords.length ? matchedSkills.length / keywords.length : 0.7;
  const structureBonus = [resume.summary, resume.experience?.length, resume.projects?.length].filter(Boolean).length * 8;
  const score = Math.min(100, Math.round(35 + coverage * 45 + structureBonus));

  return {
    score,
    matchedSkills,
    missingSkills,
    recommendations: [
      resume.summary ? null : "Add a short role-focused summary.",
      resume.experience?.length ? null : "Add measurable experience bullets.",
      resume.projects?.length ? null : "Show projects that prove your target skills.",
      missingSkills.length ? `Add proof for target skills: ${missingSkills.join(", ")}.` : null
    ].filter(Boolean)
  };
}

