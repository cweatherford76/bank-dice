"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DiceInput } from "@/components/game/DiceInput";
import { BankDisplay } from "@/components/game/BankDisplay";
import { PlayerScoreboard } from "@/components/game/PlayerScoreboard";
import { RollHistory } from "@/components/game/RollHistory";
import { createClient } from "@/lib/supabase/client";
import { generateUUID,
  calculateRollResult,
  calculateStartingBank,
  allPlayersBanked,
} from "@/lib/game-engine";
import { Game, Player, Roll, GameOptions, DEFAULT_GAME_OPTIONS } from "@/types/game";
import { getTheme } from "@/lib/themes";

interface GameState {
  game: Game | null;
  players: Player[];
  rolls: Roll[];
  loading: boolean;
  error: string | null;
  isBanker: boolean;
  lastResultMessage: string;
  consecutiveDoubles: number;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const joinCode = (params.code as string).toUpperCase();

  const [state, setState] = useState<GameState>({
    game: null,
    players: [],
    rolls: [],
    loading: true,
    error: null,
    isBanker: false,
    lastResultMessage: "",
    consecutiveDoubles: 0,
  });

  const [showEndDialog, setShowEndDialog] = useState(false);

  const supabase = createClient();
// Apply theme to body
  useEffect(() => {
    if (state.game?.options?.theme) {
      const theme = getTheme(state.game.options.theme);
      document.body.className = theme.cssClass;
    }
    return () => {
      document.body.className = "";
    };
  }, [state.game?.options?.theme]);

  // Calculate current player based on roll count
  const currentPlayerId = useMemo(() => {
    if (!state.game || state.players.length === 0) return undefined;

    // Sort players by player_order to get the correct rotation
    const orderedPlayers = [...state.players].sort((a, b) => a.playerOrder - b.playerOrder);

    // Current player index is rollCount mod number of players
    const currentIndex = state.game.rollCount % orderedPlayers.length;

    return orderedPlayers[currentIndex]?.id;
  }, [state.game?.rollCount, state.players]);

  // Load initial game data
  useEffect(() => {
    const loadGame = async () => {
      try {
        // Fetch game
        const { data: game, error: gameError } = await supabase
          .from("games")
          .select("*")
          .eq("join_code", joinCode)
          .single();

        if (gameError || !game) {
          setState((s) => ({ ...s, loading: false, error: "Game not found" }));
          return;
        }

        // Check if user is banker
        const sessionToken = localStorage.getItem(
          `bank-dice-session-${joinCode}`
        );
        const isBanker = sessionToken === game.banker_session_token;

        if (!isBanker) {
          // Redirect to viewer page
          router.push(`/game/${joinCode}/view`);
          return;
        }

        // Fetch players
        const { data: players } = await supabase
          .from("players")
          .select("*")
          .eq("game_id", game.id)
          .order("player_order");

        // Fetch rolls
        const { data: rolls } = await supabase
          .from("rolls")
          .select("*")
          .eq("game_id", game.id)
          .order("created_at");

        // Convert DB row to Game object
        const gameData: Game = {
          id: game.id,
          joinCode: game.join_code,
          status: game.status,
          currentRound: game.current_round,
          bankTotal: game.bank_total,
          rollCount: game.roll_count,
          bankerSessionToken: game.banker_session_token,
          createdAt: game.created_at,
          options: {
            roundCount: game.opt_round_count,
            singleBankPerRoll: game.opt_single_bank_per_roll,
            escalatingBank: game.opt_escalating_bank,
            doubleEachLap: game.opt_double_each_lap,
            snakeEyesBonus: game.opt_snake_eyes_bonus,
            lucky11: game.opt_lucky_11,
            escalatingDoubles: game.opt_escalating_doubles,
            minimumBank: game.opt_minimum_bank,
            bankDelay: game.opt_bank_delay,
            safeZoneRolls: game.opt_safe_zone_rolls,
            doubleDown: game.opt_double_down,
            theme: game.opt_theme || "modern",
          },
        };

        // Convert players
        const playerData: Player[] = (players || []).map((p) => ({
          id: p.id,
          gameId: p.game_id,
          playerOrder: p.player_order,
          name: p.name,
          totalScore: p.total_score,
          currentRoundBanked: p.current_round_banked,
          hasBanked: p.has_banked,
          bankPending: p.bank_pending,
          hasUsedDoubleDown: p.has_used_double_down,
          doubleDownActive: p.double_down_active,
        }));

        // Convert rolls
        const rollData: Roll[] = (rolls || []).map((r) => ({
          id: r.id,
          gameId: r.game_id,
          roundNumber: r.round_number,
          rollNumber: r.roll_number,
          die1: r.die_1,
          die2: r.die_2,
          resultType: r.result_type,
          bankAfter: r.bank_after,
          createdAt: r.created_at,
        }));

        setState({
          game: gameData,
          players: playerData,
          rolls: rollData,
          loading: false,
          error: null,
          isBanker: true,
          lastResultMessage: "",
          consecutiveDoubles: game.consecutive_doubles || 0,
        });
      } catch (err) {
        console.error("Error loading game:", err);
        setState((s) => ({
          ...s,
          loading: false,
          error: "Failed to load game",
        }));
      }
    };

    loadGame();
  }, [joinCode, router, supabase]);

