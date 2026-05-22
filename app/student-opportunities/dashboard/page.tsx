import {
  ProgressLine,
  StudentBadge,
  StudentButton,
  StudentCard,
} from "../../../components/student-opportunities/ui";

const jobs = [
  {
    company: "Razorpay",
    role: "Frontend Intern",
    match: 92,
    note: "React and TypeScript match",
    closes: "Closes in 3 days",
  },
  {
    company: "Flipkart",
    role: "Software Engineer Trainee",
    match: 87,
    note: "DSA streak helped",
    closes: "New today",
  },
  {
    company: "Meesho",
    role: "Product Analyst Intern",
    match: 81,
    note: "SQL gap worth brushing up",
    closes: "Closes next week",
  },
];

const activity = [
  "Application sent to Swiggy, 2 hours ago",
  "Shortlisted for Razorpay screening",
  "Resume viewed 8 times this week",
  "Certificate earned in HackFest",
];

export default function StudentOpportunityDashboard() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-8 pb-28 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <StudentBadge tone="success">Friday focus</StudentBadge>
          <h1 className="elevate-display mt-4 text-[clamp(2rem,4vw,3.5rem)] font-semibold">
            Good morning, Arjun.
          </h1>
          <p className="mt-2 text-slate-300">
            May 22, 2026. Your strongest move today is finishing one application
            and one interview practice round.
          </p>
        </div>
        <StudentCard className="max-w-xl p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-amber-100">
                Profile is 78% complete
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Add GitHub and one project result to lift match confidence.
              </p>
            </div>
            <StudentButton tone="premium">Finish profile</StudentButton>
          </div>
        </StudentCard>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["12", "Applications sent", "3 this week"],
          ["5", "Interviews scheduled", "Next tomorrow"],
          ["#247", "Contest rank", "Up 150 places"],
          ["87", "AI interview score", "Best round yet"],
        ].map(([value, label, meta]) => (
          <StudentCard className="p-5" key={label}>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="elevate-display mt-4 text-4xl font-semibold">
              {value}
            </p>
            <p className="mt-2 text-sm text-emerald-200">{meta}</p>
          </StudentCard>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,.75fr)]">
        <div className="space-y-4">
          <StudentCard className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-200">
                  Recommended
                </p>
                <h2 className="elevate-display mt-3 text-2xl font-semibold">
                  Opportunities worth your attention
                </h2>
              </div>
              <div className="flex gap-2 text-sm">
                {["Jobs", "Internships", "Contests"].map((tab, index) => (
                  <span
                    className={`rounded-md px-3 py-2 ${
                      index === 0
                        ? "bg-sky-300/15 text-sky-100"
                        : "bg-white/[0.05] text-slate-400"
                    }`}
                    key={tab}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {jobs.map((job) => (
                <article
                  className="rounded-lg border border-white/10 bg-white/[0.045] p-4 transition hover:border-sky-200/30"
                  key={job.role}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{job.company}</p>
                      <h3 className="mt-1 text-lg font-semibold">{job.role}</h3>
                      <p className="mt-2 text-sm text-slate-300">
                        {job.note} · {job.closes}
                      </p>
                    </div>
                    <div className="min-w-56 space-y-3">
                      <ProgressLine label="Match" value={job.match} />
                      <div className="flex gap-2">
                        <StudentButton className="flex-1">Apply</StudentButton>
                        <StudentButton tone="ghost">Save</StudentButton>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </StudentCard>

          <StudentCard className="overflow-hidden p-5">
            <div className="rounded-lg bg-[linear-gradient(135deg,rgba(14,165,233,.32),rgba(139,92,246,.28),rgba(16,185,129,.18))] p-5">
              <StudentBadge tone="violet">AI insight</StudentBadge>
              <h2 className="mt-4 text-2xl font-semibold">
                System design could unlock 34% more matches for your target
                roles.
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-100/85">
                You already show strong frontend depth. Add one architecture
                project note and practice tradeoff questions before applying to
                mid-sized product teams.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <StudentButton tone="premium">Practice interview</StudentButton>
                <StudentButton tone="secondary">View skill gap</StudentButton>
              </div>
            </div>
          </StudentCard>
        </div>

        <aside className="space-y-4">
          <StudentCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Upcoming</h2>
              <StudentBadge tone="danger">1 live</StudentBadge>
            </div>
            <div className="mt-5 space-y-3">
              {[
                ["DSA Sprint", "01:23:45", "Live"],
                ["HackIndia team lock", "Tomorrow", "Deadline"],
                ["Razorpay screen", "Sat 2:00 PM", "Interview"],
              ].map(([name, time, kind]) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
                  key={name}
                >
                  <p className="font-semibold">{name}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-300">
                    <span>{time}</span>
                    <span>{kind}</span>
                  </div>
                </div>
              ))}
            </div>
          </StudentCard>

          <StudentCard className="p-5">
            <h2 className="text-xl font-semibold">Profile checklist</h2>
            <div className="mt-5">
              <ProgressLine label="Profile strength" value={78} />
            </div>
            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Resume uploaded", true],
                ["8 skills added", true],
                ["Project impact written", false],
                ["GitHub connected", false],
              ].map(([task, done]) => (
                <p
                  className="flex items-center justify-between gap-3 rounded-md bg-white/[0.045] p-3 text-slate-200"
                  key={String(task)}
                >
                  <span>{task}</span>
                  <span className={done ? "text-emerald-300" : "text-sky-200"}>
                    {done ? "Done" : "Add"}
                  </span>
                </p>
              ))}
            </div>
          </StudentCard>

          <StudentCard className="p-5">
            <h2 className="text-xl font-semibold">Recent activity</h2>
            <div className="mt-5 space-y-4">
              {activity.map((item) => (
                <p className="flex gap-3 text-sm leading-6 text-slate-300" key={item}>
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-300" />
                  {item}
                </p>
              ))}
            </div>
          </StudentCard>
        </aside>
      </div>
    </section>
  );
}
