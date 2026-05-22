import Link from "next/link";

import {
  ProgressLine,
  StudentBadge,
  StudentButton,
  StudentCard,
} from "../../components/student-opportunities/ui";

const stats = [
  ["50k+", "students building profiles"],
  ["5k+", "teams hiring early talent"],
  ["10k+", "contests and builds"],
  ["98%", "students say it saves time"],
];

const colleges = [
  "IIT Bombay",
  "IIT Delhi",
  "NIT Trichy",
  "BITS Pilani",
  "VIT",
  "Manipal",
  "DTU",
  "IIIT Hyderabad",
];

const features = [
  {
    title: "Jobs that match your actual skills",
    body: "See why a role fits before you spend an evening on the application.",
    wide: true,
    tone: "87% fit",
  },
  {
    title: "Coding rounds with momentum",
    body: "Live contests, streaks, and a clean arena when you want to focus.",
    tone: "Rank #3",
  },
  {
    title: "AI interviews that sound useful",
    body: "Practice the awkward questions and get feedback you can act on.",
    tone: "B+ today",
  },
  {
    title: "Resume checks before recruiters do",
    body: "Tighten bullets, fix keyword gaps, and keep the human voice.",
    tone: "ATS 82",
  },
  {
    title: "Hackathon team matching",
    body: "Find the teammate who brings the missing skill, not just another invite.",
    tone: "2 open slots",
  },
  {
    title: "Career analytics without noise",
    body: "Track applications, prep hours, and the next sensible move.",
    wide: true,
    tone: "34% lift",
  },
];

const contests = [
  {
    name: "National Coding League",
    state: "Live",
    prize: "INR 50,000",
    clock: "02:34:18 left",
  },
  {
    name: "Build for Bharat",
    state: "Registration open",
    prize: "Internship fast track",
    clock: "Closes in 2 days",
  },
  {
    name: "Frontend Sprint",
    state: "Upcoming",
    prize: "INR 15,000",
    clock: "Starts Saturday",
  },
];

