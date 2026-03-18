import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db.membership.findFirst({
    where: { userId: session.id },
    orderBy: { joinedAt: "desc" },
  });

  if (!membership || membership.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      contentVersions: {
        orderBy: { version: "desc" },
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: lesson.id,
    title: lesson.title,
    slug: lesson.slug,
    versions: lesson.contentVersions.map((v) => ({
      id: v.id,
      version: v.version,
      content: v.content,
      publishedAt: v.publishedAt?.toISOString() ?? null,
      changelog: v.changelog,
      createdAt: v.createdAt.toISOString(),
    })),
  });
}
