import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff] disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-[#00d4ff] text-black shadow-[0_0_10px_rgba(0,212,255,0.5),0_0_20px_rgba(0,212,255,0.3)] hover:bg-[#00b8e6] hover:shadow-[0_0_15px_rgba(0,212,255,0.7),0_0_30px_rgba(0,212,255,0.4)]",
      destructive: "bg-[#ff4444] text-white shadow-[0_0_10px_rgba(255,68,68,0.5)] hover:bg-[#ff2222] hover:shadow-[0_0_15px_rgba(255,68,68,0.7)]",
      outline:
        "border border-[#00d4ff] bg-transparent text-[#00d4ff] shadow-[0_0_5px_rgba(0,212,255,0.3)] hover:bg-[#00d4ff]/10 hover:shadow-[0_0_10px_rgba(0,212,255,0.5)]",
      secondary: "bg-[#1f1f1f] text-[#00d4ff] border border-[#2a2a2a] hover:bg-[#2a2a2a] hover:border-[#00d4ff]/50",
      ghost: "text-[#00d4ff] hover:bg-[#00d4ff]/10 hover:text-[#00d4ff]",
      link: "text-[#00d4ff] underline-offset-4 hover:underline hover:text-[#00b8e6]",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
