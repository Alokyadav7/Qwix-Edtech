import { useEffect, useState } from "react";
import { contestsAPI } from "../lib/api.js";
import { Link } from "react-router-dom";
import { Trophy, Calendar, Users, Award, ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import CountdownTimer from "../components/ui/CountdownTimer.jsx";

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const data = await contestsAPI.list();
      setContests(data);
    } catch (err) {
      toast.error(err.message ?? "Failed to load contests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleRegister = async (id) => {
    try {
      await contestsAPI.register(id);
      toast.success("Successfully registered for contest!");
      fetchContests(); // refresh list
    } catch (err) {
      toast.error(err.message ?? "Registration failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900/60 to-electric-500/5 p-6 rounded-2xl border border-electric-500/10 text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Coding Arenas & Tournaments
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Solve algorithms, compilation challenges, and win sponsored cash prizes and profiles ranks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="electric" size="md">
            Algorithms
          </Badge>
          <Badge variant="violet" size="md">
            MCQ Quizzes
          </Badge>
        </div>
      </div>

      {/* Contests Grid */}
      {loading ? (
        <div className="text-center text-xs text-gray-500 py-12">Loading events...</div>
      ) : contests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {contests.map((contest) => {
            const isRegistered = contest.participants?.includes("placeholder-user"); // Handle registered users check
            const isLive = new Date(contest.startTime) <= new Date() && new Date(contest.endTime) >= new Date();
            const isUpcoming = new Date(contest.startTime) > new Date();

            return (
              <Card
                key={contest._id}
                variant={isLive ? "highlighted" : "default"}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    {isLive ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-coral-400 uppercase tracking-widest animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-coral-500" />
                        LIVE NOW
                      </span>
                    ) : isUpcoming ? (
                      <Badge variant="electric" size="sm">UPCOMING</Badge>
                    ) : (
                      <Badge variant="ghost" size="sm">ENDED</Badge>
                    )}
                    <span className="text-[10px] text-gray-500 font-bold">₹{contest.prizePool?.toLocaleString()} Prizes</span>
                  </div>

                  <h3 className="text-base font-semibold text-white truncate">{contest.title}</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">
                    {contest.description ?? "Compete in full algorithmic challenge test suites. Show off syntax correctness and execution speeds."}
                  </p>

                  <div className="mt-4 flex flex-col gap-2.5 bg-navy-950/40 p-3 rounded-lg border border-electric-500/5 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-electric-400" /> Date:</span>
                      <span className="text-white">{new Date(contest.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-violet-400" /> Enrolled:</span>
                      <span className="text-white">{contest.participants?.length ?? 120} candidates</span>
                    </div>
                  </div>

                  {isLive && (
                    <div className="mt-4 flex flex-col gap-1.5">
                      <span className="text-xs text-gray-500">Closes in:</span>
                      <CountdownTimer targetDate={new Date(contest.endTime)} />
                    </div>
                  )}

                  {isUpcoming && (
                    <div className="mt-4 flex flex-col gap-1.5">
                      <span className="text-xs text-gray-500">Starts in:</span>
                      <CountdownTimer targetDate={new Date(contest.startTime)} />
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-navy-800 flex justify-end">
                  {isLive ? (
                    <Link to={`/contests/${contest._id}/arena`}>
                      <Button className="w-full">Enter Arena</Button>
                    </Link>
                  ) : isUpcoming ? (
                    <Button onClick={() => handleRegister(contest._id)} className="w-full" variant="secondary">
                      Register Now
                    </Button>
                  ) : (
                    <Link to={`/leaderboard`}>
                      <Button className="w-full" variant="ghost">View Standings</Button>
                    </Link>
                  )}
                </div>

              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-xs text-gray-500 border border-dashed border-navy-800 rounded-xl p-12">
          No coding contests active currently. Create a contest from college dashboards.
        </div>
      )}

    </div>
  );
}
