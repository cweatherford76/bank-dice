import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-violet-600 text-white shadow-md hover:bg-violet-700 active:bg-violet-800",
      destructive: "bg-rose-500 text-white shadow-sm hover:bg-rose-600 active:bg-rose-700",
      outline:
        "border-2 border-violet-300 bg-white shadow-sm hover:bg-violet-50 hover:border-violet-400 text-violet-700",
      secondary: "bg-cyan-100 text-cyan-800 shadow-sm hover:bg-cyan-200",
      ghost: "hover:bg-violet-100 hover:text-violet-800",
      link: "text-violet-700 underline-offset-4 hover:underline hover:text-violet-900",
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
