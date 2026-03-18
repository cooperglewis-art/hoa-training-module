"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

interface ResultCardProps {
  index: number;
  stem: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

export function ResultCard({
  index,
  stem,
  userAnswer,
  correctAnswer,
  explanation,
  isCorrect,
}: ResultCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-l-4",
        isCorrect ? "border-l-green-500" : "border-l-red-500"
      )}
    >
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#002060] text-xs font-bold text-white">
              {index + 1}
            </span>
            <p className="font-serif text-[#002060] leading-snug font-medium">
              {stem}
            </p>
          </div>

          <div className="ml-10 space-y-2">
            <div
              className={cn(
                "flex items-start gap-2 rounded-lg p-3",
                isCorrect ? "bg-green-50" : "bg-red-50"
              )}
            >
              {isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              )}
              <div>
                <p className="text-sm font-medium">
                  Your answer:{" "}
                  <span
                    className={isCorrect ? "text-green-700" : "text-red-700"}
                  >
                    {userAnswer}
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-sm font-medium text-green-700 mt-1">
                    Correct answer: {correctAnswer}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-[var(--muted)] p-3">
              <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-1">
                Explanation
              </p>
              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
