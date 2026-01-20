import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-9 w-full rounded-md border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1 text-base text-[#e0e0e0] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#00d4ff] placeholder:text-[#555555] focus-visible:outline-none focus-visible:border-[#00d4ff] focus-visible:shadow-[0_0_10px_rgba(0,212,255,0.3),inset_0_1px_3px_rgba(0,0,0,0.5)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
