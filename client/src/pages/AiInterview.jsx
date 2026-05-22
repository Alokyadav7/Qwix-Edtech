import { useEffect, useState } from "react";
import { interviewAPI, resumeAPI } from "../lib/api.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Sparkles, Play, ShieldAlert, Award, Calendar, BookOpen } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Select from "../components/ui/Select.jsx";

export default function AiInterview() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Wizard selections
  const [topic, setTopic] = useState("React & Frontend");
  const [type, setType] = useState("technical"); // technical | behavioral | mix
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [starting, setStarting] = useState(false);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadWizardData = async () => {
      try {
        const resumeList = await resumeAPI.list();
        setResumes(resumeList);
        if (resumeList.length > 0) {
          setSelectedResumeId(resumeList[0]._id);
        }
        
        const sessions = await interviewAPI.getHistory();
        setHistory(sessions.slice(0, 3));
      } catch (err) {
        console.error("Failed to load mock wizard details", err);
      } finally {
        setLoadingResumes(false);
      }
    };
    loadWizardData();
  }, []);

  const handleStartSession = async () => {
    setStarting(true);
    try {
      const session = await interviewAPI.start(type, {
        topic,
        resumeId: selectedResumeId || undefined
      });
      toast.success("AI Interview session generated!");
      navigate(`/ai-interview/session/${session._id}`);
    } catch (err) {
      toast.error(err.message ?? "Failed to initialize AI interview");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900/60 to-violet-500/5 p-6 rounded-2xl border border-violet-500/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-400" />
            AI Mock Interview Coach
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Build interview confidence. Start specialized verbal simulation loops and receive detailed analytics.
          </p>
        </div>
        <Badge variant="violet" size="md">Generative AI Powered</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns - Wizard Setup */}
        <div className="lg:col-span-2">
          <Card hoverable={false} className="p-6 flex flex-col gap-6">
            <h3 className="text-lg font-display font-bold text-white">Interview Configuration</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Primary Subject Topic"
                options={[
                  { value: "React & Frontend", label: "React & Frontend Engineering" },
                  { value: "Node.js & Backend", label: "Node.js & Backend Systems" },
                  { value: "Data Structures & Algos", label: "Data Structures & Algorithms" },
                  { value: "System Design", label: "System Design & Architecture" },
                  { value: "Behavioral", label: "Behavioral & HR Prep" }
                ]}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              <Select
                label="Evaluation Type"
                options={[
                  { value: "technical", label: "Technical Interview" },
                  { value: "behavioral", label: "Behavioral / HR Interview" },
                  { value: "mixed", label: "Mixed / Full Screening" }
                ]}
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            <Select
              label="Attach Context Resume"
              options={[
                { value: "", label: "No Resume (General Questions)" },
                ...resumes.map((r) => ({ value: r._id, label: r.title }))
              ]}
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              helperText="Attach your CV so the AI asks questions based on your actual history and projects."
            />

            <Button
              onClick={handleStartSession}
              loading={starting}
              icon={Play}
              className="mt-2"
            >
              Start Live Session
            </Button>
          </Card>
        </div>

        {/* Right Column - History Logs */}
        <div className="flex flex-col gap-6">
          <Card hoverable={false}>
            <h3 className="text-base font-display font-semibold text-white mb-4">
              Previous Session Runs
            </h3>

            <div className="flex flex-col gap-3">
              {history.length > 0 ? (
                history.map((sess) => (
                  <div
                    key={sess._id}
                    className="p-3 bg-navy-950/60 border border-electric-500/10 rounded-xl text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-white capitalize">{sess.topic ?? "Mock interview"}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">{new Date(sess.createdAt).toLocaleDateString()}</p>
                    </div>
                    {sess.score ? (
                      <Link to={`/ai-interview/report/${sess._id}`}>
                        <Badge variant="success" className="cursor-pointer hover:opacity-85">
                          Score: {sess.score}/100
                        </Badge>
                      </Link>
                    ) : (
                      <Link to={`/ai-interview/session/${sess._id}`}>
                        <Badge variant="warning" className="cursor-pointer hover:opacity-85">
                          Resume
                        </Badge>
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-navy-800 rounded-xl">
                  No sessions run yet. Configure and start above.
                </div>
              )}
            </div>
          </Card>

          <Card hoverable={false} className="bg-gradient-to-tr from-navy-900 to-violet-500/5 border-violet-500/15">
            <h3 className="text-sm font-semibold text-violet-300 flex items-center gap-1.5">
              <Award className="h-4 w-4" /> Study Recommendations
            </h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Our AI evaluates your weaknesses in communication and backend complexity. Optimize these scores to stand out to verified tech recruiters.
            </p>
          </Card>
        </div>

      </div>

    </div>
  );
}
