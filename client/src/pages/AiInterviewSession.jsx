import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { interviewAPI } from "../lib/api.js";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { Mic, MicOff, Send, HelpCircle, StopCircle, Award, Volume2, ShieldAlert } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";

export default function AiInterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live simulation states
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Sockets for live evaluation streams
  const socketRef = useRef(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);

  const loadSession = async () => {
    try {
      // Re-fetch historical report if already completed
      const data = await interviewAPI.getReport(id);
      if (data && data.score) {
        toast.success("This interview has already completed.");
        navigate(`/ai-interview/report/${id}`);
        return;
      }
    } catch {
      // No report yet, safe to proceed
    }

    try {
      const data = await interviewAPI.start("technical", { sessionId: id }); // fetch details
      setSession(data);
      if (data.questions?.length > 0) {
        setCurrentQuestion(data.questions[0].question);
      }
    } catch {
      // mock setup if not exists
      setSession({ _id: id, topic: "Full Stack Engineer" });
      setCurrentQuestion("Welcome! Let's start the interview. Can you describe how you configure and optimize a MongoDB database for high concurrency workloads?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();

    // Connect to Interview namespace
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
    const socketUrl = `${apiUrl.replace(/\/api$/, "")}/interview`;
    const token = window.localStorage.getItem("sop-token");

    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
      query: { sessionId: id }
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-session", { sessionId: id });
    });

    socket.on("timer-tick", (data) => {
      setTimerSeconds(data.elapsedSeconds ?? 0);
    });

    socket.on("ai-thinking", () => {
      setThinking(true);
      setSpeaking(false);
    });

    socket.on("ai-response-stream", (data) => {
      setThinking(false);
      setSpeaking(true);
      setCurrentQuestion((prev) => prev + data.token);
    });

    socket.on("session-ended", () => {
      toast.success("Interview session complete!");
      navigate(`/ai-interview/report/${id}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleSendText = async () => {
    if (!textAnswer.trim()) return;
    setThinking(true);
    const ans = textAnswer;
    setTextAnswer("");
    try {
      const res = await interviewAPI.respond(id, ans);
      if (res.nextQuestion) {
        setCurrentQuestion(res.nextQuestion);
      }
      if (res.completed) {
        toast.success("Processing evaluation scores...");
        navigate(`/ai-interview/report/${id}`);
      }
    } catch (err) {
      toast.error("Failed to submit response");
    } finally {
      setThinking(false);
    }
  };

  // Audio Recording helpers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setThinking(true);
        try {
          const res = await interviewAPI.voiceRespond(id, audioBlob);
          if (res.nextQuestion) {
            setCurrentQuestion(res.nextQuestion);
          }
          if (res.completed) {
            toast.success("Processing final scores...");
            navigate(`/ai-interview/report/${id}`);
          }
        } catch (err) {
          toast.error("Audio processing failed: " + err.message);
        } finally {
          setThinking(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (err) {
      toast.error("Microphone access denied or unsupported");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      // Clean track stream
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      toast.success("Processing voice input...");
    }
  };

  const handleEndInterview = async () => {
    if (window.confirm("Are you sure you want to end the interview early? Scores will be calculated on completed responses.")) {
      try {
        await interviewAPI.end(id);
        navigate(`/ai-interview/report/${id}`);
      } catch {
        navigate(`/ai-interview/report/${id}`);
      }
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-500">Connecting Simulation...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Timer / Control Bar */}
      <div className="flex justify-between items-center bg-navy-900 border border-electric-500/15 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-electric-400" />
          <span className="text-sm font-semibold text-white">Topic: {session?.topic}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-bold text-electric-300">
            ELAPSED: {formatTime(timerSeconds)}
          </span>
          <Button onClick={handleEndInterview} variant="danger" size="sm" icon={StopCircle}>
            End Interview
          </Button>
        </div>
      </div>

      {/* Interviewer AI Bubble */}
      <Card hoverable={false} className="relative overflow-hidden bg-gradient-to-tr from-navy-900 to-violet-500/5 border-violet-500/20">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-violet-500 flex items-center justify-center font-bold text-white shrink-0 shadow-glow">
            AI
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest block">Interviewer</span>
            
            {thinking ? (
              <div className="flex items-center gap-1 mt-3">
                <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            ) : (
              <p className="text-sm text-gray-200 mt-2 leading-relaxed whitespace-pre-wrap">
                {currentQuestion}
              </p>
            )}

            {speaking && (
              <span className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold uppercase">
                <Volume2 className="h-3.5 w-3.5 text-violet-400 animate-pulse" /> Speaking Stream...
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Answer Inputs Box */}
      <Card hoverable={false} className="p-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Provide Your Response</h3>

        <div className="flex flex-col gap-4">
          
          {/* Dual Toggle Option: Voice / Text */}
          <div className="flex items-center justify-center gap-4 py-4 bg-navy-950/40 rounded-xl border border-electric-500/5">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={thinking}
                className="flex flex-col items-center justify-center h-20 w-20 rounded-full bg-electric-500 text-white hover:shadow-glow-card transition-all duration-300 disabled:opacity-50"
                type="button"
              >
                <Mic className="h-6 w-6" />
                <span className="text-[10px] font-bold mt-1 uppercase">Record</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex flex-col items-center justify-center h-20 w-20 rounded-full bg-coral-500 text-white hover:shadow-glow-card animate-pulse"
                type="button"
              >
                <MicOff className="h-6 w-6" />
                <span className="text-[10px] font-bold mt-1 uppercase">Stop</span>
              </button>
            )}
            <div className="text-xs text-gray-500 max-w-[200px]">
              {isRecording
                ? "Microphone listening... Click stop when finished speaking to transcribe answers."
                : "Submit responses verbally using audio transcriber tools, or type response below."}
            </div>
          </div>

          <div className="relative">
            <textarea
              placeholder="Or type your reply here... (Press enter or send to submit)"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={thinking}
              rows={4}
              className="w-full p-4 bg-navy-950 border border-electric-500/15 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-electric-400 focus:ring-2 focus:ring-electric-500/20 disabled:opacity-50"
            />
            <button
              onClick={handleSendText}
              disabled={thinking || !textAnswer.trim()}
              className="absolute right-3 bottom-4 p-2 rounded-lg bg-electric-500 text-white hover:bg-electric-600 disabled:opacity-50"
              type="button"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>
      </Card>

    </div>
  );
}
