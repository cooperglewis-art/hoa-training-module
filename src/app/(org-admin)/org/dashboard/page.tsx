import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Users, UserCheck, Clock, GraduationCap, TrendingUp } from "lucide-react";

export default async function OrgDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const membership = await db.membership.findFirst({
    where: { userId: session.id },
    orderBy: { joinedAt: "desc" },
    include: { org: true },
  });

  if (!membership || (membership.role !== "ORG_ADMIN" && membership.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const orgId = membership.orgId;

  const [totalModules, learnerMemberships, completions, attempts, passedAttempts] =
    await Promise.all([
      db.module.count(),
      db.membership.findMany({
        where: { orgId, role: "LEARNER" },
        include: {
          user: {
            include: {
              moduleProgress: true,
              assessmentAttempts: { orderBy: { createdAt: "desc" }, take: 1 },
              certificates: { take: 1 },
            },
          },
        },
      }),
      db.courseCompletion.count({
        where: {
          user: { memberships: { some: { orgId, role: "LEARNER" } } },
        },
      }),
      db.assessmentAttempt.count({
        where: {
          user: { memberships: { some: { orgId, role: "LEARNER" } } },
        },
      }),
      db.assessmentAttempt.count({
        where: {
          user: { memberships: { some: { orgId, role: "LEARNER" } } },
          passed: true,
        },
      }),
    ]);

  const totalLearners = learnerMemberships.length;
  const enrolledCount = totalLearners;
  const inProgressCount = learnerMemberships.filter(
    (m) =>
      m.user.moduleProgress.length > 0 &&
      m.user.moduleProgress.filter((mp) => mp.completedAt).length < totalModules
  ).length;
  const completedCount = learnerMemberships.filter(
    (m) =>
      totalModules > 0 &&
      m.user.moduleProgress.filter((mp) => mp.completedAt).length === totalModules
  ).length;
  const passRate = attempts > 0 ? Math.round((passedAttempts / attempts) * 100) : 0;

  // Recent completions
  const recentCompletions = learnerMemberships
    .filter((m) => m.user.certificates.length > 0)
    .sort((a, b) => {
      const aDate = a.user.certificates[0]?.issuedAt?.getTime() ?? 0;
      const bDate = b.user.certificates[0]?.issuedAt?.getTime() ?? 0;
      return bDate - aDate;
    })
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#002060]">{membership.org.name}</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Organization Dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Total Learners" value={totalLearners} icon={Users} />
        <StatsCard title="Enrolled" value={enrolledCount} icon={UserCheck} />
        <StatsCard title="In Progress" value={inProgressCount} icon={Clock} />
        <StatsCard title="Completed" value={completedCount} icon={GraduationCap} />
        <StatsCard title="Pass Rate" value={`${passRate}%`} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#002060]">Recent Completions</CardTitle>
        </CardHeader>
        <CardContent>
          {totalLearners === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-[var(--muted-foreground)]/40 mb-4" />
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No learners yet</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-sm mx-auto">
                Invite your team to start the CCR Enforcement Training. They will appear here once they register.
              </p>
              <a
                href="/org/invites"
                className="inline-flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <UserCheck className="h-4 w-4" />
                Send Invitations
              </a>
            </div>
          ) : recentCompletions.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] py-6 text-center">
              No completions yet. Learners are enrolled — completions will appear here as they finish the course.
            </p>
          ) : (
            <div className="space-y-3">
              {recentCompletions.map((m) => {
                const cert = m.user.certificates[0];
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-md border border-[var(--border)] p-3"
                  >
                    <div>
                      <p className="font-medium">{m.user.name}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{m.user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-emerald-600">Certified</Badge>
                      {cert && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {formatDate(cert.issuedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
