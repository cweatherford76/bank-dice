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
      className={"rounded-xl p-6 text-center border-2 " + (inDangerZone
        ? "bg-[#1a0533]/80 border-[#ff2d95] shadow-[0_0_20px_#ff2d95,inset_0_0_30px_rgba(255,45,149,0.2)]"
        : "bg-[#1a0533]/80 border-[#39ff14] shadow-[0_0_20px_#39ff14,inset_0_0_30px_rgba(57,255,20,0.2)]")}
      animate={bankTotal === 0 ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className={"text-sm font-bold uppercase tracking-widest " + (inDangerZone
        ? "text-[#ff2d95]"
        : "text-[#39ff14]")}
        style={{ textShadow: inDangerZone ? '0 0 10px #ff2d95' : '0 0 10px #39ff14' }}
      >
        {inDangerZone ? "DANGER ZONE" : "SAFE ZONE"}
      </div>
      <motion.div
        className="my-2 text-6xl font-bold text-[#ffff00]"
        style={{ textShadow: '0 0 10px #ffff00, 0 0 20px #ffff00, 0 0 30px #ffff00' }}
        key={bankTotal}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {bankTotal.toLocaleString()}
      </motion.div>
      {lastResultMessage && (
        <motion.div
          className={"mt-3 rounded-md px-3 py-2 text-sm font-bold " + (inDangerZone
            ? "bg-[#ff2d95]/20 text-[#ff2d95] border border-[#ff2d95]"
            : "bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]")}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lastResultMessage}
        </motion.div>
      )}
    </motion.div>
  );
}
