import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-[#675D4F]" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#002060]">{value}</div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            {trend && (
              <span
                className={
                  trend.direction === "up"
                    ? "text-emerald-600"
                    : "text-red-600"
                }
              >
                {trend.direction === "up" ? "\u2191" : "\u2193"} {trend.value}
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
