import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/admin/stats-card";
import { LearnerTable } from "@/components/admin/learner-table";
import { ORG_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Users, GraduationCap, TrendingUp, Clock } from "lucide-react";
import { OrgDetailForm } from "./org-detail-form";

interface Props {
  params: Promise<{ orgId: string }>;
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { orgId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const org = await db.organization.findUnique({
    where: { id: orgId },
    include: {
      memberships: {
        include: {
          user: {
            include: {
              moduleProgress: true,
              assessmentAttempts: { orderBy: { createdAt: "desc" }, take: 1 },
              certificates: { take: 1 },
            },
          },
        },
      },
    },
  });

  if (!org) notFound();

  const totalModules = await db.module.count();
  const learnerMemberships = org.memberships.filter((m) => m.role === "LEARNER");

  const learnerCount = learnerMemberships.length;
  const completedCount = learnerMemberships.filter((m) =>
    m.user.moduleProgress.filter((mp) => mp.completedAt).length === totalModules &&
    totalModules > 0
  ).length;
  const inProgressCount = learnerMemberships.filter((m) =>
    m.user.moduleProgress.some((mp) => mp.completedAt) &&
    m.user.moduleProgress.filter((mp) => mp.completedAt).length < totalModules
  ).length;
  const passedCount = learnerMemberships.filter((m) =>
    m.user.assessmentAttempts.some((a) => a.passed)
  ).length;
  const passRate = learnerCount > 0 ? Math.round((passedCount / learnerCount) * 100) : 0;

  const learnerRows = learnerMemberships.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    joinedAt: m.joinedAt,
    modulesCompleted: m.user.moduleProgress.filter((mp) => mp.completedAt).length,
    totalModules,
    assessmentStatus: m.user.assessmentAttempts[0]?.passed
      ? ("passed" as const)
      : m.user.assessmentAttempts.length > 0
        ? ("attempted" as const)
        : ("not_started" as const),
    certificateId: m.user.certificates[0]?.id ?? null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#002060]">{org.name}</h1>
          <Badge variant={org.active ? "default" : "secondary"}>
            {org.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-[var(--muted-foreground)] mt-1">
          {ORG_TYPES[org.type]} &middot; /{org.slug} &middot; Created{" "}
          {formatDate(org.createdAt)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Learners" value={learnerCount} icon={Users} />
        <StatsCard title="In Progress" value={inProgressCount} icon={Clock} />
        <StatsCard title="Completed" value={completedCount} icon={GraduationCap} />
        <StatsCard title="Pass Rate" value={`${passRate}%`} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <OrgDetailForm
          org={{
            id: org.id,
            name: org.name,
            contactName: org.contactName,
            contactEmail: org.contactEmail,
            contactPhone: org.contactPhone,
            logo: org.logo,
            primaryColor: org.primaryColor,
            secondaryColor: org.secondaryColor,
            active: org.active,
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-[#002060]">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {org.memberships.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md border border-[var(--border)] p-3"
                >
                  <div>
                    <p className="font-medium">{m.user.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{m.user.email}</p>
                  </div>
                  <Badge variant={m.role === "ORG_ADMIN" ? "default" : "outline"}>
                    {m.role.replace("_", " ")}
                  </Badge>
                </div>
              ))}
              {org.memberships.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">No members yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#002060]">Learners</CardTitle>
        </CardHeader>
        <CardContent>
          <LearnerTable learners={learnerRows} />
        </CardContent>
      </Card>
    </div>
  );
}
