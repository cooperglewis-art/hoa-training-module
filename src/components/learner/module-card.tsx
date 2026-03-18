"use client";

import Link from "next/link";
import { Lock, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    sortOrder: number;
    totalLessons: number;
    completedLessons: string[];
    completedAt: Date | null;
    locked: boolean;
  };
}

export function ModuleCard({ module }: ModuleCardProps) {
  const completedCount = module.completedLessons.length;
  const progressPercent =
    module.totalLessons > 0
      ? Math.round((completedCount / module.totalLessons) * 100)
      : 0;
  const isComplete = module.completedAt !== null;

  const content = (
    <Card
      className={cn(
        "relative transition-shadow hover:shadow-md",
        module.locked && "opacity-60 cursor-not-allowed"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--muted-foreground)]">
            Module {module.sortOrder}
          </span>
          {module.locked && <Lock className="h-4 w-4 text-[var(--muted-foreground)]" />}
          {isComplete && !module.locked && (
            <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" />
          )}
        </div>
        <CardTitle className="text-lg">{module.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {module.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">
              {completedCount} / {module.totalLessons} lessons
            </span>
            <span className="font-medium text-[var(--foreground)]">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardContent>
      {isComplete && (
        <CardFooter>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        </CardFooter>
      )}
    </Card>
  );

  if (module.locked) {
    return content;
  }

  return (
    <Link href={`/module/${module.id}`} className="block">
      {content}
    </Link>
  );
}
