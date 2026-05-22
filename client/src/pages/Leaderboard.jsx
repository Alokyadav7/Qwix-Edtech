import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext.jsx";
import { Trophy, ShieldAlert, Award, Star, Medal } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";

export default function Leaderboard() {
  const { socket } = useSocket();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [category, setCategory] = useState("overall"); // overall | contests | hackathons

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?category=${category}`).then(res => res.json()).catch(() => ({}));
      if (response.data) {
        setBoard(response.data);
      } else {
        // Fallback mock board
        setBoard([
          { _id: "u1", name: "Siddharth Sen", score: 2500, matchesMatched: 15, rank: 1 },
          { _id: "u2", name: "Priya Sharma", score: 2200, matchesMatched: 12, rank: 2 },
          { _id: "u3", name: "Aman Gupta", score: 1950, matchesMatched: 10, rank: 3 },
          { _id: "u4", name: "Rohan Das", score: 1700, matchesMatched: 8, rank: 4 },
          { _id: "u5", name: "Neha Patel", score: 1550, matchesMatched: 7, rank: 5 }
        ]);
      }
    } catch {
      // handled above
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [category]);

  useEffect(() => {
    if (!socket) return;
    socket.on("global-leaderboard-update", (updatedBoard) => {
      setBoard(updatedBoard.slice(0, 10));
    });
    return () => {
      socket.off("global-leaderboard-update");
    };
  }, [socket]);

  // Extract top 3 for podium
  const topThree = board.slice(0, 3);
  const remaining = board.slice(3);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900/60 to-electric-500/5 p-6 rounded-2xl border border-electric-500/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            Global Developer Rankings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Rise through ranks. Resolve coding contests, submit hackathons, and optimize ATS scores to increase points.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex gap-1.5 bg-navy-950 p-1 rounded-xl border border-electric-500/10">
          {["overall", "contests", "hackathons"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                category === cat ? "bg-electric-500 text-white" : "text-gray-400 hover:text-white"
              }`}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Visualization */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 items-end max-w-3xl mx-auto mt-6 text-center">
          
          {/* Rank 2 */}
          <div className="flex flex-col items-center">
            <Medal className="h-8 w-8 text-gray-300 mb-2" />
            <div className="h-28 w-full bg-navy-900/80 border border-electric-500/10 rounded-t-xl p-4 flex flex-col justify-center items-center">
              <span className="text-xs font-semibold text-white truncate max-w-[80px]">{topThree[1]?.name}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{topThree[1]?.score} pts</span>
              <div className="mt-2 h-6 w-6 rounded-full bg-navy-950 flex items-center justify-center font-bold text-xs text-gray-300 border border-gray-400">2</div>
            </div>
          </div>

          {/* Rank 1 */}
          <div className="flex flex-col items-center">
            <Trophy className="h-10 w-10 text-amber-400 mb-2 animate-bounce" />
            <div className="h-36 w-full bg-gradient-to-t from-navy-900 to-electric-500/10 border-t-2 border-electric-400 rounded-t-xl p-4 flex flex-col justify-center items-center shadow-glow">
              <span className="text-sm font-bold text-white truncate max-w-[100px]">{topThree[0]?.name}</span>
              <span className="text-xs text-electric-300 font-semibold mt-0.5">{topThree[0]?.score} pts</span>
              <div className="mt-2 h-7 w-7 rounded-full bg-navy-950 flex items-center justify-center font-bold text-sm text-amber-400 border border-amber-400">1</div>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center">
            <Medal className="h-8 w-8 text-amber-600 mb-2" />
            <div className="h-24 w-full bg-navy-900/80 border border-electric-500/10 rounded-t-xl p-4 flex flex-col justify-center items-center">
              <span className="text-xs font-semibold text-white truncate max-w-[80px]">{topThree[2]?.name}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{topThree[2]?.score} pts</span>
              <div className="mt-2 h-6 w-6 rounded-full bg-navy-950 flex items-center justify-center font-bold text-xs text-amber-700 border border-amber-600">3</div>
            </div>
          </div>

        </div>
      )}

      {/* Ranks list table */}
      <Card hoverable={false} className="mt-4 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-navy-800 text-gray-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Interviews Complete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-850">
            {board.map((item, idx) => (
              <tr key={item._id} className="hover:bg-navy-800/20 text-white transition-all duration-150">
                <td className="py-3.5 px-4 font-bold text-gray-400">#{idx + 1}</td>
                <td className="py-3.5 px-4 font-semibold">{item.name}</td>
                <td className="py-3.5 px-4 text-electric-400 font-bold">{item.score} pts</td>
                <td className="py-3.5 px-4 text-gray-400">{item.matchesMatched} sessions</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

    </div>
  );
}
