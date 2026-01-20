"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidJoinCode } from "@/lib/game-engine";

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  const handleJoinGame = () => {
    const code = joinCode.toUpperCase().trim();
    if (!isValidJoinCode(code)) {
      setError("Invalid code. Please enter an 8-character code.");
      return;
    }
    // Navigate to viewer page
    router.push(`/game/${code}/view`);
  };

  const handleCreateGame = () => {
    router.push("/create");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neon-magenta drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">Bank Dice</h1>
          <p className="mt-2 text-neon-cyan/80">The press-your-luck dice game</p>
        </div>

        {/* Create Game Card */}
        <Card>
          <CardHeader>
            <CardTitle>Start a New Game</CardTitle>
            <CardDescription>
              Create a game and become the Banker who controls the dice and player scores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateGame} className="w-full" size="lg">
              Create Game
            </Button>
          </CardContent>
        </Card>

        {/* Join Game Card */}
        <Card>
          <CardHeader>
            <CardTitle>Watch a Game</CardTitle>
            <CardDescription>
              Enter a game code to watch a game in progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joinCode">Game Code</Label>
              <Input
                id="joinCode"
                placeholder="Enter 8-character code"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError("");
                }}
                maxLength={8}
                className="text-center text-lg tracking-widest"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button
              onClick={handleJoinGame}
              variant="outline"
              className="w-full"
              disabled={joinCode.length !== 8}
            >
              Watch Game
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-neon-cyan/50">
          A family game tracker for the classic "Bank" dice game
        </p>
      </div>
    </div>
  );
}
