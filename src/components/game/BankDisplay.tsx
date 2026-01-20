"use client";

import { motion } from "framer-motion";

interface BankDisplayProps {
  bankTotal: number;
  rollCount: number;
  safeZoneRolls: number;
  lastResultMessage?: string;
}

export function BankDisplay({
  bankTotal,
  rollCount,
  safeZoneRolls,
  lastResultMessage,
}: BankDisplayProps) {
  const inDangerZone = rollCount > safeZoneRolls;

  return (
    <motion.div
      className={"rounded-xl p-6 text-center border-2 " + (inDangerZone ? "bg-neon-orange/10 border-neon-orange shadow-lg shadow-neon-orange/30" : "bg-neon-green/10 border-neon-green shadow-lg shadow-neon-green/30")}
      animate={bankTotal === 0 ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className={"text-sm font-medium uppercase tracking-wide " + (inDangerZone ? "text-neon-orange" : "text-neon-green")}>
        {inDangerZone ? "Danger Zone" : "Safe Zone"}
      </div>
      <motion.div
        className={"my-2 text-6xl font-bold " + (inDangerZone ? "text-neon-orange" : "text-neon-green")}
        key={bankTotal}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {bankTotal.toLocaleString()}
      </motion.div>
      {lastResultMessage && (
        <motion.div
          className={"mt-3 rounded-md px-3 py-2 text-sm " + (inDangerZone ? "bg-neon-orange/20 text-neon-orange border border-neon-orange/50" : "bg-neon-green/20 text-neon-green border border-neon-green/50")}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lastResultMessage}
        </motion.div>
      )}
    </motion.div>
  );
}
