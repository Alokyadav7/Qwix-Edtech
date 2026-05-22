import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { interviewAPI } from "../lib/api.js";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Award, BookOpen, AlertTriangle, MessageSquare, ArrowLeft, RefreshCw } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";

export default function AiInterviewReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      const data = await interviewAPI.getReport(id);
      setReport(data);
    } catch {
      // Mock data for display
      setReport({
        _id: id,
        topic: "React & Frontend",
        score: 82,
        feedback: "Solid subject matter comprehension. Communication is clear, although you should elaborate more on security paradigms.",
        metrics: {
          subjectKnowledge: 85,
          communication: 80,
          logicalFlow: 88,
          toneConfidence: 75
        },
        transcript: [
          {
            question: "Can you explain the virtual DOM reconciliation in React 18?",
            answer: "React uses a virtual DOM representation. When state updates, it generates a new tree and diffs it with the old tree to batch changes to the real DOM.",
            feedback: "Correct, but you missed mentioning Fiber architecture fibers scheduling priority levels."
          },
          {
            question: "How do you secure Node.js applications against CSRF?",
            answer: "Use tokens, HTTPOnly cookies, and configure CORS correctly to restrict domain lookups.",
            feedback: "Very good. Elaborated correctly on security configurations."
          }
        ],
        studyPlan: [
          { module: "Fiber Architecture deep dive", source: "React Dev Documentation" },
          { module: "CORS and Session Authentication strategies", source: "OWASP Cheat Sheet Series" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-500">Compiling analytics...</div>;
  }

  // Prep Recharts data
  const chartData = [
    { subject: "Subject Knowledge", A: report?.metrics?.subjectKnowledge ?? 80, fullMark: 100 },
    { subject: "Communication", A: report?.metrics?.communication ?? 80, fullMark: 100 },
    { subject: "Logical Flow", A: report?.metrics?.logicalFlow ?? 80, fullMark: 100 },
    { subject: "Tone & Conf.", A: report?.metrics?.toneConfidence ?? 80, fullMark: 100 }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Back button */}
      <div>
        <Link to="/ai-interview" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to mock portal
        </Link>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Overall stats, chart */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card hoverable={false} className="text-center flex flex-col items-center justify-center p-8 bg-gradient-to-br from-navy-900 to-violet-500/5">
            <Badge variant="violet" className="mb-4">EVALUATION METRICS</Badge>
            <div className="h-28 w-28 rounded-full border-4 border-violet-400 flex flex-col items-center justify-center shadow-glow mb-4">
              <span className="text-3xl font-display font-bold text-white">{report?.score}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold">out of 100</span>
            </div>
            <h3 className="font-semibold text-white">Overall Performance</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{report?.feedback}</p>
          </Card>

          {/* Radar Chart */}
          <Card hoverable={false} className="p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Performance Radar</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#163D6A" />
                  <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" fontSize={8} />
                  <Radar name="Candidate" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column: Transcript, Suggestions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Transcript Feedback */}
          <Card hoverable={false}>
            <h3 className="text-base font-display font-semibold text-white flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-electric-400" />
              Dialogue Breakdown
            </h3>

            <div className="flex flex-col gap-6">
              {report?.transcript?.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-3 pb-6 border-b border-navy-800 last:border-b-0 last:pb-0">
                  <div className="text-xs bg-navy-950/80 p-3 rounded-lg border border-electric-500/10 text-gray-300">
                    <span className="font-semibold text-violet-400">Q:</span> {item.question}
                  </div>
                  <div className="text-xs bg-electric-500/5 p-3 rounded-lg border border-electric-500/20 text-electric-300">
                    <span className="font-semibold">Your response:</span> {item.answer}
                  </div>
                  <div className="text-[11px] bg-amber-500/5 p-3 rounded-lg border border-amber-500/15 text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Coaching tip:</span> {item.feedback}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Generated Study Plan */}
          <Card hoverable={false}>
            <h3 className="text-base font-display font-semibold text-white flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-violet-400" />
              AI Study Plan Recommendation
            </h3>

            <div className="flex flex-col gap-3">
              {report?.studyPlan?.map((plan, index) => (
                <div key={index} className="p-3 bg-navy-950/60 border border-electric-500/10 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white">{plan.module}</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">Reference: {plan.source}</p>
                  </div>
                  <RefreshCw className="h-4 w-4 text-electric-400 animate-spin" style={{ animationDuration: "10s" }} />
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