  // Handle dice roll
  const handleRoll = useCallback(
    async (die1: number, die2: number) => {
      if (!state.game) return;

      const newRollNumber = state.game.rollCount + 1;
      const result = calculateRollResult(
        die1,
        die2,
        newRollNumber,
        state.game.bankTotal,
        state.consecutiveDoubles,
        state.game.options
      );

      // Update consecutive doubles count
      const newConsecutiveDoubles =
        result.resultType === "double"
          ? state.consecutiveDoubles + 1
          : 0;

      try {
        // Insert roll
        await supabase.from("rolls").insert({
          game_id: state.game.id,
          round_number: state.game.currentRound,
          roll_number: newRollNumber,
          die_1: die1,
          die_2: die2,
          result_type: result.resultType,
          bank_after: result.newBankTotal,
        });

        // Update game state
        await supabase
          .from("games")
          .update({
            bank_total: result.newBankTotal,
            roll_count: newRollNumber,
            consecutive_doubles: newConsecutiveDoubles,
            status: state.game.status === "setup" ? "active" : state.game.status,
          })
          .eq("id", state.game.id);

        // Update local state
        const newRoll: Roll = {
          id: generateUUID(),
          gameId: state.game.id,
          roundNumber: state.game.currentRound,
          rollNumber: newRollNumber,
          die1,
          die2,
          resultType: result.resultType,
          bankAfter: result.newBankTotal,
          createdAt: new Date().toISOString(),
        };

        setState((s) => ({
          ...s,
          game: s.game
            ? {
                ...s.game,
                bankTotal: result.newBankTotal,
                rollCount: newRollNumber,
                status: s.game.status === "setup" ? "active" : s.game.status,
              }
            : null,
          rolls: [...s.rolls, newRoll],
          lastResultMessage: result.message,
          consecutiveDoubles: newConsecutiveDoubles,
        }));

        // If bust, handle round end
        if (result.isBust) {
          await handleBust();
        }
      } catch (err) {
        console.error("Error recording roll:", err);
      }
    },
    [state, supabase]
  );

  // Handle editing a previous roll
  const handleEditRoll = useCallback(
    async (rollId: string, die1: number, die2: number) => {
      if (!state.game) return;

      const roll = state.rolls.find((r) => r.id === rollId);
      if (!roll) return;

      // Calculate new result for this roll
      const result = calculateRollResult(
        die1,
        die2,
        roll.rollNumber,
        0, // We'll recalculate bank from scratch
        0, // Ignore consecutive doubles for edit
        state.game.options
      );

      try {
        // Update roll in database
        await supabase
          .from("rolls")
          .update({
            die_1: die1,
            die_2: die2,
            result_type: result.resultType,
          })
          .eq("id", rollId);

        // Recalculate all rolls from this round to get correct bank totals
        const currentRoundRolls = state.rolls
          .filter((r) => r.roundNumber === state.game!.currentRound)
          .sort((a, b) => a.rollNumber - b.rollNumber);

        // Find starting bank for this round
        const startingBank = calculateStartingBank(state.game.currentRound, state.game.options);

        // Recalculate bank totals for all rolls in current round
        let currentBank = startingBank;
        let consecutiveDoubles = 0;
        const updatedRolls = currentRoundRolls.map((r) => {
          const d1 = r.id === rollId ? die1 : r.die1;
          const d2 = r.id === rollId ? die2 : r.die2;

          const rollResult = calculateRollResult(
            d1,
            d2,
            r.rollNumber,
            currentBank,
            consecutiveDoubles,
            state.game!.options
          );

          consecutiveDoubles = rollResult.resultType === "double" ? consecutiveDoubles + 1 : 0;
          currentBank = rollResult.newBankTotal;

          return {
            ...r,
            die1: d1,
            die2: d2,
            resultType: rollResult.resultType,
            bankAfter: rollResult.newBankTotal,
          };
        });

        // Update all affected rolls in database
        for (const updatedRoll of updatedRolls) {
          await supabase
            .from("rolls")
            .update({
              die_1: updatedRoll.die1,
              die_2: updatedRoll.die2,
              result_type: updatedRoll.resultType,
              bank_after: updatedRoll.bankAfter,
            })
            .eq("id", updatedRoll.id);
        }

        // Update game bank total
        await supabase
          .from("games")
          .update({
            bank_total: currentBank,
            consecutive_doubles: consecutiveDoubles,
          })
          .eq("id", state.game.id);

        // Update local state
        setState((s) => ({
          ...s,
          game: s.game
            ? {
                ...s.game,
                bankTotal: currentBank,
              }
            : null,
          rolls: s.rolls.map((r) => {
            const updated = updatedRolls.find((u) => u.id === r.id);
            return updated || r;
          }),
          lastResultMessage: "Roll updated!",
          consecutiveDoubles,
        }));
      } catch (err) {
        console.error("Error editing roll:", err);
      }
    },
    [state, supabase]
  );

