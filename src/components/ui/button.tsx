import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffff] disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-[#ff2d95] text-white shadow-[0_0_10px_#ff2d95,0_0_20px_#ff2d95] hover:shadow-[0_0_15px_#ff2d95,0_0_30px_#ff2d95] hover:bg-[#ff5aab]",
      destructive: "bg-[#ff3333] text-white shadow-[0_0_10px_#ff3333,0_0_20px_#ff3333] hover:shadow-[0_0_15px_#ff3333,0_0_30px_#ff3333] hover:bg-[#ff5555]",
      outline:
        "border-2 border-[#00ffff] bg-transparent text-[#00ffff] shadow-[0_0_5px_#00ffff] hover:shadow-[0_0_10px_#00ffff,0_0_20px_#00ffff] hover:bg-[#00ffff]/10",
      secondary: "bg-[#bf00ff] text-white shadow-[0_0_10px_#bf00ff] hover:shadow-[0_0_15px_#bf00ff,0_0_25px_#bf00ff] hover:bg-[#d433ff]",
      ghost: "text-[#00ffff] hover:bg-[#00ffff]/10 hover:text-[#00ffff]",
      link: "text-[#00ffff] underline-offset-4 hover:underline hover:text-[#39ff14]",
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
