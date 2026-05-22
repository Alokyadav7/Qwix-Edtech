import { useEffect, useState } from "react";
import { testsAPI } from "../lib/api.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Sparkles, Clipboard, ShieldAlert, Play, CheckCircle } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Select from "../components/ui/Select.jsx";

export default function AiTests() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("JavaScript");
  const [difficulty, setDifficulty] = useState("medium"); // easy | medium | hard
  const [questionCount, setQuestionCount] = useState("10");
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const data = await testsAPI.getHistory();
      setHistory(data.slice(0, 4));
    } catch {
      // Mock history
      setHistory([
        { _id: "test1", topic: "JavaScript", difficulty: "medium", score: 80, createdAt: new Date() },
        { _id: "test2", topic: "Python Basics", difficulty: "easy", score: 90, createdAt: new Date() }
      ]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerateTest = async () => {
    setLoading(true);
    try {
      const test = await testsAPI.generate(topic, {
        difficulty,
        limit: parseInt(questionCount)
      });
      toast.success("AI Adaptive Test generated!");
      navigate(`/ai-tests/take/${test._id}`);
    } catch (err) {
      toast.error(err.message ?? "Failed to generate test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900/60 to-electric-500/5 p-6 rounded-2xl border border-electric-500/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-2">
            <Clipboard className="h-6 w-6 text-electric-400" />
            AI Adaptive Test Engine
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Test your capabilities dynamically. The AI shifts question complexity based on your answers as you type.
          </p>
        </div>
        <Badge variant="electric" size="md">Adaptive Learning</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Setup Card */}
        <div className="lg:col-span-2">
          <Card hoverable={false} className="p-6 flex flex-col gap-5">
            <h3 className="text-lg font-display font-bold text-white">Generate Custom Assessment</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Topic Area"
                options={[
                  { value: "JavaScript", label: "JavaScript / ES6+" },
                  { value: "Python Basics", label: "Python Basics" },
                  { value: "DSA Concepts", label: "Data Structures & Algos" },
                  { value: "Database (SQL/NoSQL)", label: "Databases (SQL & NoSQL)" },
                  { value: "Networks & OS", label: "Networks & Operating Systems" }
                ]}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              <Select
                label="Difficulty Tier"
                options={[
                  { value: "easy", label: "Easy foundations" },
                  { value: "medium", label: "Medium analytics" },
                  { value: "hard", label: "Hard expert cases" }
                ]}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              />

              <Select
                label="Length"
                options={[
                  { value: "5", label: "5 Questions (Quick)" },
                  { value: "10", label: "10 Questions (Std)" },
                  { value: "20", label: "20 Questions (Deep)" }
                ]}
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerateTest}
              loading={loading}
              icon={Play}
              className="mt-2"
            >
              Generate Test
            </Button>
          </Card>
        </div>

        {/* History / Rules */}
        <div className="flex flex-col gap-6">
          <Card hoverable={false}>
            <h3 className="text-base font-display font-semibold text-white mb-4">
              Completed Assessments
            </h3>
            <div className="flex flex-col gap-3">
              {history.map((h, i) => (
                <div key={i} className="p-3 bg-navy-950/60 border border-electric-500/10 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white capitalize">{h.topic}</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">{h.difficulty} • {new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                  {h.score !== undefined ? (
                    <Link to={`/ai-tests/results/${h._id}`}>
                      <Badge variant="success" className="cursor-pointer hover:opacity-85">
                        Score: {h.score}%
                      </Badge>
                    </Link>
                  ) : (
                    <Link to={`/ai-tests/take/${h._id}`}>
                      <Badge variant="warning" className="cursor-pointer hover:opacity-85">
                        Incomplete
                      </Badge>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card hoverable={false} className="border-coral-500/15 bg-gradient-to-tr from-navy-900 to-coral-500/5">
            <h4 className="text-xs font-semibold text-coral-400 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> Exam Anti-Cheat Rules
            </h4>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              Assessment panels feature focus tracker logic. Leaving the exam tab or copying/pasting responses generates warnings that log directly to the grading sheet.
            </p>
          </Card>
        </div>

      </div>

    </div>
  );
}
