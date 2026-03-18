import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#737852] text-sm font-bold text-white">
        CCR
      </div>
      {!collapsed && (
        <span className="text-sm font-semibold text-[#002060] whitespace-nowrap">
          Enforcement Training
        </span>
      )}
    </div>
  );
}
