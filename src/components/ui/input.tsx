import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-9 w-full rounded-md border-2 border-[#00ffff] bg-[#0d0221]/80 px-3 py-1 text-base text-[#00ffff] shadow-[0_0_5px_#00ffff,inset_0_0_10px_rgba(0,255,255,0.1)] transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#ff2d95] placeholder:text-[#00ffff]/50 focus-visible:outline-none focus-visible:shadow-[0_0_10px_#00ffff,0_0_20px_#00ffff,inset_0_0_15px_rgba(0,255,255,0.2)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
