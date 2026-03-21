"use server";

import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ContentBlock } from "@/types/content";

async function getSessionUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.id) {
    throw new Error("Unauthorized");
  }
  return session.id;
}

function extractRequiredGateKeys(lessonId: string, content: ContentBlock[]): string[] {
  return content.flatMap((block, index) => {
    const requiresGate =
      (block.type === "knowledge-check" || block.type === "checkpoint") &&
      !!block.gateNext;
    if (!requiresGate) {
      return [];
    }
    return [`${lessonId}:${index}`];
  });
}

async function getRequiredGateKeysForLesson(lessonId: string): Promise<string[]> {
  const version = await db.lessonContentVersion.findFirst({
    where: {
      lessonId,
      publishedAt: { not: null },
    },
    orderBy: { version: "desc" },
    select: { content: true },
  });

  if (!version) {
    return [];
  }

  const raw = version.content as unknown;
  const content =
    Array.isArray(raw)
      ? (raw as ContentBlock[])
      : raw && typeof raw === "object" && "blocks" in raw
        ? ((raw as { blocks: ContentBlock[] }).blocks ?? [])
        : [];

  return extractRequiredGateKeys(lessonId, content);
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
  const requiredGateKeys = await getRequiredGateKeysForLesson(lessonId);
  const existingProgress = await db.moduleProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
    select: { passedGateKeys: true },
  });

  const passedGateKeys = new Set(existingProgress?.passedGateKeys ?? []);
  const missingGateKeys = requiredGateKeys.filter((key) => !passedGateKeys.has(key));
  if (missingGateKeys.length > 0) {
    throw new Error("Complete all required lesson checks before continuing.");
  }

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

export async function recordGateCheckPassed(lessonId: string, gateKey: string) {
  const userId = await getSessionUserId();
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { moduleId: true },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const requiredGateKeys = await getRequiredGateKeysForLesson(lessonId);
  if (!requiredGateKeys.includes(gateKey)) {
    throw new Error("Invalid gate check.");
  }

  const progress = await db.moduleProgress.upsert({
    where: {
      userId_moduleId: { userId, moduleId: lesson.moduleId },
    },
    create: {
      userId,
      moduleId: lesson.moduleId,
      passedGateKeys: [gateKey],
    },
    update: {
      passedGateKeys: {
        push: gateKey,
      },
    },
  });

  const uniqueGateKeys = [...new Set(progress.passedGateKeys)];
  if (uniqueGateKeys.length !== progress.passedGateKeys.length) {
    await db.moduleProgress.update({
      where: { id: progress.id },
      data: { passedGateKeys: uniqueGateKeys },
    });
  }

  revalidatePath(`/module/${lesson.moduleId}/lesson/${lessonId}`);
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
