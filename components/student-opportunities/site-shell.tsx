import Link from "next/link";
import type { ReactNode } from "react";

import { StudentButton } from "./ui";

const navItems = [
  { href: "/student-opportunities#opportunities", label: "Opportunities" },
  { href: "/student-opportunities#compete", label: "Compete" },
  { href: "/student-opportunities#ai-tools", label: "AI Tools" },
  { href: "/student-opportunities/dashboard", label: "Dashboard" },
];

export function StudentOpportunityShell({ children }: { children: ReactNode }) {
  return (
    <div className="elevate-shell">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#020b18]/85 backdrop-blur-xl">
        <div className="relative mx-auto flex min-h-20 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            className="elevate-display text-xl font-semibold text-white"
            href="/student-opportunities"
          >
            EduRise
          </Link>

          <nav className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1 md:flex">
            {navItems.map((item) => (
              <Link
                className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-400 sm:inline">
              3 alerts
            </span>
            <StudentButton className="hidden sm:inline-flex" tone="ghost">
              Sign in
            </StudentButton>
            <StudentButton>Start free</StudentButton>
          </div>
        </div>
      </header>
      <main className="relative z-10">{children}</main>
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-1 rounded-lg border border-white/10 bg-[#061425]/95 p-1 shadow-2xl backdrop-blur-xl md:hidden">
        {navItems.map((item) => (
          <Link
            className="rounded-md px-2 py-2 text-center text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            href={item.href}
            key={item.label}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
