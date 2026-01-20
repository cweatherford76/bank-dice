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
    <div className="flex min-h-screen items-center justify-center bg-black tron-grid p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#00d4ff] [text-shadow:0_0_20px_rgba(0,212,255,0.8),0_0_40px_rgba(0,212,255,0.5),0_0_60px_rgba(0,212,255,0.3)] tracking-wider">
            BANK DICE
          </h1>
          <p className="mt-3 text-[#888888] tracking-wide">The press-your-luck dice game</p>
        </div>

        {/* Create Game Card */}
        <Card className="border-[#00d4ff]/30 hover:border-[#00d4ff]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]">
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
        <Card className="border-[#00d4ff]/30 hover:border-[#00d4ff]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]">
          <CardHeader>
            <CardTitle>Watch a Game</CardTitle>
            <CardDescription>
              Enter a game code to watch a game in progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joinCode" className="text-[#888888]">Game Code</Label>
              <Input
                id="joinCode"
                placeholder="Enter 8-character code"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError("");
                }}
                maxLength={8}
                className="text-center text-lg tracking-widest text-[#00d4ff]"
              />
              {error && <p className="text-sm text-[#ff4444]">{error}</p>}
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
        <p className="text-center text-sm text-[#555555]">
          A family game tracker for the classic &quot;Bank&quot; dice game
        </p>
      </div>
    </div>
  );
}
