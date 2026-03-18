import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";

export default async function SuperAdminLayout({
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

  if (!membership || membership.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return <AppShell role="SUPER_ADMIN">{children}</AppShell>;
}
