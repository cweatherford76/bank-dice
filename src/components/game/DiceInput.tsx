"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DiceInputProps {
  onRoll: (die1: number, die2: number, isDoubles?: boolean) => void;
  disabled?: boolean;
  inSafeZone?: boolean;
}

export function DiceInput({
  onRoll,
  disabled,
  inSafeZone = true,
}: DiceInputProps) {
  const [total, setTotal] = useState<string>("");

  const handleSubmit = () => {
    const num = parseInt(total);
    if (num >= 2 && num <= 12) {
      // Split the total into two dice values (avoiding doubles for normal entry)
      let die1: number, die2: number;
      if (num <= 7) {
        die1 = Math.max(1, num - 6);
        die2 = Math.min(6, num - 1);
      } else {
        die1 = num - 6;
        die2 = 6;
      }
      // Pass false for isDoubles - this is a normal roll
      onRoll(die1, die2, false);
      setTotal("");
    }
  };

  const handleDoubles = () => {
    // Record a doubles roll - pass true for isDoubles flag
    // Use 3+3 as a placeholder (the actual sum doesn't matter for doubles display)
    onRoll(3, 3, true);
    setTotal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const isValid = () => {
    const num = parseInt(total);
    return num >= 2 && num <= 12;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Input
          type="number"
          min={2}
          max={12}
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="2-12"
          className="w-24 text-center text-2xl h-14"
          disabled={disabled}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!isValid() || disabled}
          className="flex-1"
          size="lg"
        >
          Record Roll
        </Button>

        <Button
          variant="outline"
          onClick={handleDoubles}
          disabled={disabled || inSafeZone}
          size="lg"
          className="flex-1"
          style={!inSafeZone && !disabled ? {
            borderColor: 'var(--double-border)',
            color: 'var(--double-border)',
          } : {}}
        >
          Doubles
        </Button>
      </div>
    </div>
  );
}
