import { useEffect, useState } from "react";
import { resumeAPI } from "../lib/api.js";
import { toast } from "react-hot-toast";
import {
  FileText,
  Download,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileCheck,
  Languages,
  Layout,
  RefreshCcw
} from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";

export default function ResumeLab() {
  const [resume, setResume] = useState({
    title: "My Tech Resume",
    personalInfo: { name: "", email: "", phone: "", github: "", linkedin: "" },
    education: [],
    experience: [],
    projects: [],
    skills: []
  });
  
  const [resumeId, setResumeId] = useState("");
  const [template, setTemplate] = useState("ats-clean");
  const [loading, setLoading] = useState(true);

  // ATS Optimization States
  const [jobDescription, setJobDescription] = useState("");
  const [atsScore, setAtsScore] = useState(null);
  const [keywordGaps, setKeywordGaps] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [analyzingAts, setAnalyzingAts] = useState(false);

  // Input states
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadOrCreateResume = async () => {
    setLoading(true);
    try {
      const list = await resumeAPI.list();
      if (list.length > 0) {
        setResume(list[0]);
        setResumeId(list[0]._id);
      } else {
        // Create initial default resume
        const newRes = await resumeAPI.create({
          title: "My Tech Resume",
          personalInfo: { name: "Arjun Mehta", email: "arjun@university.edu", phone: "9876543210", github: "github.com/arjun", linkedin: "linkedin.com/in/arjun" },
          education: [{ school: "Delhi Technological University", degree: "B.Tech Computer Science", startYear: "2022", endYear: "2026", gpa: "9.2" }],
          experience: [{ company: "Google Summer of Code", role: "Contributor", description: "Built high-concurrency stream buffers using Node.js.", startDate: "May 2024", endDate: "Aug 2024" }],
          projects: [{ title: "Qwix", description: "Vite + Express platform resolving automated resume optimization processes.", link: "github.com/arjun/qwix" }],
          skills: ["React", "Node.js", "MongoDB", "Redis", "TypeScript", "Algorithms"]
        });
        setResume(newRes);
        setResumeId(newRes._id);
      }
    } catch {
      // Mock local fallback
      setResumeId("mock-resume-id");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrCreateResume();
  }, []);

  const handleSaveResume = async () => {
    if (!resumeId) return;
    setSaving(true);
    try {
      if (resumeId === "mock-resume-id") {
        toast.success("Mock resume saved locally!");
      } else {
        await resumeAPI.update(resumeId, resume);
        toast.success("Resume saved successfully!");
      }
    } catch (err) {
      toast.error("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setResume({ ...resume, skills: [...resume.skills, newSkill.trim()] });
    setNewSkill("");
  };

  const handleRemoveSkill = (idx) => {
    setResume({
      ...resume,
      skills: resume.skills.filter((_, i) => i !== idx)
    });
  };

  const handleAddExperience = () => {
    const newExp = { company: "", role: "", description: "", startDate: "", endDate: "" };
    setResume({ ...resume, experience: [...resume.experience, newExp] });
  };

  const handleUpdateExperience = (idx, field, val) => {
    const updated = resume.experience.map((item, i) =>
      i === idx ? { ...item, [field]: val } : item
    );
    setResume({ ...resume, experience: updated });
  };

  const handleRemoveExperience = (idx) => {
    setResume({ ...resume, experience: resume.experience.filter((_, i) => i !== idx) });
  };

  const handleAddProject = () => {
    const newProj = { title: "", description: "", link: "" };
    setResume({ ...resume, projects: [...resume.projects, newProj] });
  };

  const handleUpdateProject = (idx, field, val) => {
    const updated = resume.projects.map((item, i) =>
      i === idx ? { ...item, [field]: val } : item
    );
    setResume({ ...resume, projects: updated });
  };

  const handleRemoveProject = (idx) => {
    setResume({ ...resume, projects: resume.projects.filter((_, i) => i !== idx) });
  };

  const handleAtsAnalysis = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a target Job Description first.");
      return;
    }
    setAnalyzingAts(true);
    try {
      if (resumeId === "mock-resume-id") {
        // Fallback mockup
        setTimeout(() => {
          setAtsScore(82);
          setKeywordGaps(["Kubernetes", "AWS S3", "Microservices"]);
          setAiSuggestions([
            "Elaborate on database optimization details in GSoC experience.",
            "Add certifications under the AWS cloud scope."
          ]);
          setAnalyzingAts(false);
          toast.success("Analysis complete!");
        }, 1500);
      } else {
        const res = await resumeAPI.analyzeATS(resumeId, jobDescription);
        setAtsScore(res.atsScore ?? 80);
        setKeywordGaps(res.keywordGaps ?? []);
        setAiSuggestions(res.aiSuggestions ?? []);
        toast.success("ATS Analysis completed!");
      }
    } catch (err) {
      toast.error("ATS analysis failed: " + err.message);
      setAnalyzingAts(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      if (resumeId === "mock-resume-id") {
        toast.error("Mock resume PDF download is unavailable.");
      } else {
        const blob = await resumeAPI.exportPDF(resumeId, template);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Resume_${resume.personalInfo.name || "SOP"}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("PDF exported successfully!");
      }
    } catch {
      toast.error("Failed to export PDF file");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-500">Configuring Resume Studio...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900/60 to-electric-500/5 p-6 rounded-2xl border border-electric-500/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-electric-400" />
            Resume Lab & ATS Engine
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Build resume profiles, live compile styled templates, and check against target job descriptions for keyword scoring.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveResume} loading={saving} variant="secondary" size="sm">
            Save Resume Data
          </Button>
          <Button onClick={handleExportPDF} loading={exporting} icon={Download} size="sm">
            Export PDF
          </Button>
        </div>
      </div>

      {/* 3-Panel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-200px)] overflow-hidden">
        
        {/* PANEL 1: Form Editor (4 Columns) */}
        <div className="lg:col-span-4 h-full overflow-y-auto pr-1 flex flex-col gap-5 custom-scrollbar pb-10">
          <Card hoverable={false} className="p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-white text-sm border-b border-navy-800 pb-2">Personal Information</h3>
            <Input
              label="Full Name"
              value={resume.personalInfo?.name ?? ""}
              onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, name: e.target.value } })}
            />
            <Input
              label="Email"
              value={resume.personalInfo?.email ?? ""}
              onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, email: e.target.value } })}
            />
            <Input
              label="Phone"
              value={resume.personalInfo?.phone ?? ""}
              onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, phone: e.target.value } })}
            />
            <Input
              label="GitHub Link"
              value={resume.personalInfo?.github ?? ""}
              onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, github: e.target.value } })}
            />
          </Card>

          {/* Experience Lists */}
          <Card hoverable={false} className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-navy-800 pb-2">
              <h3 className="font-semibold text-white text-sm">Professional Experience</h3>
              <button onClick={handleAddExperience} className="p-1 rounded bg-electric-500/10 text-electric-400 hover:bg-electric-500/20" type="button">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {resume.experience?.map((exp, idx) => (
              <div key={idx} className="p-3 bg-navy-950/40 rounded-xl border border-electric-500/10 flex flex-col gap-2 relative">
                <button
                  onClick={() => handleRemoveExperience(idx)}
                  className="absolute right-2 top-2 text-coral-400 hover:text-coral-500"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Input
                  label="Company Name"
                  value={exp.company}
                  onChange={(e) => handleUpdateExperience(idx, "company", e.target.value)}
                />
                <Input
                  label="Role"
                  value={exp.role}
                  onChange={(e) => handleUpdateExperience(idx, "role", e.target.value)}
                />
                <textarea
                  placeholder="Responsibilities & bullet points..."
                  value={exp.description}
                  onChange={(e) => handleUpdateExperience(idx, "description", e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-navy-900 border border-electric-500/10 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-electric-400"
                />
              </div>
            ))}
          </Card>

          {/* Project List */}
          <Card hoverable={false} className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-navy-800 pb-2">
              <h3 className="font-semibold text-white text-sm">Projects</h3>
              <button onClick={handleAddProject} className="p-1 rounded bg-electric-500/10 text-electric-400 hover:bg-electric-500/20" type="button">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {resume.projects?.map((proj, idx) => (
              <div key={idx} className="p-3 bg-navy-950/40 rounded-xl border border-electric-500/10 flex flex-col gap-2 relative">
                <button
                  onClick={() => handleRemoveProject(idx)}
                  className="absolute right-2 top-2 text-coral-400 hover:text-coral-500"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Input
                  label="Project Title"
                  value={proj.title}
                  onChange={(e) => handleUpdateProject(idx, "title", e.target.value)}
                />
                <Input
                  label="Repository / Link"
                  value={proj.link}
                  onChange={(e) => handleUpdateProject(idx, "link", e.target.value)}
                />
                <textarea
                  placeholder="Project specifications..."
                  value={proj.description}
                  onChange={(e) => handleUpdateProject(idx, "description", e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-navy-900 border border-electric-500/10 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-electric-400"
                />
              </div>
            ))}
          </Card>

          {/* Skills Chips */}
          <Card hoverable={false} className="p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-white text-sm border-b border-navy-800 pb-2">Technical Skills</h3>
            <div className="flex gap-2">
              <Input
                placeholder="React, AWS, C++..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <Button onClick={handleAddSkill} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {resume.skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 text-[11px] font-semibold bg-electric-500/15 text-electric-300 px-2 py-0.5 rounded border border-electric-500/20"
                >
                  {skill}
                  <button onClick={() => handleRemoveSkill(idx)} className="text-coral-400 hover:text-coral-500 ml-0.5" type="button">×</button>
                </span>
              ))}
            </div>
          </Card>

        </div>

        {/* PANEL 2: PDF Template Live Preview (4 Columns) */}
        <div className="lg:col-span-4 h-full bg-navy-900 border border-electric-500/15 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-electric-500/15 flex justify-between items-center bg-navy-950">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Layout className="h-4 w-4 text-electric-400" /> Preview Render
            </span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="px-2 py-1 bg-navy-900 border border-electric-500/10 rounded text-[11px] text-white"
            >
              <option value="ats-clean">ATS Clean Layout</option>
              <option value="modern-sans">Modern Sans Grid</option>
              <option value="compact-engineer">Compact Engineer</option>
            </select>
          </div>

          {/* Simple simulated PDF page mockup */}
          <div className="flex-1 p-6 overflow-y-auto bg-white text-gray-900 font-serif text-[8px] custom-scrollbar select-text leading-tight">
            <div className="text-center pb-4 border-b border-gray-300">
              <h2 className="text-sm font-bold uppercase tracking-wider">{resume.personalInfo?.name || "Candidate Name"}</h2>
              <p className="text-[7px] text-gray-600 mt-1">
                {resume.personalInfo?.email} | {resume.personalInfo?.phone} | {resume.personalInfo?.github}
              </p>
            </div>

            {/* Education section mockup */}
            <div className="mt-4">
              <h3 className="font-bold border-b border-gray-300 text-[8px] uppercase tracking-wide">Education</h3>
              {resume.education?.map((edu, i) => (
                <div key={i} className="flex justify-between mt-1">
                  <div>
                    <span className="font-bold">{edu.school}</span> — <span className="italic">{edu.degree}</span>
                  </div>
                  <span>{edu.startYear} – {edu.endYear}</span>
                </div>
              ))}
            </div>

            {/* Exp mockup */}
            <div className="mt-4">
              <h3 className="font-bold border-b border-gray-300 text-[8px] uppercase tracking-wide">Experience</h3>
              {resume.experience?.map((exp, i) => (
                <div key={i} className="mt-1">
                  <div className="flex justify-between font-bold">
                    <span>{exp.company} — {exp.role}</span>
                    <span>{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <p className="text-[7px] text-gray-700 mt-0.5 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>

            {/* Projects mockup */}
            <div className="mt-4">
              <h3 className="font-bold border-b border-gray-300 text-[8px] uppercase tracking-wide">Projects</h3>
              {resume.projects?.map((proj, i) => (
                <div key={i} className="mt-1">
                  <div className="flex justify-between font-bold">
                    <span>{proj.title}</span>
                    <span className="text-gray-500 italic">{proj.link}</span>
                  </div>
                  <p className="text-[7px] text-gray-700 mt-0.5">{proj.description}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mt-4">
              <h3 className="font-bold border-b border-gray-300 text-[8px] uppercase tracking-wide">Technical Skills</h3>
              <p className="text-[7px] text-gray-700 mt-1 font-semibold">
                {resume.skills?.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* PANEL 3: ATS Analytics & Suggestions (4 Columns) */}
        <div className="lg:col-span-4 h-full flex flex-col gap-4 overflow-y-auto pb-10 pr-1 custom-scrollbar">
          
          <Card hoverable={false} className="p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-white text-sm border-b border-navy-800 pb-2">Target Job Description</h3>
            <textarea
              placeholder="Paste target job sheet requirements here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="w-full p-2 bg-navy-950 border border-electric-500/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-electric-400"
            />
            <Button onClick={handleAtsAnalysis} loading={analyzingAts} icon={FileCheck} className="w-full">
              Run ATS Optimizer
            </Button>
          </Card>

          {atsScore !== null && (
            <Card hoverable={false} className="p-5 flex flex-col gap-5 border-neon-500/20 bg-gradient-to-tr from-navy-900 to-neon-500/5">
              <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">ATS Score Metric</h4>
                <Badge variant={atsScore >= 80 ? "success" : "warning"}>{atsScore}/100 Grade</Badge>
              </div>

              {/* Keyword Gaps */}
              <div>
                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" /> Missing Keywords
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {keywordGaps.map((keyword, i) => (
                    <span key={i} className="text-[9px] font-bold bg-coral-500/10 text-coral-300 border border-coral-500/25 px-2 py-0.5 rounded">
                      + {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-neon-400" /> Optimization Feedback
                </h5>
                <ul className="flex flex-col gap-2">
                  {aiSuggestions.map((sug, i) => (
                    <li key={i} className="text-[10px] text-gray-300 leading-relaxed list-disc list-inside">
                      {sug}
                    </li>
                  ))}
                </ul>
              </div>

            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
