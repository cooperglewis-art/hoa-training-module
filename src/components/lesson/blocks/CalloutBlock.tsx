import { Info, AlertTriangle, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutBlockProps {
  variant: "info" | "warning" | "statute";
  title: string;
  body: string;
}

const variantStyles = {
  info: {
    container: "bg-[var(--secondary)] text-white",
    icon: Info,
    iconColor: "text-white/80",
    titleColor: "text-white",
    bodyColor: "text-white/90",
  },
  warning: {
    container: "bg-[var(--accent)] text-white",
    icon: AlertTriangle,
    iconColor: "text-white/80",
    titleColor: "text-white",
    bodyColor: "text-white/90",
  },
  statute: {
    container: "bg-[var(--primary)] text-white",
    icon: Gavel,
    iconColor: "text-white/80",
    titleColor: "text-white",
    bodyColor: "text-white/90",
  },
};

export function CalloutBlock({ variant, title, body }: CalloutBlockProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "rounded-lg p-5",
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
