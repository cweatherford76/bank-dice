"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_GAME_OPTIONS, GameOptions, ThemeId } from "@/types/game";
import { generateJoinCode, generateUUID } from "@/lib/game-engine";
import { createClient } from "@/lib/supabase/client";
import { THEMES, getTheme } from "@/lib/themes";

interface GameOptionConfig {
  key: keyof GameOptions;
  label: string;
  description: string;
  type: "boolean" | "number" | "text-number" | "theme";
  options?: { value: number | string; label: string }[];
  min?: number;
  max?: number;
}

const GAME_OPTIONS_CONFIG: GameOptionConfig[] = [
  {
    key: "theme",
    label: "Theme",
    description: "Visual style for the game",
    type: "theme",
    options: THEMES.map(t => ({ value: t.id, label: t.name })),
  },
  {
    key: "roundCount",
    label: "Round Count",
    description: "Total number of rounds (1-30)",
    type: "text-number",
    min: 1,
    max: 30,
  },
  {
    key: "safeZoneRolls",
    label: "Safe Zone Rolls",
    description: "Rolls before 7 becomes dangerous",
    type: "number",
    options: [
      { value: 3, label: "3 rolls (default)" },
      { value: 5, label: "5 rolls" },
      { value: 7, label: "7 rolls" },
    ],
  },
  {
    key: "singleBankPerRoll",
    label: "Single Bank Per Roll",
    description: "Only one player can bank each roll (first-come)",
    type: "boolean",
  },
  {
    key: "doubleEachLap",
    label: "Double Each Lap",
    description: "Bank doubles at the end of each round",
    type: "boolean",
  },
  {
    key: "snakeEyesBonus",
    label: "Snake Eyes Bonus",
    description: "Rolling 1+1 quadruples the bank (x4)",
    type: "boolean",
  },
  {
    key: "lucky11",
    label: "Lucky 11",
    description: "Rolling 11 (5+6) quadruples the bank (x4)",
    type: "boolean",
  },
  {
    key: "minimumBank",
    label: "Minimum Bank",
    description: "Pot must exceed this to bank (0 = off)",
    type: "number",
    options: [
      { value: 0, label: "Off" },
      { value: 100, label: "100" },
      { value: 200, label: "200" },
      { value: 300, label: "300" },
    ],
  },
  {
    key: "bankDelay",
    label: "Bank Delay",
    description: "Banks not secured until AFTER the next roll completes",
    type: "boolean",
  },
];

