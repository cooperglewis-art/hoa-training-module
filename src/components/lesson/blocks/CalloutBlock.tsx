import { Info, AlertTriangle, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutBlockProps {
  variant: "info" | "warning" | "statute";
  title: string;
  body: string;
}

const variantStyles = {
  info: {
    container: "border-l-[var(--secondary)] bg-blue-50 dark:bg-blue-950/30",
    icon: Info,
    iconColor: "text-[var(--secondary)]",
    titleColor: "text-[var(--foreground)]",
    bodyColor: "text-gray-700 dark:text-gray-300",
  },
  warning: {
    container: "border-l-amber-500 bg-amber-50 dark:bg-amber-950/30",
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-[var(--foreground)]",
    bodyColor: "text-gray-700 dark:text-gray-300",
  },
  statute: {
    container: "border-l-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/30",
    icon: Gavel,
    iconColor: "text-[var(--primary)]",
    titleColor: "text-[var(--foreground)]",
    bodyColor: "text-gray-700 dark:text-gray-300",
  },
};

export function CalloutBlock({ variant, title, body }: CalloutBlockProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "rounded-r-lg border-l-4 p-5",
        style.container
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", style.iconColor)} />
        <div className="min-w-0">
          <p className={cn("font-semibold", style.titleColor)}>{title}</p>
          <p className={cn("mt-1 text-sm leading-relaxed", style.bodyColor)}>
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
