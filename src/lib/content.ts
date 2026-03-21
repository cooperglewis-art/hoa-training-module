import { db } from "./db";
import type { ContentBlock } from "@/types/content";

const WORDS_PER_MINUTE = 200;

function countBlockWords(block: ContentBlock): number {
  switch (block.type) {
    case "heading":
      return block.text.split(/\s+/).length;
    case "prose":
      return block.html.replace(/<[^>]*>/g, "").split(/\s+/).length;
    case "callout":
      return (block.title + " " + block.body).split(/\s+/).length;
    case "statute-callout":
      return (block.statute + " " + block.summary).split(/\s+/).length;
    case "scenario":
      return (block.title + " " + block.situation + " " + block.revealText).split(/\s+/).length;
    case "knowledge-check":
      return (block.question + " " + block.options.join(" ") + " " + block.explanation).split(/\s+/).length;
    case "checkpoint":
      return (block.question + " " + block.options.join(" ")).split(/\s+/).length;
    case "comparison-table":
      return (block.headers.join(" ") + " " + block.rows.flat().join(" ")).split(/\s+/).length;
    case "timeline":
      return block.steps.reduce((sum, s) => sum + (s.title + " " + s.description).split(/\s+/).length, 0);
    case "accordion":
      return block.items.reduce((sum, item) => sum + (item.title + " " + item.content).split(/\s+/).length, 0);
    case "drag-drop-match":
      return block.pairs.reduce((sum, p) => sum + (p.left + " " + p.right).split(/\s+/).length, 0);
    default:
      return 0;
  }
}

export function estimateReadingTime(blocks: ContentBlock[]): number {
  const totalWords = blocks.reduce((sum, block) => sum + countBlockWords(block), 0);
  return Math.max(1, Math.ceil(totalWords / WORDS_PER_MINUTE));
}

export async function getPublishedContent(lessonId: string): Promise<ContentBlock[] | null> {
  const version = await db.lessonContentVersion.findFirst({
    where: {
      lessonId,
      publishedAt: { not: null },
    },
    orderBy: { version: "desc" },
  });

  if (!version) return null;

  // Normalize: content may be stored as plain array or { blocks: [...] }
  const raw = version.content as unknown;
  if (Array.isArray(raw)) return raw as ContentBlock[];
  if (raw && typeof raw === "object" && "blocks" in raw) {
    return (raw as { blocks: ContentBlock[] }).blocks;
  }
  return null;
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
