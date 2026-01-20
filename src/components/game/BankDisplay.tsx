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
      className={"rounded-2xl p-6 text-center border-3 shadow-lg " + (inDangerZone ? "bg-gradient-to-br from-orange-100 to-rose-100 border-orange-400" : "bg-gradient-to-br from-emerald-100 to-cyan-100 border-emerald-400")}
      animate={bankTotal === 0 ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className={"text-sm font-bold uppercase tracking-widest " + (inDangerZone ? "text-orange-600" : "text-emerald-600")}>
        {inDangerZone ? "Danger Zone" : "Safe Zone"}
      </div>
      <motion.div
        className="my-2 text-6xl font-black text-indigo-900"
        key={bankTotal}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {bankTotal.toLocaleString()}
      </motion.div>
      {lastResultMessage && (
        <motion.div
          className={"mt-3 rounded-lg px-3 py-2 text-sm font-medium " + (inDangerZone ? "bg-orange-200 text-orange-800" : "bg-emerald-200 text-emerald-800")}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lastResultMessage}
        </motion.div>
      )}
    </motion.div>
  );
}
