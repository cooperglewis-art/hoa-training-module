"use server";

import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function getSessionUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.id) {
    throw new Error("Unauthorized");
  }
  return session.id;
}

export async function markLessonComplete(lessonId: string) {
  const userId = await getSessionUserId();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          lessons: { select: { id: true } },
        },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const moduleId = lesson.moduleId;
  const allLessonIds = lesson.module.lessons.map((l) => l.id);

  const progress = await db.moduleProgress.upsert({
    where: {
      userId_moduleId: { userId, moduleId },
    },
    create: {
      userId,
      moduleId,
      completedLessons: [lessonId],
    },
    update: {
      completedLessons: {
        push: lessonId,
      },
    },
  });

  // Deduplicate in case of double-submit
  const unique = [...new Set(progress.completedLessons)];
  if (unique.length !== progress.completedLessons.length) {
    await db.moduleProgress.update({
      where: { id: progress.id },
      data: { completedLessons: unique },
    });
  }

  // Check if all lessons in module are now complete
  const allDone = allLessonIds.every((id) => unique.includes(id));
  if (allDone && !progress.completedAt) {
    await db.moduleProgress.update({
      where: { id: progress.id },
      data: { completedAt: new Date() },
    });

    await db.auditLog.create({
      data: {
        action: "MODULE_COMPLETED",
        actorId: userId,
        metadata: { moduleId, moduleTitle: lesson.module.title },
      },
    });
  }

  await db.auditLog.create({
    data: {
      action: "LESSON_COMPLETED",
      actorId: userId,
      metadata: { lessonId, lessonTitle: lesson.title, moduleId },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/module/${moduleId}`);
  revalidatePath(`/module/${moduleId}/lesson/${lessonId}`);
}

export async function passCheckpoint(moduleId: string) {
  const userId = await getSessionUserId();

  await db.moduleProgress.upsert({
    where: {
      userId_moduleId: { userId, moduleId },
    },
    create: {
      userId,
      moduleId,
      checkpointsPassed: 1,
    },
    update: {
      checkpointsPassed: { increment: 1 },
    },
  });

  revalidatePath(`/module/${moduleId}`);
}

export async function acknowledgeDisclaimer() {
  const userId = await getSessionUserId();

  await db.user.update({
    where: { id: userId },
    data: { disclaimerAcknowledgedAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      action: "DISCLAIMER_ACKNOWLEDGED",
      actorId: userId,
    },
  });

  revalidatePath("/disclaimer");
  revalidatePath("/dashboard");
}
