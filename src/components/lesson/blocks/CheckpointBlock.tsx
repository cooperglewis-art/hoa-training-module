"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, XCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckpointBlockProps {
  question: string;
  options: string[];
  correctIndex: number;
  gateNext: boolean;
}

export function CheckpointBlock({
  question,
  options,
  correctIndex,
  gateNext,
}: CheckpointBlockProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);

  const isCorrect = submitted && selected === correctIndex;

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === correctIndex) {
      setPassed(true);
    }
  }

  function handleRetry() {
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <Card className="border-[var(--secondary)]/50 border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-[var(--secondary)]" />
          Checkpoint
          {gateNext && !passed && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-normal text-[var(--muted-foreground)]">
              <Lock className="h-3 w-3" />
              Required to proceed
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium text-[var(--foreground)]">{question}</p>

        <div className="space-y-2">
          {options.map((option, index) => {
            const isThisCorrect = submitted && index === correctIndex;
            const isThisSelected = selected === index;
            const isThisWrong = submitted && isThisSelected && index !== correctIndex;

            return (
              <label
                key={index}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                  !submitted && isThisSelected
                    ? "border-[var(--secondary)] bg-[var(--secondary)]/5"
                    : "border-[var(--border)]",
                  submitted && isThisCorrect
                    ? "border-green-500 bg-green-50"
                    : "",
                  isThisWrong ? "border-red-500 bg-red-50" : "",
                  submitted ? "cursor-default" : "hover:bg-[var(--muted)]"
                )}
              >
                <input
                  type="radio"
                  name={`checkpoint-${question.slice(0, 20)}`}
                  value={index}
                  checked={isThisSelected}
                  onChange={() => !submitted && setSelected(index)}
                  disabled={submitted}
                  className="h-4 w-4 text-[var(--secondary)] focus:ring-[var(--ring)]"
                />
                <span className="text-sm text-[var(--foreground)]">{option}</span>
                {submitted && isThisCorrect && (
                  <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
                )}
                {isThisWrong && (
                  <XCircle className="ml-auto h-4 w-4 text-red-600" />
                )}
              </label>
            );
          })}
        </div>

        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={selected === null}
            variant="secondary"
          >
            Submit Answer
          </Button>
        )}

        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "rounded-md p-4",
                  isCorrect
                    ? "border border-green-200 bg-green-50"
                    : "border border-red-200 bg-red-50"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isCorrect ? "text-green-700" : "text-red-700"
                  )}
                >
                  {isCorrect
                    ? "Correct! You may proceed."
                    : "Incorrect. Please try again to continue."}
                </p>
              </div>
              {!isCorrect && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-3"
                >
                  Try Again
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gate indicator */}
        {gateNext && !passed && (
          <div className="flex items-center gap-2 rounded-md bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">
            <Lock className="h-4 w-4" />
            Answer correctly to unlock the next lesson.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
