"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankDisplay } from "@/components/game/BankDisplay";
import { PlayerScoreboard } from "@/components/game/PlayerScoreboard";
import { RollHistory } from "@/components/game/RollHistory";
import { createClient } from "@/lib/supabase/client";
import { Game, Player, Roll } from "@/types/game";

interface ViewerState {
  game: Game | null;
  players: Player[];
  rolls: Roll[];
  loading: boolean;
  error: string | null;
}

export default function ViewerPage() {
  const params = useParams();
  const router = useRouter();
  const joinCode = (params.code as string).toUpperCase();

  const [state, setState] = useState<ViewerState>({
    game: null,
    players: [],
    rolls: [],
    loading: true,
    error: null,
  });

  const supabase = createClient();

  // Calculate current player based on roll count
  const currentPlayerId = useMemo(() => {
    if (!state.game || state.players.length === 0) return undefined;

    // Sort players by player_order to get the correct rotation
    const orderedPlayers = [...state.players].sort((a, b) => a.playerOrder - b.playerOrder);

    // Current player index is rollCount mod number of players
    const currentIndex = state.game.rollCount % orderedPlayers.length;

    return orderedPlayers[currentIndex]?.id;
  }, [state.game?.rollCount, state.players]);

  // Load initial game data and subscribe to updates
  useEffect(() => {
    let gameChannel: ReturnType<typeof supabase.channel> | null = null;

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

        // Check if user is actually the banker - redirect them
        const sessionToken = localStorage.getItem(
          `bank-dice-session-${joinCode}`
        );
        if (sessionToken === game.banker_session_token) {
          router.push(`/game/${joinCode}`);
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
          bankerSessionToken: null, // Don't expose to viewer
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
        });

        // Subscribe to real-time updates
        gameChannel = supabase
          .channel(`game:${game.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "games",
              filter: `id=eq.${game.id}`,
            },
            (payload) => {
              if (payload.new) {
                const g = payload.new as Record<string, unknown>;
                setState((s) => ({
                  ...s,
                  game: s.game
                    ? {
                        ...s.game,
                        status: g.status as Game["status"],
                        currentRound: g.current_round as number,
                        bankTotal: g.bank_total as number,
                        rollCount: g.roll_count as number,
                      }
                    : null,
                }));
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "players",
              filter: `game_id=eq.${game.id}`,
            },
            (payload) => {
              if (payload.eventType === "UPDATE" && payload.new) {
                const p = payload.new as Record<string, unknown>;
                setState((s) => ({
                  ...s,
                  players: s.players.map((player) =>
                    player.id === p.id
                      ? {
                          ...player,
                          totalScore: p.total_score as number,
                          currentRoundBanked: p.current_round_banked as number | null,
                          hasBanked: p.has_banked as boolean,
                        }
                      : player
                  ),
                }));
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "rolls",
              filter: `game_id=eq.${game.id}`,
            },
            (payload) => {
              if (payload.new) {
                const r = payload.new as Record<string, unknown>;
                const newRoll: Roll = {
                  id: r.id as string,
                  gameId: r.game_id as string,
                  roundNumber: r.round_number as number,
                  rollNumber: r.roll_number as number,
                  die1: r.die_1 as number,
                  die2: r.die_2 as number,
                  resultType: r.result_type as Roll["resultType"],
                  bankAfter: r.bank_after as number,
                  createdAt: r.created_at as string,
                };
                setState((s) => ({
                  ...s,
                  rolls: [...s.rolls, newRoll],
                }));
              }
            }
          )
          .subscribe();
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

    // Cleanup subscription
    return () => {
      if (gameChannel) {
        supabase.removeChannel(gameChannel);
      }
    };
  }, [joinCode, router, supabase]);

  // Loading state
  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black tron-grid">
        <div className="text-[#00d4ff] [text-shadow:0_0_10px_rgba(0,212,255,0.5)]">Loading game...</div>
      </div>
    );
  }

  // Error state
  if (state.error || !state.game) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black tron-grid">
        <Card className="w-80">
          <CardContent className="pt-6 text-center">
            <p className="text-[#ff4444]">{state.error || "Game not found"}</p>
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
      <div className="min-h-screen bg-black tron-grid p-4">
        <div className="mx-auto max-w-md space-y-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#00d4ff] [text-shadow:0_0_20px_rgba(0,212,255,0.8)]">Game Over!</h1>
            <p className="mt-2 text-xl text-[#ff6600] [text-shadow:0_0_10px_rgba(255,102,0,0.5)]">
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

          <Button onClick={() => router.push("/")} className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black tron-grid p-4">
      <div className="mx-auto max-w-lg space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#00d4ff] [text-shadow:0_0_10px_rgba(0,212,255,0.5)]">Bank Dice</h1>
            <p className="text-sm text-[#888888]">
              Round {state.game.currentRound} of {state.game.options.roundCount}
            </p>
          </div>
          <div className="rounded-full bg-[#1f1f1f] border border-[#00d4ff]/30 px-3 py-1 text-xs text-[#00d4ff]">
            Viewing
          </div>
        </div>

        {/* Bank Display */}
        <BankDisplay
          bankTotal={state.game.bankTotal}
          rollCount={state.game.rollCount}
          safeZoneRolls={state.game.options.safeZoneRolls}
        />

        {/* Player Scoreboard */}
        <Card>
          <CardContent className="pt-4">
            <PlayerScoreboard
              players={state.players}
              bankTotal={state.game.bankTotal}
              minimumBank={state.game.options.minimumBank}
              onBank={() => {}}
              isBanker={false}
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
              gameOptions={state.game.options}
              safeZoneRolls={state.game.options.safeZoneRolls}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
