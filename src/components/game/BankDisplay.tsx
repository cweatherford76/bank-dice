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
      className={"rounded-xl p-6 text-center border-2 " + (inDangerZone ? "bg-blue-50 border-blue-300" : "bg-yellow-50 border-yellow-300")}
      animate={bankTotal === 0 ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className={"text-sm font-medium uppercase tracking-wide " + (inDangerZone ? "text-blue-600" : "text-yellow-600")}>
        {inDangerZone ? "Live Game" : "Safe Zone"}
      </div>
      <motion.div
        className="my-2 text-6xl font-bold text-zinc-900"
        key={bankTotal}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {bankTotal.toLocaleString()}
      </motion.div>
      {lastResultMessage && (
        <motion.div
          className={"mt-3 rounded-md px-3 py-2 text-sm " + (inDangerZone ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700")}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lastResultMessage}
        </motion.div>
      )}
    </motion.div>
  );
}
