"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shuffle, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface DragDropMatchBlockProps {
  pairs: { left: string; right: string }[];
}

interface Match {
  leftIndex: number;
  rightIndex: number;
}

export function DragDropMatchBlock({ pairs }: DragDropMatchBlockProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Shuffle right side once on mount
  const shuffledRight = useMemo(() => {
    const indexed = pairs.map((p, i) => ({ text: p.right, originalIndex: i }));
    // Fisher-Yates shuffle
    const arr = [...indexed];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [pairs]);

  const matchedLeftIndices = new Set(matches.map((m) => m.leftIndex));
  const matchedRightIndices = new Set(matches.map((m) => m.rightIndex));

  const handleLeftClick = useCallback(
    (index: number) => {
      if (submitted || matchedLeftIndices.has(index)) return;
      setSelectedLeft(selectedLeft === index ? null : index);
    },
    [submitted, matchedLeftIndices, selectedLeft]
  );

  const handleRightClick = useCallback(
    (shuffledIndex: number) => {
      if (submitted || matchedRightIndices.has(shuffledIndex)) return;
      if (selectedLeft === null) return;

      setMatches((prev) => [
        ...prev,
        { leftIndex: selectedLeft, rightIndex: shuffledIndex },
      ]);
      setSelectedLeft(null);
    },
    [submitted, matchedRightIndices, selectedLeft]
  );

  function checkMatches() {
    setSubmitted(true);
  }

  function isMatchCorrect(match: Match): boolean {
    const rightItem = shuffledRight[match.rightIndex];
    return rightItem.originalIndex === match.leftIndex;
  }

  const allCorrect =
    submitted && matches.length === pairs.length && matches.every(isMatchCorrect);
  const hasErrors = submitted && !allCorrect;

  function handleReset() {
    setMatches([]);
    setSubmitted(false);
    setSelectedLeft(null);
  }

  function getMatchForLeft(leftIndex: number): Match | undefined {
    return matches.find((m) => m.leftIndex === leftIndex);
  }

  function getMatchForRight(rightIndex: number): Match | undefined {
    return matches.find((m) => m.rightIndex === rightIndex);
  }

  return (
    <Card className="border-[var(--accent)]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shuffle className="h-5 w-5 text-[var(--accent)]" />
          Match the Pairs
        </CardTitle>
        <p className="text-sm text-[var(--muted-foreground)]">
          Click an item on the left, then click its match on the right.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-2">
            {pairs.map((pair, index) => {
              const isMatched = matchedLeftIndices.has(index);
              const match = getMatchForLeft(index);
              const isCorrect = submitted && match ? isMatchCorrect(match) : null;

              return (
                <button
                  key={`left-${index}`}
                  onClick={() => handleLeftClick(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleLeftClick(index);
                    }
                  }}
                  disabled={isMatched || submitted}
                  aria-pressed={selectedLeft === index}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                    selectedLeft === index
                      ? "border-[var(--secondary)] bg-[var(--secondary)]/10 ring-2 ring-[var(--secondary)]/30"
                      : "border-[var(--border)]",
                    isMatched && !submitted
                      ? "border-[var(--primary)]/50 bg-[var(--primary)]/5 opacity-75"
                      : "",
                    submitted && isCorrect === true
                      ? "border-green-500 bg-green-50"
                      : "",
                    submitted && isCorrect === false
                      ? "border-red-500 bg-red-50"
                      : "",
                    !isMatched && !submitted
                      ? "cursor-pointer hover:bg-[var(--muted)]"
                      : "",
                    submitted ? "cursor-default" : ""
                  )}
                >
                  {pair.left}
                  {submitted && isCorrect === true && (
                    <CheckCircle2 className="ml-auto inline h-4 w-4 text-green-600" />
                  )}
                  {submitted && isCorrect === false && (
                    <XCircle className="ml-auto inline h-4 w-4 text-red-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right column */}
          <div className="space-y-2">
            {shuffledRight.map((item, index) => {
              const isMatched = matchedRightIndices.has(index);
              const match = getMatchForRight(index);
              const isCorrect =
                submitted && match ? isMatchCorrect(match) : null;

              return (
                <button
                  key={`right-${index}`}
                  onClick={() => handleRightClick(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRightClick(index);
                    }
                  }}
                  disabled={isMatched || submitted || selectedLeft === null}
                  aria-label={`Match option: ${item.text}`}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                    isMatched && !submitted
                      ? "border-[var(--primary)]/50 bg-[var(--primary)]/5 opacity-75"
                      : "border-[var(--border)]",
                    submitted && isCorrect === true
                      ? "border-green-500 bg-green-50"
                      : "",
                    submitted && isCorrect === false
                      ? "border-red-500 bg-red-50"
                      : "",
                    !isMatched && !submitted && selectedLeft !== null
                      ? "cursor-pointer hover:bg-[var(--muted)]"
                      : "",
                    submitted ? "cursor-default" : ""
                  )}
                >
                  {item.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!submitted && matches.length === pairs.length && (
            <Button onClick={checkMatches} variant="secondary">
              Check Matches
            </Button>
          )}
          {(matches.length > 0 || submitted) && (
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "rounded-md p-4 text-sm",
                  allCorrect
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                )}
              >
                {allCorrect
                  ? "All pairs matched correctly!"
                  : "Some matches are incorrect. Try again!"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
