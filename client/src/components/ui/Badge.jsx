import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Badge({
  children,
  variant = "electric",
  size = "md",
  icon: Icon,
  className,
  ...props
}) {
  const baseStyles = "inline-flex items-center gap-1 font-semibold rounded-full uppercase tracking-wider select-none";

  const variants = {
    electric: "bg-electric-500/10 text-electric-300 border border-electric-500/25",
    violet: "bg-violet-500/10 text-violet-300 border border-violet-500/25",
    success: "bg-neon-500/10 text-neon-300 border border-neon-500/25",
    warning: "bg-amber-500/10 text-amber-300 border border-amber-500/25",
    danger: "bg-coral-500/10 text-coral-300 border border-coral-500/25",
    ghost: "bg-navy-800/40 text-gray-400 border border-navy-700"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[9px]",
    md: "px-2.5 py-1 text-[11px]"
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {Icon && <Icon className="h-3 w-3" />}
      <span>{children}</span>
    </span>
  );
}
