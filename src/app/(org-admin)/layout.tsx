import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";

export default async function OrgAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await db.membership.findFirst({
    where: { userId: session.user.id },
    orderBy: { joinedAt: "desc" },
  });

  if (!membership || membership.role !== "ORG_ADMIN") {
    redirect("/dashboard");
  }

  return <AppShell role="ORG_ADMIN">{children}</AppShell>;
}
