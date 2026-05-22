import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = "underline",
  className
}) {
  return (
    <div
      className={twMerge(
        clsx(
          "flex gap-1 border-b border-navy-800",
          variant === "pill" && "border-0 bg-navy-950 p-1 rounded-xl w-fit",
          className
        )
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={twMerge(
              clsx(
                "relative px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none",
                variant === "underline"
                  ? isActive
                    ? "text-electric-400 font-semibold"
                    : "text-gray-400 hover:text-gray-200"
                  : isActive
                  ? "text-white bg-electric-500/20 font-semibold rounded-lg"
                  : "text-gray-400 hover:text-gray-200 rounded-lg hover:bg-navy-900/40"
              )
            )}
            type="button"
          >
            {tab.label}
            {variant === "underline" && isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-electric-400 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
