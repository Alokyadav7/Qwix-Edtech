import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Avatar({
  name = "User",
  src,
  size = "md",
  isOnline = false,
  className
}) {
  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl"
  };

  const ringSizes = {
    xs: "p-0.5",
    sm: "p-0.5",
    md: "p-0.5",
    lg: "p-1",
    xl: "p-1.5"
  };

  const getInitials = (n) => {
    return n
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className={twMerge(clsx("relative inline-block select-none shrink-0", className))}>
      <div className={twMerge(clsx("rounded-full bg-gradient-to-tr from-electric-400 to-violet-500", ringSizes[size]))}>
        <div className={twMerge(clsx("h-full w-full rounded-full bg-navy-950 flex items-center justify-center font-bold text-electric-300 overflow-hidden", sizes[size]))}>
          {src ? (
            <img src={src} alt={name} className="h-full w-full object-cover" />
          ) : (
            getInitials(name)
          )}
        </div>
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-neon-400 ring-2 ring-navy-950 animate-pulse" />
      )}
    </div>
  );
}
