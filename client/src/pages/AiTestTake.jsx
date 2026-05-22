import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testsAPI } from "../lib/api.js";
import { toast } from "react-hot-toast";
import { Clipboard, ShieldAlert, ArrowLeft, ArrowRight, Save, Award } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";

export default function AiTestTake() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQIdx, setActiveQIdx] = useState(0);

  // Candidate answers (questionId -> selectedOptionIdx / text)
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Anti-cheat warning counters
  const [warningsCount, setWarningsCount] = useState(0);

  const loadTest = async () => {
    try {
      const data = await testsAPI.get(id);
      setTest(data);
      // Retrieve local auto-save backup
      const backup = localStorage.getItem(`test_answers_${id}`);
      if (backup) {
        setAnswers(JSON.parse(backup));
      }
    } catch {
      // Mock generated test if API fails
      setTest({
        _id: id,
        topic: "JavaScript Concepts",
        questions: [
          {
            _id: "q1",
            question: "Which of the following is correct about features of JavaScript?",
            options: [
              "JavaScript is a lightweight, interpreted programming language.",
              "JavaScript is designed for creating network-centric applications.",
              "JavaScript is complementary to and integrated with Java.",
              "All of the above."
            ]
          },
          {
            _id: "q2",
            question: "How can you get the type of arguments passed to a function?",
            options: [
              "using typeof operator",
              "using getType function",
              "using TypeOf operator",
              "None of the above."
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTest();
  }, [id]);

  // Anti-cheat visibility checker
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setWarningsCount((prev) => {
          const next = prev + 1;
          toast.error(`Exam tab loss warning #${next}! Focus must remain on the test viewport!`, {
            icon: "⚠️",
            duration: 6000
          });
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Block copy/paste/right-clicks on mount
  useEffect(() => {
    const preventAction = (e) => e.preventDefault();
    document.addEventListener("copy", preventAction);
    document.addEventListener("paste", preventAction);
    document.addEventListener("contextmenu", preventAction);

    return () => {
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("paste", preventAction);
      document.removeEventListener("contextmenu", preventAction);
    };
  }, []);

  const handleSelectOption = (qId, optionIdx) => {
    const nextAnswers = { ...answers, [qId]: optionIdx };
    setAnswers(nextAnswers);
    // Auto-save sync
    localStorage.setItem(`test_answers_${id}`, JSON.stringify(nextAnswers));
  };

  const handleSubmitTest = async () => {
    if (!window.confirm("Are you sure you want to submit your assessment?")) return;
    setSubmitting(true);
    try {
      const res = await testsAPI.submit(id, answers);
      toast.success("Test grading completed!");
      localStorage.removeItem(`test_answers_${id}`);
      navigate(`/ai-tests/results/${id}`);
    } catch (err) {
      toast.error("Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-500">Retrieving test viewport...</div>;
  }

  const activeQuestion = test?.questions?.[activeQIdx];

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col pt-16 text-left select-none">
      
      {/* Top Test bar controls */}
      <div className="h-14 bg-navy-900 border-b border-electric-500/15 px-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Clipboard className="h-5 w-5 text-electric-400" />
          <span className="font-display font-semibold text-white truncate max-w-[200px] sm:max-w-none">
            Topic: {test?.topic}
          </span>
          {warningsCount > 0 && (
            <span className="text-[10px] bg-coral-500/20 text-coral-300 font-bold px-2 py-0.5 rounded border border-coral-500/30 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Cheat Warnings: {warningsCount}
            </span>
          )}
        </div>

        <Button size="sm" onClick={handleSubmitTest} loading={submitting}>
          Submit Test
        </Button>
      </div>

      {/* Split Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-120px)]">
        
        {/* Left Side: Navigation index sidebar */}
        <div className="lg:col-span-3 border-r border-electric-500/15 p-6 bg-navy-900/30 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {test?.questions?.map((q, idx) => {
              const answered = answers[q._id] !== undefined;
              const isActive = activeQIdx === idx;

              return (
                <button
                  key={q._id}
                  onClick={() => setActiveQIdx(idx)}
                  className={`h-9 w-9 rounded-lg text-xs font-bold transition-all duration-200 border flex items-center justify-center ${
                    isActive
                      ? "border-electric-400 bg-electric-500/20 text-electric-300 shadow-glow"
                      : answered
                      ? "border-neon-500/30 bg-neon-500/10 text-neon-300"
                      : "border-electric-500/10 bg-navy-950/40 text-gray-500 hover:text-white"
                  }`}
                  type="button"
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Question Display & options */}
        <div className="lg:col-span-9 p-8 overflow-y-auto flex flex-col justify-between">
          {activeQuestion ? (
            <div className="flex flex-col gap-6">
              
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase">Question {activeQIdx + 1} of {test.questions.length}</span>
                <h2 className="text-base sm:text-lg font-semibold text-white mt-2 leading-relaxed">
                  {activeQuestion.question}
                </h2>
              </div>

              {/* Options lists */}
              <div className="flex flex-col gap-3">
                {activeQuestion.options?.map((opt, oIdx) => {
                  const isSelected = answers[activeQuestion._id] === oIdx;

                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(activeQuestion._id, oIdx)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                        isSelected
                          ? "border-electric-400 bg-electric-500/5 shadow-glow"
                          : "border-electric-500/10 bg-navy-900/60 hover:border-electric-400/25"
                      }`}
                    >
                      <span className="text-xs text-gray-200">{opt}</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-electric-400 bg-electric-500" : "border-electric-500/20"
                      }`}>
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-navy-950" />}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center py-12">No question loaded.</div>
          )}

          {/* Navigation Bottom Controls */}
          <div className="flex justify-between items-center border-t border-navy-800 pt-6 mt-8">
            <Button
              variant="secondary"
              size="sm"
              disabled={activeQIdx === 0}
              onClick={() => setActiveQIdx(activeQIdx - 1)}
              icon={ArrowLeft}
            >
              Previous
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              disabled={activeQIdx === (test?.questions?.length ?? 1) - 1}
              onClick={() => setActiveQIdx(activeQIdx + 1)}
              icon={ArrowRight}
              iconPosition="right"
            >
              Next
            </Button>
          </div>

        </div>

      </div>

    </div>
  );
}
