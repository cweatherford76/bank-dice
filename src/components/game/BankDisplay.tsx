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
      className={"rounded-xl p-6 text-center border-2 backdrop-blur-sm " + (inDangerZone ? "bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-500/20" : "bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/20")}
      animate={bankTotal === 0 ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className={"text-sm font-semibold uppercase tracking-widest " + (inDangerZone ? "text-rose-400" : "text-cyan-400")}>
        {inDangerZone ? "Danger Zone" : "Safe Zone"}
      </div>
      <motion.div
        className={"my-2 text-6xl font-bold " + (inDangerZone ? "text-rose-300" : "text-cyan-300")}
        key={bankTotal}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {bankTotal.toLocaleString()}
      </motion.div>
      {lastResultMessage && (
        <motion.div
          className={"mt-3 rounded-lg px-3 py-2 text-sm font-medium " + (inDangerZone ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30")}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lastResultMessage}
        </motion.div>
      )}
    </motion.div>
  );
}
