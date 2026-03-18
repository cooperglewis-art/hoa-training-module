import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";

export default async function OrgAdminLayout({
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

  if (role !== "ORG_ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return <AppShell role="ORG_ADMIN">{children}</AppShell>;
}
