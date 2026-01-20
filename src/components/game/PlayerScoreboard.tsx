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
      <h3 className="text-sm font-bold text-violet-600 uppercase tracking-wide">Player Scores</h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const canBank = !player.hasBanked && canBankAtAll;
          const isLeading = index === 0 && player.totalScore > 0;
          const isCurrentPlayer = player.id === currentPlayerId;

          return (
            <motion.div
              key={player.id}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 shadow-sm ${
                isCurrentPlayer
                  ? "border-cyan-400 bg-gradient-to-r from-cyan-50 to-violet-50"
                  : player.hasBanked
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-violet-200 bg-white"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Rank */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  isLeading
                    ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md"
                    : "bg-violet-100 text-violet-700"
                }`}
              >
                {index + 1}
              </div>

              {/* Player Info */}
              <div className="flex-1">
                <div className="font-medium">{player.name}</div>
                {player.hasBanked && player.currentRoundBanked !== null && (
                  <div className="text-xs font-semibold text-emerald-600">
                    Banked +{player.currentRoundBanked.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-lg font-bold">
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
                  className={player.hasBanked ? "text-emerald-600 font-semibold" : ""}
                >
                  {player.hasBanked ? "Banked" : "Bank"}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
