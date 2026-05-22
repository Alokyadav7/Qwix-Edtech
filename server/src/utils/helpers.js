const stopWords = new Set([
  "and",
  "the",
  "with",
  "for",
  "from",
  "that",
  "this",
  "will",
  "your",
  "have",
  "into",
  "are",
  "you",
  "our",
  "job",
  "role"
]);

export function extractKeywords(text = "") {
  return [...new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
  )].slice(0, 60);
}

export function pageOptions(query) {
  const page = Math.max(1, Number(query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
  return { page, limit, skip: (page - 1) * limit };
}

export function textArray(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

export function calculateATSScore(studentData = {}, jobData = {}) {
  const studentKeywords = new Set([
    ...textArray(studentData.skills),
    ...extractKeywords(studentData.resumeText),
    ...extractKeywords((studentData.projects ?? []).map((project) => project.description ?? project.desc ?? "").join(" "))
  ].map((item) => item.toLowerCase()));
  const requiredKeywords = new Set([
    ...textArray(jobData.skills),
    ...textArray(jobData.atsKeywords),
    ...extractKeywords(jobData.title)
  ].map((item) => item.toLowerCase()));

  const matchedKeywords = [];
  const missingKeywords = [];
  let points = 0;
  let maxPoints = 0;

  for (const keyword of requiredKeywords) {
    const titleKeyword = extractKeywords(jobData.title).includes(keyword);
    maxPoints += titleKeyword ? 8 : 10;
    if (studentKeywords.has(keyword)) {
      points += titleKeyword ? 8 : 10;
      matchedKeywords.push(keyword);
      continue;
    }

    const partial = [...studentKeywords].some((item) => item.includes(keyword) || keyword.includes(item));
    if (partial) {
      points += 5;
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const score = maxPoints ? Math.round((points / maxPoints) * 100) : 0;
  return {
    score,
    matchedKeywords,
    missingKeywords,
    suggestions: missingKeywords.slice(0, 8).map((keyword) => `Add proof for ${keyword}.`)
  };
}

export function safePublicUser(user) {
  if (!user) {
    return null;
  }

  const json = user.toJSON ? user.toJSON() : { ...user };
  delete json.password;
  delete json.refreshTokens;
  delete json.twoFactorSecret;
  delete json.emailVerificationToken;
  delete json.passwordResetToken;
  return json;
}

