import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgTable } from "@/components/admin/org-table";
import { AddOrganizationDialog } from "./add-org-dialog";

export default async function OrganizationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizations = await db.organization.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { memberships: { where: { role: "LEARNER" } } },
      },
    },
  });

  // Calculate completion rates
  const orgsWithRates = await Promise.all(
    organizations.map(async (org) => {
      const learnerCount = org._count.memberships;
      if (learnerCount === 0) {
        return { ...org, completionRate: undefined };
      }
      const completions = await db.courseCompletion.count({
        where: {
          user: {
            memberships: { some: { orgId: org.id, role: "LEARNER" } },
          },
        },
      });
      return {
        ...org,
        completionRate: Math.round((completions / learnerCount) * 100),
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#002060]">Organizations</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Manage all organizations on the platform.
          </p>
        </div>
        <AddOrganizationDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#002060]">
            All Organizations ({organizations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrgTable organizations={orgsWithRates} />
        </CardContent>
      </Card>
    </div>
  );
}
