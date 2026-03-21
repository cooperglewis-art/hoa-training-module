"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, MessageSquare, HelpCircle } from "lucide-react";

interface ScenarioBlockProps {
  title: string;
  situation: string;
  question?: string;
  revealText: string;
}

export function ScenarioBlock({ title, situation, question, revealText }: ScenarioBlockProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl bg-[var(--accent)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 pt-5 pb-2">
        <BookOpen className="h-4 w-4 text-white/80" />
        <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
          Real-World Scenario
        </span>
      </div>

      {/* Title & Situation */}
      <div className="px-6 pb-4">
        <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
        <p className="leading-relaxed text-white/90">{situation}</p>
      </div>

      {/* Question prompt */}
      {question && (
        <div className="mx-6 mb-4 flex items-start gap-3 rounded-lg bg-white/10 border border-white/20 px-4 py-3">
          <HelpCircle className="h-5 w-5 shrink-0 text-white/80 mt-0.5" />
          <p className="text-sm font-medium text-white leading-relaxed">
            {question}
          </p>
        </div>
      )}

      {/* Reveal button */}
      {!revealed && (
        <div className="px-6 pb-5">
          <Button
            onClick={() => setRevealed(true)}
            className="gap-2 bg-white text-[var(--accent)] hover:bg-white/90"
            size="lg"
          >
            <MessageSquare className="h-4 w-4" />
            {question ? "See the Answer" : "What Happened?"}
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
            <div className="border-t border-white/20 bg-white/10 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <MessageSquare className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-2">
                    The Answer
                  </p>
                  <p className="text-sm leading-relaxed text-white/90">
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
