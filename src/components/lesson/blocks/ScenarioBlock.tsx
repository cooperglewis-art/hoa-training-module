"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, MessageSquare } from "lucide-react";

interface ScenarioBlockProps {
  title: string;
  situation: string;
  revealText: string;
}

export function ScenarioBlock({ title, situation, revealText }: ScenarioBlockProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 pt-5 pb-2">
        <BookOpen className="h-4 w-4 text-amber-700 dark:text-amber-400" />
        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
          Real-World Scenario
        </span>
      </div>

      {/* Title & Situation */}
      <div className="px-6 pb-4">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">{title}</h3>
        <p className="leading-relaxed text-[var(--foreground)]/90">{situation}</p>
      </div>

      {/* Reveal button */}
      {!revealed && (
        <div className="px-6 pb-5">
          <Button
            onClick={() => setRevealed(true)}
            className="gap-2 bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            <MessageSquare className="h-4 w-4" />
            What Happened?
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Reveal content */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-amber-200 dark:border-amber-800/50 bg-white/60 dark:bg-[var(--background)]/60 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    The Takeaway
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--foreground)]/85">
                    {revealText}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
