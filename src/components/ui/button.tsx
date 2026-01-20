import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-[var(--accent)] text-[var(--accent-foreground)] shadow hover:opacity-90",
      destructive: "bg-red-500 text-white shadow-sm hover:bg-red-500/90",
      outline:
        "border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm hover:bg-[var(--muted)] text-[var(--foreground)]",
      secondary: "bg-[var(--muted)] text-[var(--foreground)] shadow-sm hover:opacity-80",
      ghost: "hover:bg-[var(--muted)] text-[var(--foreground)]",
      link: "text-[var(--accent)] underline-offset-4 hover:underline",
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
