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
      className="bank-display rounded-xl p-6 text-center border-2"
      style={{
        background: inDangerZone ? 'var(--danger-zone-bg)' : 'var(--safe-zone-bg)',
        borderColor: inDangerZone ? 'var(--danger-zone-border)' : 'var(--safe-zone-border)',
        boxShadow: inDangerZone 
          ? '0 0 15px var(--danger-zone-border), inset 0 0 30px rgba(0,0,0,0.3)' 
          : '0 0 15px var(--safe-zone-border), inset 0 0 30px rgba(0,0,0,0.3)',
      }}
      animate={bankTotal === 0 ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div 
        className="text-sm font-medium uppercase tracking-wide"
        style={{ 
          color: inDangerZone ? 'var(--danger-zone-border)' : 'var(--safe-zone-border)',
          textShadow: '0 0 10px currentColor',
        }}
      >
        {inDangerZone ? "Live Game" : "Safe Zone"}
      </div>
      <motion.div
        className="bank-total my-2 text-6xl font-bold"
        style={{ 
          color: 'var(--foreground)',
          textShadow: '0 0 20px var(--accent), 0 0 40px var(--accent)',
        }}
        key={bankTotal}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {bankTotal.toLocaleString()}
      </motion.div>
      {lastResultMessage && (
        <motion.div
          className="mt-3 rounded-md px-3 py-2 text-sm font-medium"
          style={{
            background: inDangerZone ? 'var(--danger-zone-bg)' : 'var(--safe-zone-bg)',
            color: inDangerZone ? 'var(--danger-zone-border)' : 'var(--safe-zone-border)',
            border: '1px solid currentColor',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lastResultMessage}
        </motion.div>
      )}
    </motion.div>
  );
}
