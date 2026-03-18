import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, GraduationCap, TrendingUp, BarChart3 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function SuperAdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [totalOrgs, totalLearners, totalCompletions, totalAttempts, passedAttempts, recentLogs] =
    await Promise.all([
      db.organization.count(),
      db.membership.count({ where: { role: "LEARNER" } }),
      db.courseCompletion.count(),
      db.assessmentAttempt.count(),
      db.assessmentAttempt.count({ where: { passed: true } }),
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        include: {
          actor: { select: { name: true } },
          org: { select: { name: true } },
        },
      }),
    ]);

  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#002060]">Super Admin Dashboard</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Overview of the entire training platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Organizations" value={totalOrgs} icon={Building2} />
        <StatsCard title="Total Learners" value={totalLearners} icon={Users} />
        <StatsCard title="Completions" value={totalCompletions} icon={GraduationCap} />
        <StatsCard title="Pass Rate" value={`${passRate}%`} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#002060]">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/30">
              <p className="text-[var(--muted-foreground)] text-sm">
                Chart area -- integrate analytics library here
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#002060]">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentLogs.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">No recent activity.</p>
              )}
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-[var(--border)] p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                      {log.org && (
                        <span className="text-xs text-[var(--muted-foreground)] truncate">
                          {log.org.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1">
                      {log.actor?.name ?? "System"}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
