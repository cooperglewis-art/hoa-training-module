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
    <Card className="overflow-hidden">
      <CardHeader className="bg-[var(--muted)] pb-4">
        <CardTitle className="flex items-start gap-3 text-base">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#002060] text-xs font-bold text-white">
            {index + 1}
          </span>
          <span className="font-serif text-[#002060] leading-snug">
            {stem}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  isSelected
                    ? "border-[#737852] bg-[#737852]/5 ring-1 ring-[#737852]"
                    : "border-[var(--border)] hover:bg-[var(--muted)]"
                )}
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onSelect(option.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#737852]"
                />
                <span className="text-sm leading-relaxed">{option.text}</span>
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
