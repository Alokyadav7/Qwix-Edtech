import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "primary" | "secondary" | "ghost" | "premium";
};

type BadgeProps = {
  children: ReactNode;
  tone?: "electric" | "success" | "warning" | "danger" | "violet";
};

export function StudentButton({
  children,
  className = "",
  tone = "primary",
  ...props
}: ButtonProps) {
  const tones = {
    primary:
      "bg-[linear-gradient(135deg,#0ea5e9,#8b5cf6)] text-white shadow-[0_18px_44px_rgba(14,165,233,0.22)] hover:-translate-y-0.5",
    secondary:
      "border border-sky-300/30 bg-sky-300/10 text-sky-100 hover:border-sky-200/60 hover:bg-sky-300/15",
    ghost: "text-slate-100 hover:bg-white/10",
    premium:
      "elevate-shimmer bg-[linear-gradient(135deg,#f59e0b,#fbbf24)] text-slate-950 hover:-translate-y-0.5",
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function StudentCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`elevate-panel rounded-lg transition duration-200 hover:-translate-y-0.5 hover:border-sky-200/30 ${className}`}
    >
      {children}
    </section>
  );
}

export function StudentBadge({ children, tone = "electric" }: BadgeProps) {
  const tones = {
    electric: "border-sky-300/25 bg-sky-300/10 text-sky-100",
    success: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
    warning: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    danger: "border-rose-300/25 bg-rose-300/10 text-rose-100",
    violet: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ProgressLine({
  label,
  value,
  meta,
}: {
  label: string;
  value: number;
  meta?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-100">{label}</span>
        <span className="text-slate-400">{meta ?? `${value}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#10b981,#0ea5e9,#8b5cf6)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
