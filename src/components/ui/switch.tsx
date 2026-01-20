"use client";

import * as React from "react";

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, className = "", id }, ref) => {
    return (
      <button
        ref={ref}
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0221] disabled:cursor-not-allowed disabled:opacity-50 ${
          checked
            ? "border-[#39ff14] bg-[#39ff14] shadow-[0_0_10px_#39ff14]"
            : "border-[#bf00ff] bg-[#1a0533]"
        } ${className}`}
      >
        <span
          className={`pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform ${
            checked
              ? "translate-x-4 bg-[#0d0221]"
              : "translate-x-0 bg-[#bf00ff]"
          }`}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
