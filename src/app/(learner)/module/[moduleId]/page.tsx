import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getModuleWithLessons } from "@/lib/content";
import { db } from "@/lib/db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";

interface ModulePageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const moduleData = await getModuleWithLessons(moduleId);
  if (!moduleData) {
    notFound();
  }

  // Get user's progress for this module
  const progress = await db.moduleProgress.findUnique({
    where: {
      userId_moduleId: { userId: session.user.id, moduleId },
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
              className="block"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex-row items-center gap-4 space-y-0 py-4">
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle2 className="h-6 w-6 text-[var(--primary)]" />
                    ) : (
                      <Circle className="h-6 w-6 text-[var(--border)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">
                      <span className="text-[var(--muted-foreground)] mr-2">
                        {index + 1}.
                      </span>
                      {lesson.title}
                    </CardTitle>
                  </div>
                  {isComplete && (
                    <span className="flex-shrink-0 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                      Done
                    </span>
                  )}
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
