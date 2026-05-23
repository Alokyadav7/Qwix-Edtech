import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className,
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gradient-to-r from-electric-500 to-violet-500 text-navy-950 hover:shadow-glow-card focus:ring-electric-400 border border-transparent",
    secondary: "border border-electric-500/30 text-electric-400 bg-transparent hover:bg-electric-500/10 focus:ring-electric-500",
    ghost: "text-gray-400 hover:text-white hover:bg-navy-800/40 focus:ring-navy-800",
    danger: "bg-coral-500 text-white hover:bg-coral-600 focus:ring-coral-400",
    premium: "bg-gradient-to-r from-amber-500 to-amber-300 text-navy-950 hover:opacity-95 hover:shadow-glow-card font-bold animate-shimmer bg-[length:200%_auto] focus:ring-amber-400"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5"
  };

  return (
    <motion.button
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {!loading && Icon && iconPosition === "left" && <Icon className="h-4 w-4 shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === "right" && <Icon className="h-4 w-4 shrink-0" />}
    </motion.button>
  );
}
