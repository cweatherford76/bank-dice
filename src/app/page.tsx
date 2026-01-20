"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidJoinCode } from "@/lib/game-engine";
import { getTheme, DEFAULT_THEME } from "@/lib/themes";

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  // Apply default theme on home page
  useEffect(() => {
    const theme = getTheme(DEFAULT_THEME);
    document.body.className = theme.cssClass;
    return () => {
      document.body.className = "";
    };
  }, []);

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
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-wider">BANK DICE</h1>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>The press-your-luck dice game</p>
        </div>

        {/* Create Game Card */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: 'var(--accent)' }}>Start a New Game</CardTitle>
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
            <CardTitle style={{ color: 'var(--accent)' }}>Watch a Game</CardTitle>
            <CardDescription>
              Enter a game code to watch a game in progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joinCode" style={{ color: 'var(--muted-foreground)' }}>Game Code</Label>
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
              {error && <p className="text-sm" style={{ color: 'var(--bust-border)' }}>{error}</p>}
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
        <p className="text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
          A family game tracker for the classic "Bank" dice game
        </p>
      </div>
    </div>
  );
}
