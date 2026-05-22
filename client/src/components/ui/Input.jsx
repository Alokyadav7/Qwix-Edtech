import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const Input = forwardRef(({
  label,
  error,
  helperText,
  type = "text",
  placeholder,
  className,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          className={twMerge(
            clsx(
              "w-full min-h-[42px] px-3.5 py-2 bg-navy-950/80 border border-electric-500/15 rounded-lg text-sm text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-electric-400 focus:ring-2 focus:ring-electric-500/20",
              error && "border-coral-500 focus:border-coral-500 focus:ring-coral-500/20",
              isPassword && "pr-10",
              className
            )
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {error && <span className="text-[11px] text-coral-400 font-semibold">{error}</span>}
      {!error && helperText && <span className="text-[11px] text-gray-500">{helperText}</span>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
