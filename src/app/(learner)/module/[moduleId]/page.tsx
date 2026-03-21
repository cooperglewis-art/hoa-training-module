import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getModuleWithLessons } from "@/lib/content";
import { db } from "@/lib/db";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";

interface ModulePageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const moduleData = await getModuleWithLessons(moduleId);
  if (!moduleData) {
    notFound();
  }

  // Get user's progress for this module
  const progress = await db.moduleProgress.findUnique({
    where: {
      userId_moduleId: { userId: session.id, moduleId },
    },
  });

  const completedLessons = new Set(progress?.completedLessons ?? []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Module header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--primary)]">
          Module {moduleData.sortOrder}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[var(--foreground)]">
          {moduleData.title}
        </h1>
        {moduleData.description && (
          <p className="mt-2 text-[var(--muted-foreground)]">
            {moduleData.description}
          </p>
        )}
        <div className="mt-4 text-sm text-[var(--muted-foreground)]">
          {completedLessons.size} of {moduleData.lessons.length} lessons
          completed
        </div>
      </div>

      {/* Lesson list */}
      <div className="space-y-3">
        {moduleData.lessons.map((lesson, index) => {
          const isComplete = completedLessons.has(lesson.id);

          return (
            <Link
              key={lesson.id}
              href={`/module/${moduleId}/lesson/${lesson.id}`}
              className="group block"
            >
              <div
                className={`flex items-center gap-4 rounded-xl border px-6 py-5 transition-all ${
                  isComplete
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--secondary)]/40 hover:shadow-md"
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                    isComplete
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-[var(--muted-foreground)]/40 bg-[var(--background)] group-hover:border-[var(--secondary)]/50"
                  }`}
                >
                  {isComplete && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </div>

                {/* Lesson info */}
                <div className="min-w-0 flex-1">
                  <p className={`font-medium leading-snug ${
                    isComplete
                      ? "text-emerald-800 dark:text-emerald-200"
                      : "text-[var(--foreground)]"
                  }`}>
                    <span className="text-[var(--muted-foreground)] mr-1.5">
                      {index + 1}.
                    </span>
                    {lesson.title}
                  </p>
                </div>

                {/* Status / Arrow */}
                {isComplete ? (
                  <span className="shrink-0 rounded-md bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Complete
                  </span>
                ) : (
                  <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--secondary)] transition-colors" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
