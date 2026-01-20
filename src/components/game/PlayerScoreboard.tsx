"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Player } from "@/types/game";

interface PlayerScoreboardProps {
  players: Player[];
  bankTotal: number;
  minimumBank: number;
  onBank: (playerId: string) => void;
  isBanker: boolean;
  currentPlayerId?: string;
}

export function PlayerScoreboard({
  players,
  bankTotal,
  minimumBank,
  onBank,
  isBanker,
  currentPlayerId,
}: PlayerScoreboardProps) {
  const sortedPlayers = [...players].sort(
    (a, b) => b.totalScore - a.totalScore
  );
  const canBankAtAll = minimumBank === 0 || bankTotal > minimumBank;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Player Scores</h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const canBank = !player.hasBanked && canBankAtAll;
          const isLeading = index === 0 && player.totalScore > 0;
          const isCurrentPlayer = player.id === currentPlayerId;

          // Determine styling based on state
          let borderColor = 'var(--card-border)';
          let bgColor = 'var(--card-bg)';
          let boxShadow = 'none';
          
          if (isCurrentPlayer) {
            borderColor = 'var(--accent)';
            bgColor = 'var(--card-bg)';
            boxShadow = '0 0 15px var(--accent), inset 0 0 20px rgba(0,0,0,0.2)';
          } else if (player.hasBanked) {
            borderColor = 'var(--banked-color, #22c55e)';
            bgColor = 'var(--card-bg)';
            boxShadow = '0 0 10px var(--banked-color, #22c55e)';
          }

          return (
            <motion.div
              key={player.id}
              className="flex items-center gap-3 rounded-lg border-2 p-3"
              style={{
                borderColor,
                background: bgColor,
                boxShadow,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Rank */}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: isLeading ? 'var(--leader-color, #eab308)' : 'var(--muted)',
                  color: isLeading ? '#000' : 'var(--muted-foreground)',
                  boxShadow: isLeading ? '0 0 10px var(--leader-color, #eab308)' : 'none',
                }}
              >
                {index + 1}
              </div>

              {/* Player Info */}
              <div className="flex-1">
                <div className="font-medium" style={{ color: 'var(--foreground)' }}>{player.name}</div>
                {player.hasBanked && player.currentRoundBanked !== null && (
                  <div className="text-xs" style={{ color: 'var(--banked-color, #22c55e)' }}>
                    Banked +{player.currentRoundBanked.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Score */}
              <div className="text-right">
                <div 
                  className="text-lg font-bold"
                  style={{ 
                    color: 'var(--score-color, var(--foreground))',
                    textShadow: '0 0 8px var(--accent)',
                  }}
                >
                  {player.totalScore.toLocaleString()}
                </div>
              </div>

              {/* Bank Button (Banker only) */}
              {isBanker && (
                <Button
                  variant={player.hasBanked ? "ghost" : "default"}
                  size="sm"
                  onClick={() => onBank(player.id)}
                  disabled={!canBank}
                  style={player.hasBanked ? { color: 'var(--banked-color, #22c55e)' } : {}}
                >
                  {player.hasBanked ? "✓ Banked" : "Bank"}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
