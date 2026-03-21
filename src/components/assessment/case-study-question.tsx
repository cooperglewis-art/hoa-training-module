"use client";

import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AnswerOption {
  id: string;
  text: string;
}

interface CaseStudyQuestionProps {
  index: number;
  stem: string;
  options: AnswerOption[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
}

export function CaseStudyQuestion({
  index,
  stem,
  options,
  selectedOptionId,
  onSelect,
}: CaseStudyQuestionProps) {
  return (
    <div className="rounded-xl border-2 border-[var(--secondary)]/20 bg-[var(--background)] overflow-hidden">
      <div className="bg-[var(--secondary)]/5 border-b border-[var(--secondary)]/10 px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--secondary)] mb-2">
          Question {index + 1}
        </div>
        <p className="font-medium text-[var(--foreground)] leading-relaxed">{stem}</p>
      </div>
      <div className="p-6 space-y-3">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border-2 p-4 transition-all cursor-pointer",
                isSelected
                  ? "border-[var(--secondary)] bg-[var(--secondary)]/5 shadow-sm"
                  : "border-[var(--border)] hover:border-[var(--secondary)]/40 hover:bg-[var(--muted)]/50"
              )}
            >
              <input
                type="radio"
                name={`question-${index}`}
                value={option.id}
                checked={isSelected}
                onChange={() => onSelect(option.id)}
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--secondary)] focus:ring-[var(--ring)]"
              />
              <span className="text-sm leading-relaxed text-[var(--foreground)]">{option.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
