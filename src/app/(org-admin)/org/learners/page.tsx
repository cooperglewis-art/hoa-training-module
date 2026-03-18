import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearnerTable } from "@/components/admin/learner-table";
import { ExportCSVButton } from "./export-csv-button";
import { Users } from "lucide-react";

export default async function OrgLearnersPage() {
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
  const totalModules = await db.module.count();

  const learnerMemberships = await db.membership.findMany({
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
    orderBy: { joinedAt: "desc" },
  });

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#002060]">Learners</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            {membership.org.name} &middot; {learnerRows.length} learner
            {learnerRows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ExportCSVButton orgId={orgId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#002060]">
            <Users className="h-5 w-5" />
            All Learners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LearnerTable learners={learnerRows} />
        </CardContent>
      </Card>
    </div>
  );
}
