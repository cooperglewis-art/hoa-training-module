"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Lightbulb, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface KnowledgeCheckBlockProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  gateNext?: boolean;
}

export function KnowledgeCheckBlock({
  question,
  options,
  correctIndex,
  explanation,
  gateNext,
}: KnowledgeCheckBlockProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected === correctIndex;
  const isIncorrect = submitted && selected !== correctIndex;

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
  }

  function handleReset() {
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <div className="rounded-xl border-2 border-[var(--secondary)]/20 bg-[var(--background)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--secondary)]/5 border-b border-[var(--secondary)]/10 px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--secondary)] mb-2">
          <Lightbulb className="h-4 w-4" />
          Quick Check
        </div>
        <p className="font-medium text-[var(--foreground)] leading-relaxed">{question}</p>
      </div>

      {/* Options */}
      <div className="p-6 space-y-3">
        {options.map((option, index) => {
          const isThisCorrect = submitted && index === correctIndex;
          const isThisSelected = selected === index;
          const isThisWrong = submitted && isThisSelected && index !== correctIndex;

          return (
            <label
              key={index}
              className={cn(
                "flex items-start gap-3 rounded-lg border-2 p-4 transition-all cursor-pointer",
                // Default
                !submitted && !isThisSelected && "border-[var(--border)] hover:border-[var(--secondary)]/40 hover:bg-[var(--muted)]/50",
                // Selected (pre-submit)
                !submitted && isThisSelected && "border-[var(--secondary)] bg-[var(--secondary)]/5 shadow-sm",
                // Correct answer
                submitted && isThisCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                // Wrong selected answer
                isThisWrong && "border-red-400 bg-red-50 dark:bg-red-950/30",
                // Other options after submit
                submitted && !isThisCorrect && !isThisWrong && "border-[var(--border)] opacity-50",
                submitted && "cursor-default"
              )}
            >
              <input
                type="radio"
                name={`quiz-${question.slice(0, 20)}`}
                value={index}
                checked={isThisSelected}
                onChange={() => !submitted && setSelected(index)}
                disabled={submitted}
                className="mt-0.5 h-4 w-4 text-[var(--secondary)] focus:ring-[var(--ring)]"
              />
              <span className={cn(
                "text-sm leading-relaxed",
                submitted && isThisCorrect && "text-emerald-800 dark:text-emerald-200 font-medium",
                isThisWrong && "text-red-800 dark:text-red-200",
                !submitted && "text-[var(--foreground)]",
                submitted && !isThisCorrect && !isThisWrong && "text-[var(--muted-foreground)]"
              )}>
                {option}
              </span>
              {submitted && isThisCorrect && (
                <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />
              )}
              {isThisWrong && (
                <XCircle className="ml-auto h-5 w-5 shrink-0 text-red-500" />
              )}
            </label>
          );
        })}

        {/* Submit button */}
        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={selected === null}
            className="mt-2 bg-[var(--secondary)] text-white hover:bg-[var(--secondary)]/90"
            size="lg"
          >
            Check Answer
          </Button>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div
                className={cn(
                  "rounded-lg p-5 mt-2",
                  isCorrect
                    ? "bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800"
                    : "bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-800"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <p
                    className={cn(
                      "font-bold text-base",
                      isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
                    )}
                  >
                    {isCorrect ? "Correct!" : "Not quite right"}
                  </p>
                </div>
                {explanation && (
                  <p className="text-sm leading-relaxed text-[var(--foreground)]/80 ml-7">
                    {explanation}
                  </p>
                )}
                {!explanation && isCorrect && gateNext && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 ml-7">
                    You may proceed to the next lesson.
                  </p>
                )}
              </div>

              {isIncorrect && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="mt-3 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gate indicator */}
        {gateNext && !submitted && (
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            You must answer this question to continue.
          </p>
        )}
      </div>
    </div>
  );
}
