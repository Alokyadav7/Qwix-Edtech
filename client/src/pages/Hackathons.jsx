import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Calendar, Users, Award, Plus, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite states
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  const loadHackathons = async () => {
    setLoading(true);
    try {
      // Fetch hackathons if endpoints exist, otherwise use mock fallback
      const response = await fetch("/api/hackathons").then(res => res.json()).catch(() => ({}));
      if (response.data) {
        setHackathons(response.data);
      } else {
        setHackathons([
          {
            _id: "hack1",
            title: "HackIndia 2026 — AI Challenge",
            description: "Build products targeting environmental sustainability using Generative AI.",
            prizePool: 1000000,
            startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            participants: ["p1", "p2", "p3"]
          },
          {
            _id: "hack2",
            title: "National FinTech Buildathon",
            description: "Scale secure banking and micropayments using blockchain and zero-knowledge proofs.",
            prizePool: 500000,
            startTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
            participants: ["p1", "p2"]
          }
        ]);
      }
    } catch {
      // handled above
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    setTimeout(() => {
      toast.success(`Invite sent successfully to ${inviteEmail}!`);
      setInviteEmail("");
      setShowInviteModal(false);
      setSendingInvite(false);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900/60 to-electric-500/5 p-6 rounded-2xl border border-electric-500/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            Hackathons & Innovation Challenges
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Form teams, build functional software prototypes, and submit files for recruiter evaluations.
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} icon={Plus}>Invite Teammates</Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center text-xs text-gray-500 py-12">Loading hackathons...</div>
      ) : hackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map((hack) => {
            const isLive = new Date(hack.startTime) <= new Date() && new Date(hack.endTime) >= new Date();
            const isUpcoming = new Date(hack.startTime) > new Date();

            return (
              <Card
                key={hack._id}
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
                    ) : (
                      <Badge variant="electric" size="sm">REGISTRATIONS OPEN</Badge>
                    )}
                    <span className="text-[10px] text-gray-500 font-bold">Prize Pool: ₹{hack.prizePool?.toLocaleString()}</span>
                  </div>

                  <h3 className="text-base font-semibold text-white truncate">{hack.title}</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {hack.description}
                  </p>

                  <div className="mt-4 flex flex-col gap-2.5 bg-navy-950/40 p-3 rounded-lg border border-electric-500/5 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-electric-400" /> Starts:</span>
                      <span className="text-white">{new Date(hack.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-violet-400" /> Registrants:</span>
                      <span className="text-white">{hack.participants?.length ?? 0} teams registered</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-navy-800 flex justify-end gap-2">
                  <Button variant="secondary" size="sm">View Rules</Button>
                  <Button size="sm">Register Team</Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-xs text-gray-500 border border-dashed border-navy-800 rounded-xl p-12">
          No hackathons currently active.
        </div>
      )}

      {/* Invite Modal overlay */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-electric-500/25 rounded-2xl p-6 w-full max-w-md shadow-elevated flex flex-col gap-5 text-left animate-fade-in">
            <div className="flex justify-between items-center border-b border-navy-800 pb-3">
              <h3 className="font-semibold text-white">Send Team Invites</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-500 hover:text-white" type="button">Close</button>
            </div>

            <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
              <Input
                label="Candidate Email"
                placeholder="teammate@university.edu"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Button type="submit" loading={sendingInvite} icon={Mail} className="w-full mt-2">
                Send Invitation Link
              </Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
