import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.id;

  // Get the course
  const course = await db.course.findFirst({
    include: {
      modules: {
        include: {
          lessons: { select: { id: true } },
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course not found" },
      { status: 404 }
    );
  }

  // Check all modules are complete
  const moduleProgress = await db.moduleProgress.findMany({
    where: { userId },
  });

  const allModulesComplete = course.modules.every((mod) => {
    const mp = moduleProgress.find((p) => p.moduleId === mod.id);
    return mp?.completedAt !== null && mp?.completedAt !== undefined;
  });

  if (!allModulesComplete) {
    return NextResponse.json(
      { error: "All training modules must be completed before taking the assessment" },
      { status: 403 }
    );
  }

  // Get questions with answer options (excluding isCorrect)
  const questions = await db.question.findMany({
    where: { courseId: course.id },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      stem: true,
      scenario: true,
      answerOptions: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          text: true,
          // Note: isCorrect is intentionally NOT included
        },
      },
    },
  });

  // Build the shared case study scenario from the first question's scenario
  // or combine all unique scenarios
  const scenarios = questions
    .map((q) => q.scenario)
    .filter((s) => s && s.trim().length > 0);
  const scenario =
    scenarios.length > 0
      ? scenarios[0]
      : "A homeowners association (HOA) board in Texas has received multiple complaints about a homeowner who is in persistent violation of several community covenants, conditions, and restrictions (CCRs). The violations include unauthorized exterior modifications, failure to maintain landscaping, and operating a short-term rental in violation of the governing documents. The board must decide how to proceed with enforcement while following proper legal procedures and respecting homeowner rights under Texas Property Code.";

  return NextResponse.json({
    scenario,
    questions: shuffle(questions).map((q) => ({
      id: q.id,
      stem: q.stem,
      answerOptions: shuffle(q.answerOptions),
    })),
  });
}
