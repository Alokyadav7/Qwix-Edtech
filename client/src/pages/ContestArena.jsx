import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { contestsAPI } from "../lib/api.js";
import { useSocket } from "../context/SocketContext.jsx";
import { toast } from "react-hot-toast";
import {
  Terminal,
  Play,
  CheckCircle,
  AlertTriangle,
  Trophy,
  Code,
  FileText,
  Eye,
  Loader2
} from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";

export default function ContestArena() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);

  // Editor states
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [compiling, setCompiling] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState("");

  // Live leaderboard / participants
  const [participantsCount, setParticipantsCount] = useState(1);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);

  // Anti-cheat detection counter
  const [tabLossCount, setTabLossCount] = useState(0);

  const loadContest = async () => {
    try {
      const data = await contestsAPI.get(id);
      setContest(data);
      if (data.problems?.length > 0) {
        // Load local auto-save code if available
        const savedCode = localStorage.getItem(`code_${id}_${data.problems[0]._id}_${language}`);
        setCode(savedCode ?? data.problems[0].starterCode ?? "// Write code here...");
      }
    } catch (err) {
      toast.error("Failed to load contest info");
      navigate("/contests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContest();
  }, [id]);

  // Handle Tab Focus Loss (Anti-Cheat)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabLossCount((prev) => {
          const next = prev + 1;
          toast.error(`Tab loss detected! Warning #${next}. Focus must remain on the coding arena!`, {
            icon: "⚠️",
            duration: 5000
          });
          if (socket) {
            socket.emit("tab-lost", { contestId: id, count: next });
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, socket]);

  // Socket Live Leaderboard listener
  useEffect(() => {
    if (!socket) return;

    socket.emit("join-contest", { contestId: id });

    socket.on("leaderboard-update", (data) => {
      setLiveLeaderboard(data.leaderboard ?? []);
    });

    socket.on("active-count", (data) => {
      setParticipantsCount(data.count ?? 1);
    });

    return () => {
      socket.emit("leave-contest", { contestId: id });
      socket.off("leaderboard-update");
      socket.off("active-count");
    };
  }, [id, socket]);

  const handleProblemChange = (idx) => {
    if (!contest?.problems) return;
    // Auto-save current code first
    const currentProblem = contest.problems[activeProblemIdx];
    localStorage.setItem(`code_${id}_${currentProblem._id}_${language}`, code);

    // Load next code
    const nextProblem = contest.problems[idx];
    const savedCode = localStorage.getItem(`code_${id}_${nextProblem._id}_${language}`);
    setCode(savedCode ?? nextProblem.starterCode ?? "// Write code here...");
    setActiveProblemIdx(idx);
    setConsoleOutput("");
  };

  const handleLanguageChange = (lang) => {
    if (!contest?.problems) return;
    const currentProblem = contest.problems[activeProblemIdx];
    // Save current lang code
    localStorage.setItem(`code_${id}_${currentProblem._id}_${language}`, code);

    // Update state
    setLanguage(lang);
    const nextSavedCode = localStorage.getItem(`code_${id}_${currentProblem._id}_${lang}`);
    setCode(nextSavedCode ?? currentProblem.starterCode ?? "// Write code here...");
  };

  const handleRunCode = async () => {
    if (!contest?.problems) return;
    setCompiling(true);
    setConsoleOutput("Compiling and executing code against stdin...");
    try {
      const currentProblem = contest.problems[activeProblemIdx];
      const res = await contestsAPI.submit(id, currentProblem._id, code, language);
      setConsoleOutput(
        `STATUS: ${res.status}\n\nSTDOUT:\n${res.stdout ?? ""}\n\nSTDERR:\n${res.stderr ?? ""}`
      );
      toast.success("Execution completed!");
    } catch (err) {
      setConsoleOutput(`COMPILE ERROR:\n${err.message}`);
      toast.error("Compilation / Execution failed");
    } finally {
      setCompiling(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-500">Initializing Arena...</div>;
  }

  const activeProblem = contest?.problems?.[activeProblemIdx];

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col pt-16 text-left">
      
      {/* Arena Subheader Controls */}
      <div className="h-14 bg-navy-900 border-b border-electric-500/15 px-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Code className="h-5 w-5 text-electric-400" />
          <span className="font-display font-semibold text-white truncate max-w-[200px] sm:max-w-none">
            {contest?.title}
          </span>
          <Badge variant="electric" size="sm">
            {participantsCount} coding live
          </Badge>
          {tabLossCount > 0 && (
            <span className="text-[10px] bg-coral-500/20 text-coral-300 font-bold px-2 py-0.5 rounded border border-coral-500/30 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Focus Warnings: {tabLossCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 bg-navy-950 border border-electric-500/15 rounded text-xs text-white focus:outline-none"
          >
            <option value="javascript">JavaScript (Node v20)</option>
            <option value="cpp">C++ (GCC v13)</option>
            <option value="python">Python (v3.11)</option>
            <option value="java">Java (JDK 21)</option>
          </select>
          <Button
            size="sm"
            onClick={handleRunCode}
            loading={compiling}
            icon={Play}
          >
            Run Code
          </Button>
        </div>
      </div>

      {/* Main Workspace Split layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-120px)]">
        
        {/* Left Column: Problem details / description */}
        <div className="lg:col-span-5 border-r border-electric-500/15 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-navy-900/30">
          
          {/* Tabs for Multiple Problems */}
          <div className="flex gap-2 border-b border-navy-800 pb-2 overflow-x-auto">
            {contest?.problems?.map((prob, idx) => (
              <button
                key={prob._id}
                onClick={() => handleProblemChange(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-all duration-200 shrink-0 ${
                  activeProblemIdx === idx
                    ? "bg-electric-500/25 text-electric-300 border border-electric-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
                type="button"
              >
                Problem {idx + 1}
              </button>
            ))}
          </div>

          {activeProblem ? (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-display font-bold text-white">
                  {activeProblemIdx + 1}. {activeProblem.title}
                </h2>
                <div className="flex gap-2 mt-2">
                  <Badge variant="violet" size="sm">Difficulty: {activeProblem.difficulty ?? "Medium"}</Badge>
                  <Badge variant="ghost" size="sm">Points: {activeProblem.points ?? 100}</Badge>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                {activeProblem.description ?? "Implement an algorithm to search and compute matches under linear complexity boundaries."}
              </div>

              {/* Constraints */}
              {activeProblem.constraints && (
                <div className="bg-navy-950 p-4 rounded-xl border border-electric-500/5">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Constraints</h4>
                  <p className="text-xs font-mono text-gray-300">{activeProblem.constraints}</p>
                </div>
              )}

              {/* Examples */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Example Cases</h4>
                {activeProblem.examples?.map((ex, i) => (
                  <div key={i} className="flex flex-col gap-2 bg-navy-950/70 p-4 rounded-xl border border-electric-500/10">
                    <div className="text-xs font-semibold text-white">Example {i + 1}</div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Input</span>
                        <pre className="bg-navy-900 p-2 rounded border border-navy-800 text-gray-300 mt-1">{ex.input}</pre>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Output</span>
                        <pre className="bg-navy-900 p-2 rounded border border-navy-800 text-gray-300 mt-1">{ex.output}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center py-12">No problem loaded.</div>
          )}
        </div>

        {/* Right Column: Code Editor & Execution logs */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden h-full">
          
          {/* Editor block */}
          <div className="flex-1 min-h-[40vh] border-b border-electric-500/15">
            <Editor
              theme="vs-dark"
              language={language === "cpp" ? "cpp" : language}
              value={code}
              onChange={(val) => setCode(val ?? "")}
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>

          {/* Console / Terminal logs */}
          <div className="h-44 bg-navy-950 flex flex-col z-10">
            <div className="h-9 bg-navy-900 border-y border-electric-500/15 px-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5 text-electric-400" />
                Execution Log
              </span>
              <button
                onClick={() => setConsoleOutput("")}
                className="text-[10px] text-gray-500 hover:text-white"
                type="button"
              >
                Clear Log
              </button>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-gray-300 bg-navy-950/80 custom-scrollbar select-text whitespace-pre-wrap">
              {consoleOutput || "No compilation outputs yet. Compile code to see logs here."}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
