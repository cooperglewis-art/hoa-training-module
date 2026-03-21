import { Gavel } from "lucide-react";
import type { OrgType } from "@/types/content";
import { ORG_TYPES } from "@/lib/constants";

interface StatuteCalloutBlockProps {
  statute: string;
  summary: string;
  appliesTo: OrgType[];
}

export function StatuteCalloutBlock({
  statute,
  summary,
  appliesTo,
}: StatuteCalloutBlockProps) {
  return (
    <div className="rounded-lg border-l-4 border-l-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/30 p-5">
      <div className="flex items-start gap-3">
        <Gavel className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--primary)]" />
        <div className="min-w-0">
          <p className="font-serif font-semibold text-[var(--foreground)]">
            {statute}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {appliesTo.map((type) => (
              <span
                key={type}
                className="inline-block rounded-full bg-[var(--primary)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--primary)]"
              >
                {ORG_TYPES[type]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