export default function StudentOpportunitiesPage() {
  return (
    <>
      <section className="relative mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-[1400px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)] lg:px-8">
        <div className="relative">
          <div className="absolute -left-5 top-10 hidden h-2 w-2 rounded-full bg-emerald-300 elevate-dot sm:block" />
          <StudentBadge>India&apos;s student career desk</StudentBadge>
          <h1 className="elevate-display mt-6 max-w-4xl text-[clamp(2.5rem,7vw,5.25rem)] font-semibold leading-[0.98] text-white">
            Launch your <span className="elevate-gradient-text">career</span>{" "}
            while college is still happening.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-xl">
            Internships, jobs, hackathons, interview practice, and resume help
            in one place that respects student time. No mystery dashboards. No
            pressure to sound like a corporate brochure.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <StudentButton className="min-h-12 px-6 text-base">
              Build my profile
            </StudentButton>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-sky-300/30 bg-sky-300/10 px-6 text-base font-semibold text-sky-100 transition hover:border-sky-200/60 hover:bg-sky-300/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              href="/student-opportunities/dashboard"
            >
              Open dashboard
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-4 text-sm text-slate-300 sm:flex-row sm:items-center">
            <div className="flex -space-x-2">
              {["AS", "PP", "RK", "ZM", "VN"].map((item) => (
                <span
                  className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#061425] bg-[linear-gradient(135deg,#0ea5e9,#10b981)] text-xs font-bold text-white"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
            <p>
              Joined by 2,00,000+ students across 500+ campuses. Rated{" "}
              <span className="font-semibold text-amber-300">4.9/5</span> by
              people juggling labs, exams, and placements.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {stats.map(([value, label]) => (
              <StudentCard className="p-4" key={label}>
                <p className="elevate-display text-2xl font-semibold text-white">
                  {value}
                </p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </StudentCard>
            ))}
          </div>
        </div>

        <div className="relative hidden min-h-[620px] lg:block">
          <div className="absolute inset-12 rounded-full bg-sky-400/15 blur-3xl" />
          <StudentCard className="elevate-glow absolute inset-x-6 top-12 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <StudentBadge tone="success">Today&apos;s dashboard</StudentBadge>
                <h2 className="elevate-display mt-4 text-3xl font-semibold">
                  Arjun, your next move is clear.
                </h2>
              </div>
              <span className="rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-200">
                78% profile
              </span>
            </div>
            <div className="mt-6 grid gap-4">
              <ProgressLine label="Google SWE internship match" value={95} />
              <ProgressLine label="Resume keywords covered" value={82} />
              <ProgressLine label="Interview confidence trend" value={74} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <p className="text-sm text-slate-400">Applications sent</p>
                <p className="elevate-display mt-2 text-3xl font-semibold">12</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <p className="text-sm text-slate-400">Contest rank</p>
                <p className="elevate-display mt-2 text-3xl font-semibold">
                  #247
                </p>
              </div>
            </div>
          </StudentCard>

          <StudentCard className="elevate-float absolute right-0 top-2 w-72 p-4">
            <StudentBadge>New match</StudentBadge>
            <p className="mt-3 font-semibold">Google SWE Internship</p>
            <p className="mt-1 text-sm text-slate-400">
              React, TypeScript, problem solving
            </p>
          </StudentCard>
          <StudentCard className="elevate-float absolute bottom-24 left-0 w-64 p-4 [animation-delay:1s]">
            <StudentBadge tone="warning">Contest</StudentBadge>
            <p className="mt-3 font-semibold">Rank #3 in DSA Sprint</p>
            <p className="mt-1 text-sm text-slate-400">Prize: INR 5,000</p>
          </StudentCard>
          <StudentCard className="elevate-float absolute bottom-5 right-10 w-72 p-4 [animation-delay:2s]">
            <StudentBadge tone="violet">AI interview</StudentBadge>
            <p className="mt-3 font-semibold">Score 87/100</p>
            <p className="mt-1 text-sm text-slate-400">
              Strong opening. Add one measurable result.
            </p>
          </StudentCard>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.035] py-5">
        <div className="overflow-hidden">
          <div className="elevate-marquee flex min-w-max gap-4 px-4">
            {[...colleges, ...colleges].map((college, index) => (
              <span
                className="rounded-md border border-white/10 px-5 py-2 text-sm font-semibold text-slate-300"
                key={`${college}-${index}`}
              >
                {college}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8"
        id="opportunities"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">
            Built around the week students actually have
          </p>
          <h2 className="elevate-display mt-4 text-[clamp(1.9rem,4vw,3.4rem)] font-semibold leading-tight">
            Everything you need to get hired, without feeling processed.
          </h2>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <StudentCard
              className={`p-5 ${feature.wide ? "md:col-span-2" : ""}`}
              key={feature.title}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-[linear-gradient(135deg,rgba(14,165,233,.24),rgba(139,92,246,.26))] text-lg">
                  +
                </div>
                <StudentBadge>{feature.tone}</StudentBadge>
              </div>
              <h3 className="mt-8 text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-3 max-w-xl leading-7 text-slate-300">
                {feature.body}
              </p>
            </StudentCard>
          ))}
        </div>
      </section>

      <section className="bg-[#061425]/85 py-20" id="ai-tools">
        <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
          <div>
            <StudentBadge tone="violet">AI that coaches</StudentBadge>
            <h2 className="elevate-display mt-5 text-[clamp(1.9rem,4vw,3.2rem)] font-semibold">
              Practice interviews before the real call lands.
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              Pick technical, HR, behavioral, or system design. The feedback is
              direct enough to improve your next answer and kind enough to keep
              you going.
            </p>
            <div className="mt-7 space-y-3">
              {[
                "Voice or text sessions when your hostel is noisy",
                "Specific feedback on structure, examples, and clarity",
                "A study plan built from weak spots, not generic advice",
              ].map((item) => (
                <p
                  className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-3 text-slate-200"
                  key={item}
                >
                  <span className="text-emerald-300">✓</span>
                  {item}
                </p>
              ))}
            </div>
          </div>

          <StudentCard className="p-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Mock interview</p>
                <p className="font-semibold">Frontend Intern, round 2</p>
              </div>
              <StudentBadge tone="success">Live feedback</StudentBadge>
            </div>
            <div className="mt-5 space-y-4">
              <div className="max-w-[86%] rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs font-semibold text-sky-200">Interviewer</p>
                <p className="mt-2 text-slate-200">
                  Tell me about a bug you fixed under time pressure.
                </p>
              </div>
              <div className="ml-auto max-w-[86%] rounded-lg bg-[linear-gradient(135deg,rgba(14,165,233,.3),rgba(16,185,129,.22))] p-4">
                <p className="text-xs font-semibold text-emerald-100">You</p>
                <p className="mt-2 text-slate-100">
                  During our college fest site launch, payments failed on slow
                  networks. I isolated the retry state...
                </p>
              </div>
              <div className="rounded-lg border border-violet-300/15 bg-violet-300/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">Score 7.5/10</p>
                  <StudentBadge tone="warning">Add impact</StudentBadge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Strong context and ownership. Finish with the result: what
                  improved for users after your fix?
                </p>
              </div>
            </div>
          </StudentCard>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8"
        id="compete"
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">
              Compete
            </p>
            <h2 className="elevate-display mt-4 text-[clamp(1.9rem,4vw,3.2rem)] font-semibold">
              Upcoming contests with a reason to show up.
            </h2>
          </div>
          <StudentButton tone="secondary">See all contests</StudentButton>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {contests.map((contest) => (
            <StudentCard className="p-5" key={contest.name}>
              <div className="flex items-center justify-between gap-3">
                <StudentBadge
                  tone={
                    contest.state === "Live"
                      ? "danger"
                      : contest.state === "Registration open"
                        ? "success"
                        : "warning"
                  }
                >
                  {contest.state}
                </StudentBadge>
                <span className="text-sm text-slate-400">{contest.clock}</span>
              </div>
              <h3 className="mt-8 text-xl font-semibold">{contest.name}</h3>
              <p className="mt-3 text-slate-300">{contest.prize}</p>
              <StudentButton className="mt-6 w-full" tone="ghost">
                Open details
              </StudentButton>
            </StudentCard>
          ))}
        </div>
      </section>

      <section className="px-4 pb-28 sm:px-6 lg:px-8">
        <StudentCard className="mx-auto grid w-full max-w-[1400px] gap-6 overflow-hidden p-6 md:grid-cols-[1fr_auto] md:items-center lg:p-8">
          <div>
            <StudentBadge tone="warning">Free to start</StudentBadge>
            <h2 className="elevate-display mt-4 text-3xl font-semibold">
              Make the profile recruiters can read and you can stand behind.
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Start with one resume, three skills, and your next target role.
              EduRise turns that into a calmer application plan.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <StudentButton className="px-6">Create profile</StudentButton>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              href="/student-opportunities/dashboard"
            >
              Preview dashboard
            </Link>
          </div>
        </StudentCard>
      </section>
    </>
  );
}
