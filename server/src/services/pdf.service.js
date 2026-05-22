import puppeteer from "puppeteer";
import QRCode from "qrcode";

// ─── Resume Templates ─────────────────────────────────────────────────────────

const COMMON_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; color: #222; font-size: 10pt; line-height: 1.45; }
  a { color: inherit; text-decoration: none; }
  h1 { font-size: 22pt; font-weight: 700; }
  h2 { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin: 14px 0 6px; padding-bottom: 3px; border-bottom: 1.5px solid #bbb; }
  h3 { font-size: 10pt; font-weight: 600; }
  p, li { font-size: 9.5pt; }
  ul { padding-left: 16px; }
  li { margin-bottom: 2px; }
  .meta { color: #555; font-size: 9pt; }
  .entry { margin-bottom: 10px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
`;

function skillChips(skills = []) {
  return `<p style="display:flex;flex-wrap:wrap;gap:4px;">${skills
    .map((s) => `<span style="background:#eef;border:1px solid #ccd;border-radius:3px;padding:1px 6px;font-size:8.5pt;">${s}</span>`)
    .join("")}</p>`;
}

function experienceBlocks(experience = []) {
  if (!experience.length) return "<p class=\"meta\">No experience listed.</p>";
  return experience
    .map(
      (exp) => `<div class="entry">
        <div class="entry-header">
          <h3>${exp.title ?? ""} <span style="font-weight:400">@ ${exp.company ?? ""}</span></h3>
          <span class="meta">${exp.duration ?? ""}</span>
        </div>
        <p>${exp.description ?? ""}</p>
      </div>`
    )
    .join("");
}

function projectBlocks(projects = []) {
  if (!projects.length) return "<p class=\"meta\">No projects listed.</p>";
  return projects
    .map(
      (p) => `<div class="entry">
        <div class="entry-header">
          <h3>${p.name ?? ""}</h3>
          ${p.link ? `<a href="${p.link}" class="meta">${p.link}</a>` : ""}
        </div>
        <p>${p.desc ?? p.description ?? ""}</p>
        ${p.techStack?.length ? `<p class="meta" style="margin-top:3px;">Tech: ${p.techStack.join(", ")}</p>` : ""}
      </div>`
    )
    .join("");
}

function educationBlocks(education = []) {
  if (!education.length) return "<p class=\"meta\">No education listed.</p>";
  return education
    .map(
      (edu) => `<div class="entry">
        <div class="entry-header">
          <h3>${edu.degree ?? edu.title ?? ""}</h3>
          <span class="meta">${edu.year ?? edu.endDate ?? ""}</span>
        </div>
        <p class="meta">${edu.school ?? edu.institution ?? ""}</p>
      </div>`
    )
    .join("");
}

// ── Template 1: ATS Clean ─────────────────────────────────────────────────────
function templateAtsClean(data) {
  return `
    <style>${COMMON_CSS} main { padding: 0.45in 0.5in; }</style>
    <main>
      <h1>${data.name ?? ""}</h1>
      <p class="meta" style="margin-top:4px;">
        ${[data.email, data.phone, data.location].filter(Boolean).join(" | ")}
        ${data.socialLinks?.linkedin ? ` | ${data.socialLinks.linkedin}` : ""}
        ${data.socialLinks?.github ? ` | ${data.socialLinks.github}` : ""}
      </p>
      ${data.summary ? `<p style="margin-top:10px;">${data.summary}</p>` : ""}

      <h2>Skills</h2>
      <p>${(data.skills ?? []).join(", ")}</p>

      <h2>Experience</h2>
      ${experienceBlocks(data.experience)}

      <h2>Projects</h2>
      ${projectBlocks(data.projects)}

      <h2>Education</h2>
      ${educationBlocks(data.education)}

      ${data.achievements?.length ? `<h2>Achievements</h2><ul>${data.achievements.map((a) => `<li>${a}</li>`).join("")}</ul>` : ""}
    </main>
  `;
}

// ── Template 2: Modern Sans ───────────────────────────────────────────────────
function templateModernSans(data) {
  return `
    <style>
      ${COMMON_CSS}
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
      .header { background: #1e3a5f; color: #fff; padding: 20px 0.5in; }
      .header h1 { color: #fff; font-size: 24pt; }
      .header .meta { color: #cde; margin-top: 4px; }
      .content { padding: 0 0.5in; }
      h2 { color: #1e3a5f; border-bottom-color: #1e3a5f; }
    </style>
    <div class="header">
      <h1>${data.name ?? ""}</h1>
      <p class="meta">${[data.email, data.phone, data.location].filter(Boolean).join("  ·  ")}</p>
      <p class="meta" style="margin-top:2px;">
        ${data.socialLinks?.linkedin ?? ""} ${data.socialLinks?.github ? "  ·  " + data.socialLinks.github : ""}
      </p>
    </div>
    <div class="content">
      ${data.summary ? `<p style="margin:12px 0;">${data.summary}</p>` : ""}

      <h2>Technical Skills</h2>
      ${skillChips(data.skills)}

      <h2>Work Experience</h2>
      ${experienceBlocks(data.experience)}

      <h2>Projects</h2>
      ${projectBlocks(data.projects)}

      <h2>Education</h2>
      ${educationBlocks(data.education)}

      ${data.achievements?.length ? `<h2>Achievements & Awards</h2><ul>${data.achievements.map((a) => `<li>${a}</li>`).join("")}</ul>` : ""}
    </div>
  `;
}

// ── Template 3: Compact Engineer ─────────────────────────────────────────────
function templateCompactEngineer(data) {
  return `
    <style>
      ${COMMON_CSS}
      body { font-size: 9pt; }
      main { display: grid; grid-template-columns: 1fr 2.2fr; gap: 0; min-height: 100vh; }
      .sidebar { background: #f4f6fb; padding: 20px 14px; border-right: 1px solid #dde; }
      .sidebar h1 { font-size: 16pt; color: #1a2b4a; }
      .sidebar h2 { font-size: 8.5pt; border-bottom-color: #aac; color: #1a2b4a; }
      .body { padding: 18px 18px; }
      h2 { font-size: 9pt; color: #1a2b4a; }
      .tag { background:#dde8ff;border-radius:2px;padding:1px 5px;font-size:7.5pt;margin:1px 1px 1px 0;display:inline-block; }
    </style>
    <main>
      <div class="sidebar">
        <h1>${data.name ?? ""}</h1>
        <p class="meta" style="margin-top:4px;font-size:8pt;">${data.email ?? ""}</p>
        ${data.phone ? `<p class="meta" style="font-size:8pt;">${data.phone}</p>` : ""}
        ${data.location ? `<p class="meta" style="font-size:8pt;">${data.location}</p>` : ""}
        ${data.socialLinks?.linkedin ? `<p class="meta" style="font-size:8pt;margin-top:4px;">${data.socialLinks.linkedin}</p>` : ""}
        ${data.socialLinks?.github ? `<p class="meta" style="font-size:8pt;">${data.socialLinks.github}</p>` : ""}

        ${data.summary ? `<h2>Summary</h2><p>${data.summary}</p>` : ""}

        <h2>Skills</h2>
        <div>${(data.skills ?? []).map((s) => `<span class="tag">${s}</span>`).join("")}</div>

        ${data.achievements?.length ? `<h2>Achievements</h2><ul style="padding-left:12px;">${data.achievements.map((a) => `<li style="font-size:8pt;">${a}</li>`).join("")}</ul>` : ""}

        <h2>Education</h2>
        ${educationBlocks(data.education)}
      </div>
      <div class="body">
        <h2>Work Experience</h2>
        ${experienceBlocks(data.experience)}

        <h2>Projects</h2>
        ${projectBlocks(data.projects)}
      </div>
    </main>
  `;
}

// ─── Template registry ────────────────────────────────────────────────────────
const resumeTemplates = {
  "ats-clean": templateAtsClean,
  "modern-sans": templateModernSans,
  "compact-engineer": templateCompactEngineer
};

// ─── Puppeteer launcher ───────────────────────────────────────────────────────
async function renderPdf(html) {
  const launchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  };

  // Respect a pre-installed system Chrome (e.g., in Docker)
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);
  try {
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`,
      { waitUntil: "networkidle0" }
    );
    return page.pdf({
      format: "A4",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      printBackground: true
    });
  } finally {
    await browser.close();
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function listResumeTemplates() {
  return [
    { id: "ats-clean", name: "ATS Clean", preview: "/resume-templates/ats-clean.png", category: "ats", isPremium: false },
    { id: "modern-sans", name: "Modern Sans", preview: "/resume-templates/modern-sans.png", category: "professional", isPremium: true },
    { id: "compact-engineer", name: "Compact Engineer", preview: "/resume-templates/compact-engineer.png", category: "technical", isPremium: true }
  ];
}

export async function generateResumePdf(resume) {
  const template = resumeTemplates[resume.templateId] ?? resumeTemplates["ats-clean"];
  return renderPdf(template(resume.data ?? {}));
}

export async function generateCertificatePdf({ name, title, certificateId, verificationUrl, issueDate }) {
  const qr = await QRCode.toDataURL(verificationUrl);
  const html = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Georgia', serif; background: #fff; }
      .cert {
        width: 793px; height: 561px;
        border: 12px solid #1e3a5f;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; padding: 40px 60px; position: relative;
      }
      .cert::before {
        content: ''; position: absolute; inset: 18px;
        border: 2px solid #c9a84c;
      }
      .platform { font-size: 11pt; color: #888; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px; }
      .headline { font-size: 28pt; color: #1e3a5f; font-weight: 700; margin-bottom: 10px; }
      .sub { font-size: 11pt; color: #555; margin-bottom: 20px; }
      .recipient { font-size: 22pt; color: #1e3a5f; font-style: italic; border-bottom: 1px solid #c9a84c; padding-bottom: 6px; margin-bottom: 20px; }
      .achievement { font-size: 12pt; color: #333; margin-bottom: 24px; }
      .footer { display: flex; gap: 40px; align-items: center; margin-top: 10px; }
      .cert-id { font-size: 8.5pt; color: #aaa; font-family: monospace; }
      .date { font-size: 9pt; color: #666; }
    </style>
    <div class="cert">
      <p class="platform">Student Opportunity Platform</p>
      <h1 class="headline">Certificate of Achievement</h1>
      <p class="sub">This is to certify that</p>
      <p class="recipient">${name}</p>
      <p class="achievement">${title}</p>
      <div class="footer">
        <div>
          <p class="date">${issueDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p class="cert-id">ID: ${certificateId}</p>
        </div>
        <img src="${qr}" width="70" height="70" alt="Verification QR" />
      </div>
    </div>
  `;
  return renderPdf(html);
}
