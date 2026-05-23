import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy,
  Briefcase,
  Terminal,
  BookOpen,
  FileSpreadsheet,
  LineChart,
  Users,
  Building,
  Target,
  ArrowRight,
  Play,
  Star,
  Check
} from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import CountdownTimer from "../components/ui/CountdownTimer.jsx";
import Navbar from "../components/layout/Navbar.jsx";

export default function Home() {
  const stats = [
    { value: "50,000+", label: "Students Registered", detail: "From top universities" },
    { value: "5,000+", label: "Partner Companies", detail: "MNCs & fast-growth startups" },
    { value: "10,000+", label: "Contests Completed", detail: "Compete in live arenas" },
    { value: "98%", label: "Placement Success", detail: "Active interview pipelines" }
  ];

  const features = [
    {
      title: "Smart Job Matching",
      desc: "Our intelligent matching engine analyzes your projects, skills, and resume to match you with best-fit roles.",
      icon: Target,
      cols: "md:col-span-2",
      visual: (
        <div className="mt-4 flex flex-col gap-2 bg-navy-950/60 p-4 rounded-xl border border-electric-500/10">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Google SWE Intern Match</span>
            <span className="text-electric-400 font-bold">95% Match</span>
          </div>
          <div className="h-2 bg-navy-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-electric-400 to-violet-500 w-[95%]" />
          </div>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] bg-electric-500/15 text-electric-300 px-2 py-0.5 rounded">React</span>
            <span className="text-[10px] bg-electric-500/15 text-electric-300 px-2 py-0.5 rounded">Node.js</span>
            <span className="text-[10px] bg-electric-500/15 text-electric-300 px-2 py-0.5 rounded">Algorithms</span>
          </div>
        </div>
      )
    },
    {
      title: "Live Coding Contests",
      desc: "Compete in real-time hackathons and coding contests. Rise through the ranks on the leaderboard.",
      icon: Terminal,
      cols: "md:col-span-1",
      visual: (
        <div className="mt-4 bg-navy-950/60 p-4 rounded-xl border border-electric-500/10 font-mono text-xs text-gray-400">
          <div className="text-electric-400 font-semibold">def find_target(nums):</div>
          <div className="pl-4">seen = &#123;&#125;</div>
          <div className="pl-4">for i, num in enumerate(nums):</div>
          <div className="pl-8 text-neon-400"># Compiling... Success</div>
        </div>
      )
    },
    {
      title: "Mock Prep Simulator",
      desc: "Receive professional technical and behavioral feedback instantly, scored question by question.",
      icon: BookOpen,
      cols: "md:col-span-1",
      visual: (
        <div className="mt-4 bg-navy-950/60 p-4 rounded-xl border border-electric-500/10 font-mono text-xs text-gray-400">
          <div className="text-white font-semibold">Ready to begin mock interview...</div>
          <div className="text-gray-500 mt-1">&gt; Loaded Question Bank (Behavioral)</div>
          <div className="text-gray-500">&gt; Audio/Video settings checked</div>
          <div className="text-green-400 mt-2">Active Session: Behavioral Mock S2</div>
        </div>
      )
    },
    {
      title: "ATS Resume Lab",
      desc: "Optimize your resume for real job descriptions. Scan keyword gaps and export clean templates.",
      icon: FileSpreadsheet,
      cols: "md:col-span-1",
      visual: (
        <div className="mt-4 bg-navy-950/60 p-4 rounded-xl border border-electric-500/10 flex justify-between items-center">
          <div>
            <div className="text-xs text-white font-semibold">Resume_Arjun.pdf</div>
            <div className="text-[10px] text-gray-500">ATS Optimized</div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold text-neon-400 bg-neon-500/10 rounded-full border border-neon-500/20">
            87/100
          </span>
        </div>
      )
    },
    {
      title: "Live Hackathons",
      desc: "Form dynamic teams, chat inside workspaces, and submit projects to compete for major prizes.",
      icon: Trophy,
      cols: "md:col-span-1",
      visual: (
        <div className="mt-4 bg-navy-950/60 p-4 rounded-xl border border-electric-500/10 text-center">
          <div className="text-xs text-white font-semibold">Team InnovatorsX</div>
          <div className="text-xs text-amber-400 mt-1">Prize Pool: ₹10,00,000</div>
          <div className="flex justify-center -space-x-2 mt-2">
            <div className="h-6 w-6 rounded-full bg-electric-500 text-[10px] text-white flex items-center justify-center font-bold border border-navy-950">A</div>
            <div className="h-6 w-6 rounded-full bg-violet-500 text-[10px] text-white flex items-center justify-center font-bold border border-navy-950">P</div>
            <div className="h-6 w-6 rounded-full bg-neon-500 text-[10px] text-white flex items-center justify-center font-bold border border-navy-950">R</div>
          </div>
        </div>
      )
    },
    {
      title: "Career Analytics",
      desc: "Measure and chart your professional profile completeness, leaderboard standings, and interview ratings.",
      icon: LineChart,
      cols: "md:col-span-2",
      visual: (
        <div className="mt-4 h-24 bg-navy-950/60 p-3 rounded-xl border border-electric-500/10 flex items-end gap-1.5 justify-around">
          <div className="w-8 bg-electric-500/30 rounded-t h-[40%] transition-all duration-300 hover:bg-electric-500" />
          <div className="w-8 bg-electric-500/30 rounded-t h-[65%] transition-all duration-300 hover:bg-electric-500" />
          <div className="w-8 bg-electric-500/30 rounded-t h-[50%] transition-all duration-300 hover:bg-electric-500" />
          <div className="w-8 bg-gradient-to-t from-electric-500 to-violet-500 rounded-t h-[90%]" />
        </div>
      )
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      desc: "Essential features for all students to get started.",
      features: [
        "Apply to 10 jobs/month",
        "3 mock interview practice sessions",
        "Basic resume templates",
        "Join public coding contests"
      ],
      buttonText: "Start Free",
      buttonVariant: "secondary"
    },
    {
      name: "Pro",
      price: "₹299",
      period: "month",
      desc: "Unlock superpowers to boost placement success.",
      features: [
        "Apply to unlimited jobs",
        "Unlimited mock interviews",
        "ATS resume keyword optimizer",
        "Priority match recommendations",
        "Advanced career growth graphs"
      ],
      buttonText: "Start Pro Trial",
      buttonVariant: "premium",
      popular: true
    },
    {
      name: "Corporate",
      price: "Custom",
      period: "contract",
      desc: "Premium recruiting toolsets for HR & colleges.",
      features: [
        "Post unlimited jobs & internships",
        "Automated applicant screening & matching",
        "Host private coding hackathons",
        "Full analytics dashboards"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-navy-950 overflow-x-hidden relative">
      <Navbar onToggleSidebar={() => {}} />
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[30%] left-0 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-neon-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* 1. Hero Section */}
      <section className="pt-32 pb-20 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Badge variant="electric" size="md">
            🚀 India's #1 Student Career Platform
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-display font-bold text-white leading-none tracking-tight max-w-4xl"
        >
          Launch Your Career <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-400 via-electric-300 to-violet-400">
            From College Itself
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-gray-400 text-lg sm:text-xl max-w-2xl leading-relaxed"
        >
          Internships, coding contests, hackathons, mock prep, and ATS resume evaluations—everything you need to stand out and get hired.
        </motion.p>

        {/* CTA Actions */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started Free <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Button size="lg" variant="ghost" icon={Play} className="text-white hover:text-electric-300">
            Watch Demo
          </Button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full bg-navy-800 border-2 border-navy-950 flex items-center justify-center text-[10px] font-bold text-electric-300"
              >
                S{i}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <span>Join 200,000+ students from 500+ campuses</span>
          </div>
        </motion.div>
      </section>

      {/* 2. Stats strip */}
      <section className="py-8 bg-navy-900/40 border-y border-electric-500/10 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-display font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-electric-400 to-violet-400">
                {stat.value}
              </span>
              <span className="text-xs font-semibold text-gray-300 mt-1">{stat.label}</span>
              <span className="text-[10px] text-gray-500">{stat.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features Bento Grid */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge variant="violet" size="sm">
            Core Modules
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-3">
            Everything You Need to Get Hired
          </h2>
          <p className="text-gray-400 mt-2 max-w-xl mx-auto text-sm">
            A comprehensive, modular career preparation and discovery ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} className={feat.cols}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-electric-500/10 border border-electric-500/20 text-electric-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white">
                    {feat.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                  {feat.desc}
                </p>
                {feat.visual}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. Live Contests Section */}
      <section className="py-20 bg-navy-900/30 border-y border-electric-500/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
            <div>
              <Badge variant="success" size="sm">
                Compete Live
              </Badge>
              <h2 className="text-3xl font-display font-bold text-white mt-2">
                Live Contests & Hackathons
              </h2>
            </div>
            <Link to="/contests" className="text-xs text-electric-400 hover:underline mt-2 sm:mt-0 font-semibold">
              View All Events →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Live Coding League Card */}
            <Card variant="highlighted" className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-coral-400 uppercase tracking-widest animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-coral-500" />
                    LIVE NOW
                  </span>
                  <Badge variant="ghost" size="sm">DSA Algorithm</Badge>
                </div>
                <h3 className="text-base font-semibold text-white">National Coding League — S4</h3>
                <p className="text-gray-400 text-xs mt-2">Sponsored by Google & Razorpay. Open to all students.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <span className="text-xs text-gray-400">Time Remaining:</span>
                  <CountdownTimer targetDate={new Date(Date.now() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000)} />
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center border-t border-navy-800 pt-4">
                <span className="text-xs font-semibold text-amber-400">Prize Pool: ₹50,000</span>
                <Link to="/contests">
                  <Button size="sm">Enter Arena</Button>
                </Link>
              </div>
            </Card>

            {/* Hackathon Card */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="electric" size="sm">REGISTRATIONS OPEN</Badge>
                  <Badge variant="ghost" size="sm">Web App</Badge>
                </div>
                <h3 className="text-base font-semibold text-white">HackIndia 2026 — Dev Challenge</h3>
                <p className="text-gray-400 text-xs mt-2">Build products targeting environmental sustainability using modern web and mobile tech.</p>
                <div className="mt-4 flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Starts in: 5 days</span>
                  <span className="text-xs text-gray-400">Team Size: 2–4 members</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center border-t border-navy-800 pt-4">
                <span className="text-xs font-semibold text-amber-400">Prize: ₹10,00,000</span>
                <Link to="/hackathons">
                  <Button size="sm" variant="secondary">Register Team</Button>
                </Link>
              </div>
            </Card>

            {/* Upcoming Quiz Card */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="violet" size="sm">UPCOMING</Badge>
                  <Badge variant="ghost" size="sm">Core CS</Badge>
                </div>
                <h3 className="text-base font-semibold text-white">DBMS & OS Foundations Quiz</h3>
                <p className="text-gray-400 text-xs mt-2">Quick 30-minute test evaluating knowledge on OS processes and database transactions.</p>
                <div className="mt-4 flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Starts: Tomorrow 6:00 PM</span>
                  <span className="text-xs text-gray-400">Questions: 40 MCQs</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center border-t border-navy-800 pt-4">
                <span className="text-xs font-semibold text-amber-400">Prize: Certificate + Badges</span>
                <Link to="/contests">
                  <Button size="sm" variant="secondary">Register</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <Badge variant="amber" size="sm">
            Plans & Access
          </Badge>
          <h2 className="text-3xl font-display font-bold text-white mt-3">
            Choose Your Career Path
          </h2>
          <p className="text-gray-400 mt-2 max-w-xl mx-auto text-sm">
            Unlock professional modules to practice mock interviews, customize resume PDFs, and rank globally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {pricingPlans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl border bg-navy-900/60 p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? "border-electric-400/50 shadow-glow-card scale-105 z-10"
                  : "border-electric-500/10 hover:border-electric-400/20"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-amber-300 text-navy-950">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="text-lg font-display font-bold text-white">{plan.name}</h3>
                <p className="text-gray-400 text-xs mt-2 min-h-[32px]">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-white">{plan.price}</span>
                  <span className="text-xs text-gray-500">/ {plan.period}</span>
                </div>
                
                <ul className="mt-8 flex flex-col gap-3">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <Check className="h-4 w-4 text-electric-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link to="/register">
                  <Button variant={plan.buttonVariant} className="w-full">
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-navy-950 border-t border-electric-500/10 pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <span className="text-lg font-display font-bold text-white tracking-tight">
              Qwix
            </span>
            <p className="text-gray-500 text-xs mt-3 leading-relaxed">
              Automating career discovery, training, testing, and resume creation for the next generation of builders.
            </p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Platform</h4>
            <div className="flex flex-col gap-2.5 text-xs text-gray-400">
              <Link to="/opportunities" className="hover:text-white">Browse Jobs</Link>
              <Link to="/contests" className="hover:text-white">Coding Arenas</Link>
              <Link to="/hackathons" className="hover:text-white">Hackathons</Link>
              <Link to="/resume" className="hover:text-white">Resume Lab</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Company</h4>
            <div className="flex flex-col gap-2.5 text-xs text-gray-400">
              <a href="#" className="hover:text-white">About Us</a>
              <a href="#" className="hover:text-white">Blog</a>
              <a href="#" className="hover:text-white">Careers</a>
              <a href="#" className="hover:text-white">Partners</a>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Newsletter</h4>
            <p className="text-gray-500 text-xs mb-3">Get weekly job alerts direct to your inbox.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email Address"
                className="bg-navy-900 border border-electric-500/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-electric-400"
              />
              <Button type="submit" size="sm">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-navy-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <span>© 2026 Qwix. Made with ❤️ for Indian Students.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
