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

// Theme-aware result colors using CSS variables
const getResultStyle = (colorKey: string): React.CSSProperties => {
  switch (colorKey) {
    case 'double':
      return {
        background: 'var(--double-bg)',
        color: 'var(--double-border)',
        borderLeft: '3px solid var(--double-border)',
      };
    case 'seven':
      return {
        background: 'var(--safe-zone-bg)',
        color: 'var(--safe-zone-border)',
        borderLeft: '3px solid var(--safe-zone-border)',
      };
    case 'bust':
      return {
        background: 'var(--bust-bg)',
        color: 'var(--bust-border)',
        borderLeft: '3px solid var(--bust-border)',
      };
    case 'snakeeyes':
      return {
        background: 'var(--snakeeyes-bg, var(--safe-zone-bg))',
        color: 'var(--snakeeyes-border, var(--banked-color, #22c55e))',
        borderLeft: '3px solid var(--snakeeyes-border, var(--banked-color, #22c55e))',
      };
    case 'lucky11':
      return {
        background: 'var(--lucky11-bg, var(--danger-zone-bg))',
        color: 'var(--lucky11-border, var(--leader-color, #f59e0b))',
        borderLeft: '3px solid var(--lucky11-border, var(--leader-color, #f59e0b))',
      };
    case 'round_doubled':
      return {
        background: 'var(--double-bg)',
        color: 'var(--double-border)',
        borderLeft: '3px solid var(--double-border)',
      };
    default:
      return {
        background: 'var(--muted)',
        color: 'var(--foreground)',
        borderLeft: '3px solid var(--card-border)',
      };
  }
};

function getDisplayLabel(roll: Roll, gameOptions?: GameOptions, safeZoneRolls: number = 3): { label: string; colorKey: string; hideSum: boolean; isRoundDoubled: boolean } {
  // Handle round_doubled special entry
  if (roll.resultType === "round_doubled") {
    return { label: "DOUBLED AFTER ROUND", colorKey: "round_doubled", hideSum: true, isRoundDoubled: true };
  }

  const sum = roll.die1 + roll.die2;
  const isDouble = roll.die1 === roll.die2;
  const isSnakeEyes = roll.die1 === 1 && roll.die2 === 1;
  const isLucky11 = sum === 11;
  const inSafeZone = roll.rollNumber <= safeZoneRolls;

  // Snake Eyes takes priority if option enabled and in danger zone
  if (isSnakeEyes && gameOptions?.snakeEyesBonus && !inSafeZone) {
    return { label: "Snake Eyes!", colorKey: "snakeeyes", hideSum: false, isRoundDoubled: false };
  }

  // Lucky 11 if option enabled
  if (isLucky11 && gameOptions?.lucky11) {
    return { label: "Lucky 11!", colorKey: "lucky11", hideSum: false, isRoundDoubled: false };
  }

  // For doubles, hide the sum (just show "double")
  if (isDouble && roll.resultType === "double") {
    return { label: "Doubles! Bank x2", colorKey: "double", hideSum: true, isRoundDoubled: false };
  }

  // Default to the result type
  return { label: roll.resultType, colorKey: roll.resultType, hideSum: false, isRoundDoubled: false };
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
      <div 
        className="rounded-lg border border-dashed p-4 text-center text-sm"
        style={{ borderColor: 'var(--card-border)', color: 'var(--muted-foreground)' }}
      >
        No rolls yet this round
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
        Round {currentRound} Rolls
      </h3>
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {currentRoundRolls.map((roll) => {
          const { label, colorKey, hideSum, isRoundDoubled } = getDisplayLabel(roll, gameOptions, safeZoneRolls);
          const style = getResultStyle(colorKey);
          return (
            <div
              key={roll.id}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm"
              style={style}
            >
              {/* Hide roll number for round_doubled entries */}
              {!isRoundDoubled && <span className="font-medium">#{roll.rollNumber}</span>}

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
                  {!hideSum && <span className="font-bold">{roll.die1 + roll.die2}</span>}
                  <span className="text-xs uppercase tracking-wide font-semibold">
                    {label}
                  </span>
                  <span className="ml-auto font-medium">→ {roll.bankAfter}</span>
                  {/* Don't show edit button for round_doubled entries */}
                  {isBanker && onEditRoll && !isRoundDoubled && (
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
