import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-neon-magenta text-white shadow-lg shadow-neon-magenta/30 hover:bg-neon-magenta/80 hover:shadow-neon-magenta/50",
      destructive: "bg-neon-orange text-white shadow-lg shadow-neon-orange/30 hover:bg-neon-orange/80",
      outline:
        "border-2 border-neon-cyan bg-transparent text-neon-cyan shadow-sm hover:bg-neon-cyan/10 hover:shadow-neon-cyan/30",
      secondary: "bg-retro-card text-neon-cyan border border-retro-border shadow-sm hover:bg-retro-border/50",
      ghost: "hover:bg-retro-card hover:text-neon-cyan",
      link: "text-neon-cyan underline-offset-4 hover:underline",
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
