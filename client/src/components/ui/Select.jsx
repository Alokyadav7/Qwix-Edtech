import { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  className,
  children,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      <select
        ref={ref}
        className={twMerge(
          clsx(
            "w-full min-h-[42px] px-3.5 py-2 bg-navy-950/80 border border-electric-500/15 rounded-lg text-sm text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-electric-400 focus:ring-2 focus:ring-electric-500/20",
            error && "border-coral-500 focus:border-coral-500 focus:ring-coral-500/20",
            className
          )
        )}
        {...props}
      >
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-navy-900 text-white">
                {opt.label}
              </option>
            ))}
      </select>

      {error && <span className="text-[11px] text-coral-400 font-semibold">{error}</span>}
      {!error && helperText && <span className="text-[11px] text-gray-500">{helperText}</span>}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
