"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DiceInputProps {
  onRoll: (die1: number, die2: number) => void;
  disabled?: boolean;
  inSafeZone?: boolean;
}

export function DiceInput({
  onRoll,
  disabled,
  inSafeZone = true,
}: DiceInputProps) {
  const [total, setTotal] = useState<string>("");
  const [showDoublesMenu, setShowDoublesMenu] = useState(false);

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
      onRoll(die1, die2);
      setTotal("");
    }
  };

  const handleDouble = (value: number) => {
    onRoll(value, value);
    setShowDoublesMenu(false);
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

        <div className="relative flex-1">
          <Button
            variant="outline"
            onClick={() => setShowDoublesMenu(!showDoublesMenu)}
            disabled={disabled || inSafeZone}
            size="lg"
            className="w-full"
          >
            Doubles
          </Button>
          {showDoublesMenu && !inSafeZone && (
            <div className="absolute top-full right-0 mt-1 bg-[#1a0533] border-2 border-[#bf00ff] rounded-md shadow-[0_0_15px_#bf00ff] z-10 p-2 flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((val) => (
                <Button
                  key={val}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDouble(val)}
                  className="w-10 h-10"
                >
                  {val}+{val}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
