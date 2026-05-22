import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { testsAPI } from "../lib/api.js";
import { Award, ArrowLeft, RefreshCw, XCircle, CheckCircle2 } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";

export default function AiTestResults() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadResults = async () => {
    try {
      const data = await testsAPI.getResults(id);
      setResults(data);
    } catch {
      // Mock data for fallback
      setResults({
        _id: id,
        topic: "JavaScript Concepts",
        score: 80,
        totalQuestions: 10,
        correctCount: 8,
        createdAt: new Date(),
        breakdown: [
          {
            question: "Which of the following is correct about features of JavaScript?",
            options: [
              "JavaScript is a lightweight, interpreted programming language.",
              "JavaScript is designed for creating network-centric applications.",
              "JavaScript is complementary to and integrated with Java.",
              "All of the above."
            ],
            selectedIdx: 3,
            correctIdx: 3,
            isCorrect: true
          },
          {
            question: "How can you get the type of arguments passed to a function?",
            options: [
              "using typeof operator",
              "using getType function",
              "using TypeOf operator",
              "None of the above."
            ],
            selectedIdx: 1,
            correctIdx: 0,
            isCorrect: false
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-500">Grading results...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Back Link */}
      <div>
        <Link to="/ai-tests" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to test panel
        </Link>
      </div>

      {/* Main Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Score dial Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card hoverable={false} className="text-center flex flex-col items-center justify-center p-8 bg-gradient-to-br from-navy-900 to-violet-500/5">
            <Badge variant="electric" className="mb-4">TEST VERDICT</Badge>
            
            <div className="h-28 w-28 rounded-full border-4 border-neon-400 flex flex-col items-center justify-center shadow-glow mb-4">
              <span className="text-3xl font-display font-bold text-white">{results?.score}%</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Grade</span>
            </div>

            <h3 className="font-semibold text-white">Results Summary</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              You answered {results?.correctCount} out of {results?.totalQuestions ?? 10} questions correctly.
            </p>
          </Card>
        </div>

        {/* Question Review column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card hoverable={false}>
            <h3 className="text-base font-display font-semibold text-white flex items-center gap-2 mb-6">
              <Award className="h-5 w-5 text-electric-400" />
              Answer Sheets Evaluation
            </h3>

            <div className="flex flex-col gap-6">
              {results?.breakdown?.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-3 pb-6 border-b border-navy-800 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-xs font-semibold text-white">
                      Q{idx + 1}. {item.question}
                    </span>
                    {item.isCorrect ? (
                      <span className="text-neon-400 flex items-center gap-1 text-xs font-semibold shrink-0">
                        <CheckCircle2 className="h-4 w-4" /> Correct
                      </span>
                    ) : (
                      <span className="text-coral-400 flex items-center gap-1 text-xs font-semibold shrink-0">
                        <XCircle className="h-4 w-4" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    {item.options?.map((opt, oIdx) => {
                      const isSelected = item.selectedIdx === oIdx;
                      const isCorrect = item.correctIdx === oIdx;

                      return (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-lg border text-xs flex justify-between items-center ${
                            isCorrect
                              ? "bg-neon-500/10 border-neon-500/20 text-neon-300"
                              : isSelected
                              ? "bg-coral-500/10 border-coral-500/20 text-coral-300"
                              : "bg-navy-950/40 border-electric-500/5 text-gray-400"
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && <span className="text-[10px] font-bold uppercase tracking-wider text-neon-400 shrink-0">Correct Answer</span>}
                          {!isCorrect && isSelected && <span className="text-[10px] font-bold uppercase tracking-wider text-coral-400 shrink-0">Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
