"use client";

import { useState } from "react";
import { Roll, GameOptions } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RollHistoryProps {
  rolls: Roll[];
  currentRound: number;
  isBanker?: boolean;
  onEditRoll?: (rollId: string, die1: number, die2: number) => void;
  gameOptions?: GameOptions;
  safeZoneRolls?: number;
}

const resultColors: Record<string, string> = {
  normal: "bg-zinc-100 text-zinc-800",
  double: "bg-purple-100 text-purple-800",
  seven: "bg-blue-100 text-blue-800",
  bust: "bg-red-100 text-red-800",
  snakeeyes: "bg-green-100 text-green-800",
  lucky11: "bg-amber-100 text-amber-800",
};

function getDisplayLabel(roll: Roll, gameOptions?: GameOptions, safeZoneRolls: number = 3): { label: string; colorKey: string } {
  const sum = roll.die1 + roll.die2;
  const isSnakeEyes = roll.die1 === 1 && roll.die2 === 1;
  const isLucky11 = sum === 11;
  const inSafeZone = roll.rollNumber <= safeZoneRolls;

  // Snake Eyes takes priority if option enabled and in danger zone
  if (isSnakeEyes && gameOptions?.snakeEyesBonus && !inSafeZone) {
    return { label: "Snake Eyes!", colorKey: "snakeeyes" };
  }

  // Lucky 11 if option enabled
  if (isLucky11 && gameOptions?.lucky11) {
    return { label: "Lucky 11!", colorKey: "lucky11" };
  }

  // Default to the result type
  return { label: roll.resultType, colorKey: roll.resultType };
}

export function RollHistory({ rolls, currentRound, isBanker, onEditRoll, gameOptions, safeZoneRolls = 3 }: RollHistoryProps) {
  const [editingRollId, setEditingRollId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const currentRoundRolls = rolls
    .filter((r) => r.roundNumber === currentRound)
    .sort((a, b) => b.rollNumber - a.rollNumber);

  const handleStartEdit = (roll: Roll) => {
    setEditingRollId(roll.id);
    setEditValue(String(roll.die1 + roll.die2));
  };

  const handleSaveEdit = (rollId: string) => {
    const total = parseInt(editValue);
    if (total >= 2 && total <= 12 && onEditRoll) {
      // Split the total into two dice values
      let die1: number, die2: number;
      if (total <= 7) {
        die1 = Math.max(1, total - 6);
        die2 = Math.min(6, total - 1);
      } else {
        die1 = total - 6;
        die2 = 6;
      }
      onEditRoll(rollId, die1, die2);
    }
    setEditingRollId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingRollId(null);
    setEditValue("");
  };

  if (currentRoundRolls.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">
        No rolls yet this round
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-zinc-500">
        Round {currentRound} Rolls
      </h3>
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {currentRoundRolls.map((roll) => {
          const { label, colorKey } = getDisplayLabel(roll, gameOptions, safeZoneRolls);
          return (
            <div
              key={roll.id}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                resultColors[colorKey]
              }`}
            >
              <span className="font-medium">#{roll.rollNumber}</span>

              {editingRollId === roll.id ? (
                <>
                  <Input
                    type="number"
                    min={2}
                    max={12}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-16 h-7 text-center text-sm"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => handleSaveEdit(roll.id)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-bold">{roll.die1 + roll.die2}</span>
                  <span className="text-xs uppercase tracking-wide">
                    {label}
                  </span>
                  <span className="ml-auto font-medium">→ {roll.bankAfter}</span>
                  {isBanker && onEditRoll && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleStartEdit(roll)}
                    >
                      Edit
                    </Button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
