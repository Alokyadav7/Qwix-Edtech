import { useEffect, useState } from "react";
import { jobsAPI } from "../lib/api.js";
import { toast } from "react-hot-toast";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  Briefcase,
  UploadCloud,
  FileText,
  CheckCircle,
  Sparkles,
  ChevronLeft
} from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState(""); // job | internship
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState(""); // remote | office | hybrid
  const [stipendMin, setStipendMin] = useState("");

  // Application wizard states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [screeningAnswers, setScreeningAnswers] = useState({});
  const [applying, setApplying] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await jobsAPI.list({
        search,
        kind,
        location,
        workMode,
        stipendMin
      });
      setOpportunities(data);
      if (data.length > 0 && !selectedOpp) {
        setSelectedOpp(data[0]);
      }
    } catch (err) {
      toast.error(err.message ?? "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [kind, workMode]); // Trigger reload automatically on select shifts

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setApplying(true);
    try {
      // Simulate/trigger application
      await jobsAPI.apply(selectedOpp._id, {
        answers: Object.entries(screeningAnswers).map(([q, a]) => ({ question: q, answer: a })),
        resumeUrl: "s3://sop-resumes/mock-resume.pdf" // Placeholder upload link
      });
      toast.success("Application submitted successfully!");
      setShowApplyModal(false);
      setScreeningAnswers({});
    } catch (err) {
      toast.error(err.message ?? "Application submission failed");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Search Header */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Search roles, skills, or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-navy-900 border border-electric-500/15 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-electric-400 focus:ring-2 focus:ring-electric-500/20"
          />
        </div>
        <div className="flex gap-2">
          <Select
            options={[
              { value: "", label: "All Opportunities" },
              { value: "job", label: "Full Time Jobs" },
              { value: "internship", label: "Internships" }
            ]}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="min-w-[150px]"
          />
          <Select
            options={[
              { value: "", label: "Any Work Mode" },
              { value: "remote", label: "Remote" },
              { value: "office", label: "On Site" },
              { value: "hybrid", label: "Hybrid" }
            ]}
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="min-w-[150px]"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {/* Main Browse Panel split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column - list of opportunities */}
        <div className="lg:col-span-5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center text-xs text-gray-500 py-12">Loading opportunities...</div>
          ) : opportunities.length > 0 ? (
            opportunities.map((opp) => (
              <div
                key={opp._id}
                onClick={() => setSelectedOpp(opp)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 text-left ${
                  selectedOpp?._id === opp._id
                    ? "border-electric-400 bg-electric-500/5 shadow-glow"
                    : "border-electric-500/10 bg-navy-900/60 hover:border-electric-400/25"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-white truncate max-w-[200px]">{opp.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{opp.companyName ?? "Fast Startup"}</p>
                  </div>
                  <Badge variant="electric" size="sm">{opp.kind}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-electric-400" />
                    {opp.location} ({opp.workMode})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-violet-400" />
                    {opp.duration} months
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-neon-400" />
                    ₹{opp.stipend?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-gray-500 py-12">No opportunities found matching criteria.</div>
          )}
        </div>

        {/* Right column - active detail pane */}
        <div className="lg:col-span-7">
          {selectedOpp ? (
            <Card hoverable={false} className="border-electric-500/20 bg-navy-900/70 p-6 flex flex-col gap-6 text-left">
              
              {/* Company Details Title */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-navy-800">
                <div>
                  <Badge variant="success" className="mb-2">90% match score</Badge>
                  <h2 className="text-xl font-display font-bold text-white">{selectedOpp.title}</h2>
                  <p className="text-xs text-electric-400 font-semibold mt-1">
                    {selectedOpp.companyName ?? "Brand Enterprise Ltd"}
                  </p>
                </div>
                <Button onClick={() => setShowApplyModal(true)}>Apply Now</Button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-navy-950/60 p-4 rounded-xl border border-electric-500/10 text-xs">
                <div>
                  <span className="text-gray-500 font-medium">Location</span>
                  <p className="text-white mt-0.5">{selectedOpp.location}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Stipend / Salary</span>
                  <p className="text-white mt-0.5">₹{selectedOpp.stipend?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Duration</span>
                  <p className="text-white mt-0.5">{selectedOpp.duration} months</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Work Mode</span>
                  <p className="text-white mt-0.5 capitalize">{selectedOpp.workMode}</p>
                </div>
              </div>

              {/* Job Description details */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h3>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                  {selectedOpp.description ?? "We are seeking a talented full-stack engineer to help us scale our consumer applications. You will be working directly with the core engineering leadership on React, Node.js, and Redis architectures."}
                </p>
              </div>

              {/* Required Skills list */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOpp.skillsRequired?.map((skill, index) => (
                    <Badge key={index} variant="electric" size="sm">{skill}</Badge>
                  )) ?? (
                    <>
                      <Badge variant="electric" size="sm">React</Badge>
                      <Badge variant="electric" size="sm">Node.js</Badge>
                      <Badge variant="electric" size="sm">MongoDB</Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Apply Modal overlay */}
              {showApplyModal && (
                <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-navy-900 border border-electric-500/25 rounded-2xl p-6 w-full max-w-md shadow-elevated flex flex-col gap-5 text-left">
                    <div className="flex justify-between items-center border-b border-navy-800 pb-3">
                      <h3 className="font-semibold text-white">Apply to {selectedOpp.companyName}</h3>
                      <button onClick={() => setShowApplyModal(false)} className="text-gray-500 hover:text-white" type="button">Close</button>
                    </div>

                    <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
                      
                      {/* Resume drag/drop widget */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                          Resume Attachment
                        </label>
                        <div className="border border-dashed border-electric-500/20 rounded-xl p-6 bg-navy-950 text-center hover:border-electric-400/40 transition-all duration-200">
                          <UploadCloud className="h-8 w-8 text-electric-400 mx-auto mb-2" />
                          <span className="text-xs text-gray-300 font-semibold block">Drag & Drop Resume PDF</span>
                          <span className="text-[10px] text-gray-500 block mt-1">or click to browse local files</span>
                        </div>
                      </div>

                      {/* Screening inputs if any */}
                      {selectedOpp.screeningQuestions?.map((q, qidx) => (
                        <Input
                          key={qidx}
                          label={q}
                          placeholder="Provide your response..."
                          value={screeningAnswers[q] ?? ""}
                          onChange={(e) => setScreeningAnswers({ ...screeningAnswers, [q]: e.target.value })}
                          required
                        />
                      )) ?? (
                        <Input
                          label="Why do you want to join us?"
                          placeholder="Detail your motivation in 2-3 sentences..."
                          value={screeningAnswers["motivation"] ?? ""}
                          onChange={(e) => setScreeningAnswers({ ...screeningAnswers, motivation: e.target.value })}
                          required
                        />
                      )}

                      <Button type="submit" loading={applying} className="w-full mt-2">
                        Submit Application
                      </Button>
                    </form>
                  </div>
                </div>
              )}

            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-navy-800 rounded-xl p-12 text-xs text-gray-500">
              Select an opportunity to view full details and apply.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
