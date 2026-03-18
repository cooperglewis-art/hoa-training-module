import { db } from "./db";
import type { ContentBlock, LessonContent } from "@/types/content";

export async function getPublishedContent(lessonId: string): Promise<LessonContent | null> {
  const version = await db.lessonContentVersion.findFirst({
    where: {
      lessonId,
      publishedAt: { not: null },
    },
    orderBy: { version: "desc" },
  });

  if (!version) return null;
  return version.content as unknown as LessonContent;
}

export async function getCourseWithModules() {
  return db.course.findFirst({
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });
}

export async function getModuleWithLessons(moduleId: string) {
  return db.module.findUnique({
    where: { id: moduleId },
    include: {
      lessons: {
        orderBy: { sortOrder: "asc" },
      },
      course: true,
    },
  });
}

export async function getUserProgress(userId: string) {
  const course = await getCourseWithModules();
  if (!course) return null;

  const progress = await db.moduleProgress.findMany({
    where: { userId },
  });

  const attempts = await db.assessmentAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const certificate = await db.certificate.findFirst({
    where: { userId },
  });

  const modules = course.modules.map((mod) => {
    const mp = progress.find((p) => p.moduleId === mod.id);
    return {
      ...mod,
      completedLessons: mp?.completedLessons || [],
      checkpointsPassed: mp?.checkpointsPassed || 0,
      completedAt: mp?.completedAt || null,
      totalLessons: mod.lessons.length,
    };
  });

  const allModulesComplete = modules.every((m) => m.completedAt !== null);

  return {
    course,
    modules,
    allModulesComplete,
    attempts,
    certificate,
    bestScore: attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0,
    passed: attempts.some((a) => a.passed),
  };
}
