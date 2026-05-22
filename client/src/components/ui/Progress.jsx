import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Progress({
  value = 0,
  max = 100,
  label,
  showValue = true,
  className
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={twMerge(clsx("w-full flex flex-col gap-1.5", className))}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percent)}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-navy-950 rounded-full overflow-hidden border border-electric-500/10 p-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-electric-400 to-violet-500 shadow-glow"
        />
      </div>
    </div>
  );
}
