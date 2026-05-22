import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { jobsAPI, notificationsAPI } from "../lib/api.js";
import { Link } from "react-router-dom";
import {
  Trophy,
  Briefcase,
  Sparkles,
  FileCheck,
  CheckCircle,
  Bell,
  ArrowRight,
  TrendingUp,
  UserCheck
} from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Progress from "../components/ui/Progress.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    matchedCount: 12,
    appliedCount: 4,
    contestRank: 120,
    profileCompleteness: user?.profileCompleteness ?? 75
  });

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const jobs = await jobsAPI.list();
        setRecommendedJobs(jobs.slice(0, 3));
        
        const notis = await notificationsAPI.list();
        setNotifications(notis.slice(0, 4));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* 1. Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900/60 to-electric-500/5 p-6 rounded-2xl border border-electric-500/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Here's what is happening with your applications and rankings today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="electric" size="md">
            Rank #{stats.contestRank}
          </Badge>
          <span className="text-xs text-gray-500 font-medium">Global Dev Leaderboard</span>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable={false} className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-white">{stats.matchedCount}</span>
            <p className="text-xs text-gray-400 mt-1">Best-fit AI Matches</p>
          </div>
          <div className="p-3 bg-electric-500/10 rounded-lg text-electric-400 border border-electric-500/15">
            <Sparkles className="h-5 w-5" />
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-white">{stats.appliedCount}</span>
            <p className="text-xs text-gray-400 mt-1">Active Applications</p>
          </div>
          <div className="p-3 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/15">
            <Briefcase className="h-5 w-5" />
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-white">{stats.contestRank}</span>
            <p className="text-xs text-gray-400 mt-1">Global Contest Rank</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/15">
            <Trophy className="h-5 w-5" />
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-white">{stats.profileCompleteness}%</span>
            <p className="text-xs text-gray-400 mt-1">Profile Strength</p>
          </div>
          <div className="p-3 bg-neon-500/10 rounded-lg text-neon-400 border border-neon-500/15">
            <UserCheck className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* 3. Main Dashboard Layout (Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recommendations & Actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* AI Recommended Jobs */}
          <Card hoverable={false}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-electric-400" />
                AI Matched Opportunities
              </h3>
              <Link to="/opportunities" className="text-xs text-electric-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-4 bg-navy-950/40 rounded-xl border border-electric-500/10 flex justify-between items-center hover:border-electric-400/30 transition-all duration-200"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{job.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{job.companyName ?? "Google"} • {job.location}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="electric" size="sm">{job.kind}</Badge>
                        <Badge variant="success" size="sm">92% Match</Badge>
                      </div>
                    </div>
                    <Link to={`/opportunities`}>
                      <button className="p-2 rounded-lg bg-navy-900 border border-electric-500/15 text-gray-300 hover:text-white hover:bg-navy-800 transition-all duration-200" type="button">
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-navy-800 rounded-xl">
                  No opportunities listed yet.
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/resume" className="group">
              <Card className="h-full bg-gradient-to-tr from-navy-900/80 to-violet-500/5 group-hover:border-violet-500/30">
                <h4 className="font-semibold text-white text-sm group-hover:text-violet-300 transition-all duration-200">
                  Optimize Resume ATS Score
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Analyze keyword gaps against targeting job sheets and export clean formats.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-violet-400 font-bold group-hover:underline">
                  Open Resume Lab <ArrowRight className="h-3 w-3" />
                </div>
              </Card>
            </Link>

            <Link to="/ai-interview" className="group">
              <Card className="h-full bg-gradient-to-tr from-navy-900/80 to-electric-500/5 group-hover:border-electric-400/30">
                <h4 className="font-semibold text-white text-sm group-hover:text-electric-300 transition-all duration-200">
                  Live AI Mock Interview
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Start voice or text mock evaluation rounds with dynamic technical questions.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-electric-400 font-bold group-hover:underline">
                  Launch Wizard <ArrowRight className="h-3 w-3" />
                </div>
              </Card>
            </Link>
          </div>

        </div>

        {/* Right Column: Profile strength, Leaderboard, Alerts */}
        <div className="flex flex-col gap-6">
          
          {/* ProfileCompleteness Dial Card */}
          <Card hoverable={false}>
            <h3 className="text-base font-display font-semibold text-white mb-4">
              Profile Strength
            </h3>
            <div className="flex flex-col gap-4">
              <Progress value={stats.profileCompleteness} label="Profile Completeness" />
              <p className="text-xs text-gray-400 leading-relaxed">
                Add projects, education records, and GitHub credentials to increase visibility to recruiters by up to 4x.
              </p>
              <Link to="/profile">
                <span className="text-xs text-electric-400 hover:underline font-bold">
                  Complete Profile →
                </span>
              </Link>
            </div>
          </Card>

          {/* Dynamic Feed Feed */}
          <Card hoverable={false}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-electric-400" />
                Latest Alerts
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {notifications.length > 0 ? (
                notifications.map((noti) => (
                  <div key={noti._id} className="p-3 bg-navy-950/60 border border-electric-500/10 rounded-xl text-xs flex flex-col gap-0.5">
                    <span className="font-semibold text-white">{noti.title}</span>
                    <span className="text-gray-400">{noti.body}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-gray-500 py-6">
                  No alerts at this time.
                </div>
              )}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
