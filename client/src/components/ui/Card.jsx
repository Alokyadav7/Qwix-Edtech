import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Card({
  children,
  variant = "default",
  hoverable = true,
  className,
  ...props
}) {
  const baseStyles = "rounded-xl border border-electric-500/10 p-5 bg-navy-900/60 backdrop-blur-md shadow-card transition-all duration-300";

  const variants = {
    default: "",
    elevated: "shadow-elevated border-electric-500/20 bg-navy-800/40",
    highlighted: "border-t-2 border-t-electric-400 border-x-electric-500/10 border-b-electric-500/10"
  };

  const hoverStyles = hoverable ? "hover:border-electric-400/40 hover:-translate-y-1 hover:shadow-glow-card" : "";

  return (
    <div
      className={twMerge(clsx(baseStyles, variants[variant], hoverStyles, className))}
      {...props}
    >
      {children}
    </div>
  );
}
