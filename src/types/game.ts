// Game status states
export type GameStatus = "setup" | "active" | "completed";

// Result of a dice roll
export type RollResultType = "normal" | "double" | "seven" | "bust" | "round_doubled";

// Theme options
export type ThemeId = 'modern' | 'classic' | 'tron' | 'retro-arcade' | 'retro-neon';

// Game options that can be configured at creation
export interface GameOptions {
  roundCount: number;           // Total rounds (10, 15, 20, or 25)
  singleBankPerRoll: boolean;   // Only one player can bank per roll
  escalatingBank: boolean;      // Adds 100 × round number to bank each round
  doubleEachLap: boolean;       // Bank doubles after every player has rolled
  snakeEyesBonus: boolean;      // Snake eyes (1+1) quadruples bank
  lucky11: boolean;             // Rolling 11 adds +100 bonus
  escalatingDoubles: boolean;   // Consecutive doubles increase multiplier
  minimumBank: number;          // Minimum pot value to bank (0 = off)
  bankDelay: boolean;           // Banks not secured until next roll
  safeZoneRolls: number;        // Number of safe rolls (3, 4, or 5)
  doubleDown: boolean;          // Players can double down once per game
  theme: ThemeId;               // Visual theme for the game
}

// Default game options
export const DEFAULT_GAME_OPTIONS: GameOptions = {
  roundCount: 20,
  singleBankPerRoll: false,
  escalatingBank: false,
  doubleEachLap: false,
  snakeEyesBonus: false,
  lucky11: false,
  escalatingDoubles: false,
  minimumBank: 0,
  bankDelay: false,
  safeZoneRolls: 3,
  doubleDown: false,
  theme: 'modern',
};

// Player state
export interface Player {
  id: string;
  gameId: string;
  playerOrder: number;
  name: string;
  totalScore: number;
  currentRoundBanked: number | null;
  hasBanked: boolean;
  bankPending: boolean;
  hasUsedDoubleDown: boolean;
  doubleDownActive: boolean;
}

// Dice roll record
export interface Roll {
  id: string;
  gameId: string;
  roundNumber: number;
  rollNumber: number;
  die1: number;
  die2: number;
  resultType: RollResultType;
  bankAfter: number;
  createdAt: string;
}

// Round history for score progression
export interface RoundHistory {
  id: string;
  gameId: string;
  roundNumber: number;
  playerId: string;
  pointsEarned: number;
  bankedAtRoll: number | null;
}

// Full game state
export interface Game {
  id: string;
  joinCode: string;
  status: GameStatus;
  currentRound: number;
  bankTotal: number;
  rollCount: number;
  bankerSessionToken: string | null;
  createdAt: string;
  options: GameOptions;
}

// Result of processing a roll
export interface RollResult {
  resultType: RollResultType;
  newBankTotal: number;
  isBust: boolean;
  message: string;
}

// Game state for the UI
export interface GameState {
  game: Game;
  players: Player[];
  rolls: Roll[];
  roundHistory: RoundHistory[];
  consecutiveDoubles: number;  // For escalating doubles option
}
