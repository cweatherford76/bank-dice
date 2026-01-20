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
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#00ffff]">Player Scores</h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const canBank = !player.hasBanked && canBankAtAll;
          const isLeading = index === 0 && player.totalScore > 0;
          const isCurrentPlayer = player.id === currentPlayerId;

          return (
            <motion.div
              key={player.id}
              className={`flex items-center gap-3 rounded-lg border-2 p-3 ${
                isCurrentPlayer
                  ? "border-[#39ff14] bg-[#39ff14]/10 shadow-[0_0_10px_#39ff14]"
                  : player.hasBanked
                  ? "border-[#00ffff] bg-[#00ffff]/10"
                  : "border-[#bf00ff]/50 bg-[#1a0533]/50"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Rank */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  isLeading
                    ? "bg-[#ffff00] text-[#0d0221] shadow-[0_0_10px_#ffff00]"
                    : "bg-[#bf00ff]/30 text-[#bf00ff]"
                }`}
              >
                {index + 1}
              </div>

              {/* Player Info */}
              <div className="flex-1">
                <div className="font-bold text-[#00ffff]">{player.name}</div>
                {player.hasBanked && player.currentRoundBanked !== null && (
                  <div className="text-xs text-[#39ff14] font-bold">
                    Banked +{player.currentRoundBanked.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-lg font-bold text-[#ffff00]" style={{ textShadow: '0 0 5px #ffff00' }}>
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
                  className={player.hasBanked ? "text-[#39ff14]" : ""}
                >
                  {player.hasBanked ? "BANKED" : "BANK"}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
