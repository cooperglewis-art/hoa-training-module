"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface KnowledgeCheckBlockProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function KnowledgeCheckBlock({
  question,
  options,
  correctIndex,
  explanation,
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
    <Card className="border-[var(--secondary)]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HelpCircle className="h-5 w-5 text-[var(--secondary)]" />
          Knowledge Check
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
                  name={`kc-${question.slice(0, 20)}`}
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
            Check Answer
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
                    "text-sm font-semibold mb-1",
                    isCorrect ? "text-green-700" : "text-red-700"
                  )}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-sm leading-relaxed text-[var(--foreground)]/80">
                  {explanation}
                </p>
              </div>
              {isIncorrect && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="mt-3"
                >
                  Try Again
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
