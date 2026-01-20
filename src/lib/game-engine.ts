import { GameOptions, RollResult, RollResultType } from "@/types/game";

/**
 * Bank Dice Game Engine
 *
 * Core scoring rules:
 * - Normal rolls: Add face value to bank (e.g., 3+5 = +8)
 * - Rolls 1-3 (Safe Zone):
 *   - Sum of 7 = +70 points to bank
 *   - Doubles = Not allowed (button disabled in safe zone)
 * - Rolls 4+ (Danger Zone):
 *   - Sum of 7 = BUST (bank goes to 0, round ends)
 *   - Doubles = Bank × 2 (only when explicitly recorded via Doubles button)
 */

/**
 * Determine the result type of a roll
 * @param isDoubles - Explicit flag indicating banker pressed Doubles button
 */
export function getRollResultType(
  die1: number,
  die2: number,
  rollNumber: number,
  safeZoneRolls: number,
  isDoubles: boolean = false
): RollResultType {
  const sum = die1 + die2;
  const inSafeZone = rollNumber <= safeZoneRolls;

  if (sum === 7) {
    // 7 is only a bust in danger zone
    return inSafeZone ? "seven" : "bust";
  }

  // Only treat as doubles if explicitly marked (banker pressed Doubles button)
  // Doubles button is disabled in safe zone, so this should never be true in safe zone
  if (isDoubles && !inSafeZone) {
    return "double";
  }

  return "normal";
}

/**
 * Calculate the new bank total after a roll
 * @param isDoubles - Explicit flag indicating banker pressed Doubles button
 */
export function calculateRollResult(
  die1: number,
  die2: number,
  rollNumber: number,
  currentBank: number,
  consecutiveDoubles: number,
  options: GameOptions,
  isDoubles: boolean = false
): RollResult {
  const sum = die1 + die2;
  const isSnakeEyes = die1 === 1 && die2 === 1;
  const inSafeZone = rollNumber <= options.safeZoneRolls;
  const resultType = getRollResultType(die1, die2, rollNumber, options.safeZoneRolls, isDoubles);

  let newBank = currentBank;
  let message = "";
  let isBust = false;

  switch (resultType) {
    case "bust":
      // 7 in danger zone = bust
      newBank = 0;
      isBust = true;
      message = "BUST!";
      break;

    case "seven":
      // 7 in safe zone = +70
      newBank += 70;
      message = "+70 Points";
      break;

    case "double":
      // Doubles in danger zone = multiply bank (only when explicitly recorded)
      // Check for snake eyes bonus first (x4)
      if (isSnakeEyes && options.snakeEyesBonus) {
        newBank *= 4;
        message = "SNAKE EYES! Bank x4";
      } else if (options.escalatingDoubles && consecutiveDoubles > 0) {
        // Escalating doubles: first x2, second x3, third x4, etc.
        const multiplier = consecutiveDoubles + 2;
        newBank *= multiplier;
        message = `DOUBLES! Bank x${multiplier}`;
      } else {
        // Normal doubles = x2
        newBank *= 2;
        message = "DOUBLES! Bank x2";
      }
      break;

    case "normal":
      // Normal roll = add face value
      newBank += sum;
      message = `+${sum} Points`;

      // Lucky 11 bonus - quadruples the bank
      if (sum === 11 && options.lucky11) {
        newBank *= 4;
        message = "Lucky 11! Bank x4";
      }
      break;
  }

  return {
    resultType,
    newBankTotal: newBank,
    isBust,
    message,
  };
}

/**
 * Calculate starting bank for a round (with escalating bank option)
 */
export function calculateStartingBank(roundNumber: number, options: GameOptions): number {
  if (options.escalatingBank) {
    return roundNumber * 100;
  }
  return 0;
}

/**
 * Check if a player can bank (considering minimum bank option)
 */
export function canPlayerBank(
  bankTotal: number,
  minimumBank: number,
  hasBanked: boolean
): { canBank: boolean; reason?: string } {
  if (hasBanked) {
    return { canBank: false, reason: "Already banked this round" };
  }

  if (minimumBank > 0 && bankTotal <= minimumBank) {
    return {
      canBank: false,
      reason: `Bank must be over ${minimumBank} to bank (currently ${bankTotal})`,
    };
  }

  return { canBank: true };
}

/**
 * Calculate points earned when banking (with double down option)
 */
export function calculateBankPoints(
  bankTotal: number,
  doubleDownActive: boolean
): number {
  return doubleDownActive ? bankTotal * 2 : bankTotal;
}

/**
 * Get the current turn position in rotation
 */
export function getCurrentTurnPosition(
  rollNumber: number,
  totalPlayers: number
): number {
  // Roll 1 is player 1, roll 2 is player 2, etc.
  // After all players have rolled, cycle back
  return ((rollNumber - 1) % totalPlayers) + 1;
}

/**
 * Calculate bank bonus at end of round (for double each lap option)
 * This doubles the bank at the end of each round before starting the next
 */
export function calculateBankAfterRound(
  currentBank: number,
  options: GameOptions
): number {
  if (options.doubleEachLap) {
    return currentBank * 2;
  }
  return currentBank;
}

/**
 * Check if all players have banked (to end round early)
 */
export function allPlayersBanked(players: { hasBanked: boolean }[]): boolean {
  return players.every((p) => p.hasBanked);
}

/**
 * Generate a secure random join code
 * Uses characters that aren't easily confused (no 0/O, 1/I/L)
 */
export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validate a join code format
 */
export function isValidJoinCode(code: string): boolean {
  if (code.length !== 8) return false;
  const validChars = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/;
  return validChars.test(code.toUpperCase());
}

/**
 * Determine if we're in the safe zone or danger zone
 */
export function isInSafeZone(rollNumber: number, safeZoneRolls: number): boolean {
  return rollNumber <= safeZoneRolls;
}

/**
 * Get zone display name
 */
export function getZoneName(rollNumber: number, safeZoneRolls: number): string {
  return isInSafeZone(rollNumber, safeZoneRolls) ? "Safe Zone" : "Danger Zone";
}

// Generate a UUID that works in all browsers (including non-secure contexts)
export function generateUUID(): string {
  // Use crypto.randomUUID if available (secure context)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts (HTTP)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