export default function CreateGame() {
  const router = useRouter();
  const [playerNames, setPlayerNames] = useState<string[]>(["", ""]);
  const [options, setOptions] = useState<GameOptions>(DEFAULT_GAME_OPTIONS);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [optionsExpanded, setOptionsExpanded] = useState(false);

  // Apply theme preview to body
  useEffect(() => {
    const theme = getTheme(options.theme);
    document.body.className = theme.cssClass;
    return () => {
      document.body.className = "";
    };
  }, [options.theme]);

  const addPlayer = () => {
    if (playerNames.length < 10) {
      setPlayerNames([...playerNames, ""]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const updateOption = (key: keyof GameOptions, value: boolean | number | string) => {
    setOptions({ ...options, [key]: value });
  };

  const handleTextNumberChange = (key: keyof GameOptions, value: string, min: number, max: number) => {
    const num = parseInt(value);
    if (value === "") {
      setOptions({ ...options, [key]: 0 });
    } else if (!isNaN(num)) {
      const clamped = Math.min(max, Math.max(min, num));
      setOptions({ ...options, [key]: clamped });
    }
  };

  // Count how many options are changed from defaults (excluding theme which is always shown)
  const changedOptionsCount = GAME_OPTIONS_CONFIG.filter((config) => {
    if (config.key === "theme") return false;
    return options[config.key] !== DEFAULT_GAME_OPTIONS[config.key];
  }).length;

  const handleCreateGame = async () => {
    const validPlayers = playerNames.filter((name) => name.trim() !== "");
    if (validPlayers.length < 2) {
      setError("At least 2 players are required");
      return;
    }

    if (options.roundCount < 1 || options.roundCount > 30) {
      setError("Round count must be between 1 and 30");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const supabase = createClient();
      const joinCode = generateJoinCode();
      const sessionToken = generateUUID();

      const { data: game, error: gameError } = await supabase
        .from("games")
        .insert({
          join_code: joinCode,
          status: "setup",
          banker_session_token: sessionToken,
          opt_round_count: options.roundCount,
          opt_single_bank_per_roll: options.singleBankPerRoll,
          opt_escalating_bank: options.escalatingBank,
          opt_double_each_lap: options.doubleEachLap,
          opt_snake_eyes_bonus: options.snakeEyesBonus,
          opt_lucky_11: options.lucky11,
          opt_escalating_doubles: options.escalatingDoubles,
          opt_minimum_bank: options.minimumBank,
          opt_bank_delay: options.bankDelay,
          opt_safe_zone_rolls: options.safeZoneRolls,
          opt_double_down: options.doubleDown,
          opt_theme: options.theme,
        })
        .select()
        .single();

      if (gameError) { console.error("Game error:", JSON.stringify(gameError)); throw gameError; }

      const playersData = validPlayers.map((name, index) => ({
        game_id: game.id,
        player_order: index + 1,
        name: name.trim(),
      }));

      const { error: playersError } = await supabase
        .from("players")
        .insert(playersData);

      if (playersError) { console.error("Players error:", JSON.stringify(playersError)); throw playersError; }

      localStorage.setItem(`bank-dice-session-${joinCode}`, sessionToken);
      router.push(`/game/${joinCode}`);
    } catch (err) {
      console.error("Error creating game:", err);
      setError("Failed to create game. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen p-4" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Game</h1>
          <p className="mt-2 opacity-70">Set up players and game options</p>
        </div>

        {/* Players Card */}
        <Card className="themed-card" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <CardHeader>
            <CardTitle>Players ({playerNames.length}/10)</CardTitle>
            <CardDescription>
              Enter the names of all players. You (the Banker) will control all
              dice rolls and banking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {playerNames.map((name, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium" style={{ background: 'var(--muted)' }}>
                  {index + 1}
                </div>
                <Input
                  placeholder={`Player ${index + 1} name`}
                  value={name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  className="flex-1"
                />
                {playerNames.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    className="opacity-50 hover:opacity-100 hover:text-red-500"
                  >
                    X
                  </Button>
                )}
              </div>
            ))}
            {playerNames.length < 10 && (
              <Button variant="outline" onClick={addPlayer} className="w-full">
                + Add Player
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Game Options Card - Collapsible */}
        <Card className="themed-card" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <button
            onClick={() => setOptionsExpanded(!optionsExpanded)}
            className="w-full text-left"
          >
            <CardHeader className="cursor-pointer transition-colors rounded-t-xl" style={{ background: optionsExpanded ? 'var(--muted)' : 'transparent' }}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Game Options
                    {changedOptionsCount > 0 && (
                      <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                        {changedOptionsCount} changed
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {optionsExpanded
                      ? "Customize the rules for your game session"
                      : "Using default rules (tap to customize)"}
                  </CardDescription>
                </div>
                <motion.div
                  animate={{ rotate: optionsExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="opacity-50"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </motion.div>
              </div>
            </CardHeader>
          </button>
          <AnimatePresence>
            {optionsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <CardContent className="space-y-4 pt-0">
                  {GAME_OPTIONS_CONFIG.map((config) => {
                    const isChanged =
                      config.key !== "theme" && options[config.key] !== DEFAULT_GAME_OPTIONS[config.key];
                    return (
                      <div
                        key={config.key}
                        className={`flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0 ${
                          isChanged ? "rounded-md -mx-2 px-2" : ""
                        }`}
                        style={{
                          borderColor: 'var(--card-border)',
                          background: isChanged ? 'var(--muted)' : 'transparent'
                        }}
                      >
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            {config.label}
                            {isChanged && (
                              <span className="text-xs opacity-60">
                                (modified)
                              </span>
                            )}
                          </Label>
                          <p className="text-sm opacity-60">
                            {config.description}
                          </p>
                        </div>
                        {config.type === "boolean" ? (
                          <Switch
                            checked={options[config.key] as boolean}
                            onCheckedChange={(checked) =>
                              updateOption(config.key, checked)
                            }
                          />
                        ) : config.type === "text-number" ? (
                          <Input
                            type="number"
                            min={config.min}
                            max={config.max}
                            value={options[config.key] as number || ""}
                            onChange={(e) =>
                              handleTextNumberChange(
                                config.key,
                                e.target.value,
                                config.min || 1,
                                config.max || 30
                              )
                            }
                            style={{ width: "60px" }} className="text-center text-sm h-8"
                          />
                        ) : config.type === "theme" ? (
                          <select
                            value={options.theme}
                            onChange={(e) =>
                              updateOption("theme", e.target.value as ThemeId)
                            }
                            className="rounded-md border px-3 py-1.5 text-sm"
                            style={{ borderColor: 'var(--card-border)', background: 'var(--muted)', color: 'var(--foreground)' }}
                          >
                            {THEMES.map((theme) => (
                              <option key={theme.id} value={theme.id}>
                                {theme.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={options[config.key] as number}
                            onChange={(e) =>
                              updateOption(config.key, parseInt(e.target.value))
                            }
                            className="rounded-md border px-3 py-1.5 text-sm"
                            style={{ borderColor: 'var(--card-border)', background: 'var(--muted)', color: 'var(--foreground)' }}
                          >
                            {config.options?.map((opt) => (
                              <option key={String(opt.value)} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                  {changedOptionsCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOptions({ ...DEFAULT_GAME_OPTIONS, theme: options.theme })}
                      className="w-full opacity-60"
                    >
                      Reset to defaults (keep theme)
                    </Button>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="rounded-md p-4 text-sm" style={{ background: 'var(--bust-bg)', color: 'var(--bust-border)' }}>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="flex-1"
            style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
          >
            {isCreating ? "Creating..." : "Start Game"}
          </Button>
        </div>
      </div>
    </div>
  );
}
