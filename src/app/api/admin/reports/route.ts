import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
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

  const [
    totalOrgs,
    totalLearners,
    totalCompletions,
    totalAttempts,
    passedAttempts,
    recentActivity,
  ] = await Promise.all([
    db.organization.count(),
    db.membership.count({ where: { role: "LEARNER" } }),
    db.courseCompletion.count(),
    db.assessmentAttempt.count(),
    db.assessmentAttempt.count({ where: { passed: true } }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        actor: { select: { name: true, email: true } },
        org: { select: { name: true } },
      },
    }),
  ]);

  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  return NextResponse.json({
    totalOrgs,
    totalLearners,
    totalCompletions,
    passRate,
    recentActivity: recentActivity.map((log) => ({
      id: log.id,
      action: log.action,
      actorName: log.actor?.name ?? "System",
      orgName: log.org?.name ?? null,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
    })),
  });
}
