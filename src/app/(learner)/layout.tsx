import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const role = headersList.get("x-user-role");

  if (!userId) {
    redirect("/login");
  }

  // Redirect admins to their dashboards
  if (role === "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }
  if (role === "ORG_ADMIN") {
    redirect("/org/dashboard");
  }

  return <AppShell role="LEARNER">{children}</AppShell>;
}