  // Handle player banking
  const handleBank = useCallback(
    async (playerId: string) => {
      if (!state.game) return;

      const player = state.players.find((p) => p.id === playerId);
      if (!player || player.hasBanked) return;

      const bankAmount = state.game.bankTotal;

      try {
        // Update player in DB
        await supabase
          .from("players")
          .update({
            total_score: player.totalScore + bankAmount,
            current_round_banked: bankAmount,
            has_banked: true,
          })
          .eq("id", playerId);

        // Update local state
        setState((s) => ({
          ...s,
          players: s.players.map((p) =>
            p.id === playerId
              ? {
                  ...p,
                  totalScore: p.totalScore + bankAmount,
                  currentRoundBanked: bankAmount,
                  hasBanked: true,
                }
              : p
          ),
        }));

        // Check if all players banked
        const updatedPlayers = state.players.map((p) =>
          p.id === playerId ? { ...p, hasBanked: true } : p
        );
        if (allPlayersBanked(updatedPlayers)) {
          await startNextRound();
        }
      } catch (err) {
        console.error("Error banking:", err);
      }
    },
    [state, supabase]
  );

  // Handle bust (round end with no points for unbanked players)
  const handleBust = async () => {
    await startNextRound();
  };

  // Start next round
  const startNextRound = useCallback(async () => {
    if (!state.game) return;

    const nextRound = state.game.currentRound + 1;
    const isGameOver = nextRound > state.game.options.roundCount;

    try {
      // Reset players for new round
      await supabase
        .from("players")
        .update({
          current_round_banked: null,
          has_banked: false,
          bank_pending: false,
          double_down_active: false,
        })
        .eq("game_id", state.game.id);

      // Calculate starting bank for new round
      const startingBank = isGameOver
        ? 0
        : calculateStartingBank(nextRound, state.game.options);

      // Update game
      await supabase
        .from("games")
        .update({
          current_round: isGameOver ? state.game.currentRound : nextRound,
          bank_total: startingBank,
          roll_count: 0,
          consecutive_doubles: 0,
          status: isGameOver ? "completed" : "active",
        })
        .eq("id", state.game.id);

      // Update local state
      setState((s) => ({
        ...s,
        game: s.game
          ? {
              ...s.game,
              currentRound: isGameOver ? s.game.currentRound : nextRound,
              bankTotal: startingBank,
              rollCount: 0,
              status: isGameOver ? "completed" : "active",
            }
          : null,
        players: s.players.map((p) => ({
          ...p,
          currentRoundBanked: null,
          hasBanked: false,
          bankPending: false,
          doubleDownActive: false,
        })),
        lastResultMessage: isGameOver
          ? "Game Over!"
          : `Round ${nextRound} starting!`,
        consecutiveDoubles: 0,
      }));
    } catch (err) {
      console.error("Error starting next round:", err);
    }
  }, [state, supabase]);

  // End entire game
  const endGame = useCallback(async () => {
    if (!state.game) return;

    try {
      await supabase
        .from("games")
        .update({
          status: "completed",
        })
        .eq("id", state.game.id);

      setState((s) => ({
        ...s,
        game: s.game
          ? {
              ...s.game,
              status: "completed",
            }
          : null,
        lastResultMessage: "Game Over!",
      }));

      setShowEndDialog(false);
    } catch (err) {
      console.error("Error ending game:", err);
    }
  }, [state, supabase]);

