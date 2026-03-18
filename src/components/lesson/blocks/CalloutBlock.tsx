import { Info, AlertTriangle, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutBlockProps {
  variant: "info" | "warning" | "statute";
  title: string;
  body: string;
}

const variantStyles = {
  info: {
    border: "border-l-[var(--secondary)]",
    bg: "bg-[var(--secondary)]/5",
    icon: Info,
    iconColor: "text-[var(--secondary)]",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-50",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
  },
  statute: {
    border: "border-l-[var(--primary)]",
    bg: "bg-[var(--primary)]/5",
    icon: Gavel,
    iconColor: "text-[var(--primary)]",
  },
};

export function CalloutBlock({ variant, title, body }: CalloutBlockProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "rounded-r-lg border-l-4 p-4",
        style.border,
        style.bg
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", style.iconColor)} />
        <div className="min-w-0">
          <p className="font-semibold text-[var(--foreground)]">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--foreground)]/80">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
