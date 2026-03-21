interface TimelineBlockProps {
  steps: { title: string; description: string }[];
}

export function TimelineBlock({ steps }: TimelineBlockProps) {
  return (
    <div className="relative space-y-0 pl-8">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-[var(--border)]" />

      {steps.map((step, index) => (
        <div key={index} className="relative pb-8 last:pb-0">
          {/* Numbered circle */}
          <div className="absolute -left-8 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--primary)] bg-[var(--background)] text-sm font-bold text-[var(--primary)]">
            {index + 1}
          </div>

          {/* Content */}
          <div className="pt-0.5 pl-4">
            <p className="font-semibold text-[var(--foreground)]">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
