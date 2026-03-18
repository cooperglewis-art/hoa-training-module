"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface AssessmentResultAnimationProps {
  score: number;
  total: number;
  passed: boolean;
}

function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ["#737852", "#002060", "#675D4F", "#22c55e", "#eab308"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute top-0 h-2 w-2 rounded-full"
      style={{ left: `${x}%`, backgroundColor: color }}
      initial={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, -40, 120],
        scale: [0, 1.2, 0.6],
        rotate: [0, 180, 360],
        x: [0, (Math.random() - 0.5) * 80],
      }}
      transition={{
        duration: 1.8,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

export function AssessmentResultAnimation({
  score,
  total,
  passed,
}: AssessmentResultAnimationProps) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Confetti for pass */}
      {passed && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={0.3 + i * 0.06}
              x={15 + Math.random() * 70}
            />
          ))}
        </div>
      )}

      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      >
        {passed ? (
          <CheckCircle2 className="h-20 w-20 text-green-500" strokeWidth={1.5} />
        ) : (
          <XCircle className="h-20 w-20 text-red-500" strokeWidth={1.5} />
        )}
      </motion.div>

      {/* Score */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-5xl font-bold tabular-nums">
          <span className={passed ? "text-green-600" : "text-red-600"}>
            {score}
          </span>
          <span className="text-[var(--muted-foreground)]">/{total}</span>
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Correct Answers
        </p>
      </motion.div>
    </div>
  );
}
