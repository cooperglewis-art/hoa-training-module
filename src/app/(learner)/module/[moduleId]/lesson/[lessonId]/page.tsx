import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getPublishedContent, getModuleWithLessons } from "@/lib/content";
import { db } from "@/lib/db";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { LessonNav } from "@/components/lesson/LessonNav";
import { ArrowLeft } from "lucide-react";
import type { OrgType } from "@/types/content";

interface LessonPageProps {
  params: Promise<{ moduleId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { moduleId, lessonId } = await params;

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [moduleData, content] = await Promise.all([
    getModuleWithLessons(moduleId),
    getPublishedContent(lessonId),
  ]);

  if (!moduleData) {
    notFound();
  }

  const lessonIndex = moduleData.lessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex === -1) {
    notFound();
  }

  const currentLesson = moduleData.lessons[lessonIndex];
  const prevLesson = lessonIndex > 0 ? moduleData.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < moduleData.lessons.length - 1
      ? moduleData.lessons[lessonIndex + 1]
      : null;

  // Get user's module progress
  const progress = await db.moduleProgress.findUnique({
    where: {
      userId_moduleId: { userId: session.id, moduleId },
    },
  });
  const completedLessons = new Set(progress?.completedLessons ?? []);
  const isCurrentComplete = completedLessons.has(lessonId);

  // Get user's org type for statute filtering
  const membership = await db.membership.findFirst({
    where: { userId: session.id },
    include: { org: true },
    orderBy: { joinedAt: "desc" },
  });
  const orgType: OrgType = (membership?.org.type as OrgType) ?? "HOA";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href={`/module/${moduleId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {moduleData.title}
      </Link>

      {/* Lesson header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--primary)]">
          Module {moduleData.sortOrder} — Lesson {lessonIndex + 1} of{" "}
          {moduleData.lessons.length}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[var(--foreground)]">
          {currentLesson.title}
        </h1>
      </div>

      {/* Content */}
      {content ? (
        <LessonRenderer blocks={content.blocks} orgType={orgType} />
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-8 text-center">
          <p className="text-[var(--muted-foreground)]">
            This lesson has no published content yet. Please check back later.
          </p>
        </div>
      )}

      {/* Navigation */}
      <LessonNav
        moduleId={moduleId}
        lessonId={lessonId}
        prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null}
        nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
        isCurrentComplete={isCurrentComplete}
      />
    </div>
  );
}