  // Restart game (reset all scores, round to 1, clear rolls)
  const restartGame = useCallback(async () => {
    if (!state.game) return;

    try {
      // Delete all rolls for this game
      await supabase
        .from("rolls")
        .delete()
        .eq("game_id", state.game.id);

      // Reset all players to 0 score
      await supabase
        .from("players")
        .update({
          total_score: 0,
          current_round_banked: null,
          has_banked: false,
          bank_pending: false,
          has_used_double_down: false,
          double_down_active: false,
        })
        .eq("game_id", state.game.id);

      // Calculate starting bank for round 1
      const startingBank = calculateStartingBank(1, state.game.options);

      // Reset game to round 1
      await supabase
        .from("games")
        .update({
          current_round: 1,
          bank_total: startingBank,
          roll_count: 0,
          consecutive_doubles: 0,
          status: "active",
        })
        .eq("id", state.game.id);

      // Update local state
      setState((s) => ({
        ...s,
        game: s.game
          ? {
              ...s.game,
              currentRound: 1,
              bankTotal: startingBank,
              rollCount: 0,
              status: "active",
            }
          : null,
        players: s.players.map((p) => ({
          ...p,
          totalScore: 0,
          currentRoundBanked: null,
          hasBanked: false,
          bankPending: false,
          hasUsedDoubleDown: false,
          doubleDownActive: false,
        })),
        rolls: [],
        lastResultMessage: "Game restarted!",
        consecutiveDoubles: 0,
      }));

      setShowEndDialog(false);
    } catch (err) {
      console.error("Error restarting game:", err);
    }
  }, [state, supabase]);

  // Handle end round from dialog
  const handleEndRound = () => {
    setShowEndDialog(false);
    startNextRound();
  };

  // Loading state
  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="text-zinc-500">Loading game...</div>
      </div>
    );
  }

  // Error state
  if (state.error || !state.game) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <Card className="w-80">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">{state.error || "Game not found"}</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game Over state
  if (state.game.status === "completed") {
    const winner = [...state.players].sort(
      (a, b) => b.totalScore - a.totalScore
    )[0];

    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200 p-4">
        <div className="mx-auto max-w-md space-y-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-zinc-900">Game Over!</h1>
            <p className="mt-2 text-xl text-zinc-600">
              Winner: {winner.name} with {winner.totalScore.toLocaleString()}{" "}
              points!
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Final Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerScoreboard
                players={state.players}
                bankTotal={0}
                minimumBank={0}
                onBank={() => {}}
                isBanker={false}
              />
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button onClick={restartGame} variant="outline" className="w-full">
              Restart Game
            </Button>
            <Button onClick={() => router.push("/")} className="w-full">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200 p-4">
      <div className="mx-auto max-w-lg space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Bank Dice</h1>
            <p className="text-sm text-zinc-500">
              Round {state.game.currentRound} of {state.game.options.roundCount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400">Shareable Game Code</p>
            <p className="font-mono text-lg font-bold tracking-wider">
              {state.game.joinCode}
            </p>
          </div>
        </div>

        {/* Bank Display */}
        <BankDisplay
          bankTotal={state.game.bankTotal}
          rollCount={state.game.rollCount}
          safeZoneRolls={state.game.options.safeZoneRolls}
          lastResultMessage={state.lastResultMessage}
        />

        {/* Dice Input */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-center">Enter Value of Dice Rolled</CardTitle>
          </CardHeader>
          <CardContent>
            <DiceInput onRoll={handleRoll} inSafeZone={state.game.rollCount < state.game.options.safeZoneRolls} />
          </CardContent>
        </Card>

        {/* Player Scoreboard */}
        <Card>
          <CardContent className="pt-4">
            <PlayerScoreboard
              players={state.players}
              bankTotal={state.game.bankTotal}
              minimumBank={state.game.options.minimumBank}
              onBank={handleBank}
              isBanker={state.isBanker}
              currentPlayerId={currentPlayerId}
            />
          </CardContent>
        </Card>

        {/* Roll History */}
        <Card>
          <CardContent className="pt-4">
            <RollHistory
              rolls={state.rolls}
              currentRound={state.game.currentRound}
              isBanker={state.isBanker}
              onEditRoll={handleEditRoll}
              gameOptions={state.game.options}
              safeZoneRolls={state.game.options.safeZoneRolls}
            />
          </CardContent>
        </Card>

        {/* End Now Button */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEndDialog(true)}
            className="flex-1"
          >
            End Now
          </Button>
        </div>
      </div>

      {/* End Dialog Overlay */}
      {showEndDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Game Options</CardTitle>
              <CardDescription>
                What would you like to do?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={handleEndRound}
                className="w-full"
              >
                End This Round
              </Button>
              <Button
                variant="outline"
                onClick={restartGame}
                className="w-full"
              >
                Restart Game
              </Button>
              <Button
                variant="destructive"
                onClick={endGame}
                className="w-full"
              >
                End Entire Game
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowEndDialog(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
