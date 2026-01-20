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
      className={`rounded-xl p-6 text-center border-2 transition-all duration-300 ${
        inDangerZone
          ? "bg-[#1a0a00] border-[#ff6600] shadow-[0_0_20px_rgba(255,102,0,0.4),inset_0_0_30px_rgba(255,102,0,0.1)]"
          : "bg-[#001a1f] border-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.4),inset_0_0_30px_rgba(0,212,255,0.1)]"
      }`}
      animate={bankTotal === 0 ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div
        className={`text-sm font-medium uppercase tracking-widest ${
          inDangerZone ? "text-[#ff6600]" : "text-[#00d4ff]"
        }`}
      >
        {inDangerZone ? "DANGER ZONE" : "SAFE ZONE"}
      </div>
      <motion.div
        className={`my-2 text-6xl font-bold ${
          inDangerZone
            ? "text-[#ff6600] [text-shadow:0_0_20px_rgba(255,102,0,0.8),0_0_40px_rgba(255,102,0,0.5)]"
            : "text-[#00d4ff] [text-shadow:0_0_20px_rgba(0,212,255,0.8),0_0_40px_rgba(0,212,255,0.5)]"
        }`}
        key={bankTotal}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {bankTotal.toLocaleString()}
      </motion.div>
      {lastResultMessage && (
        <motion.div
          className={`mt-3 rounded-md px-3 py-2 text-sm font-medium ${
            inDangerZone
              ? "bg-[#ff6600]/20 text-[#ff6600] border border-[#ff6600]/30"
              : "bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30"
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lastResultMessage}
        </motion.div>
      )}
    </motion.div>
  );
}
