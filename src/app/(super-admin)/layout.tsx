import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";

export default async function SuperAdminLayout({
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

  if (role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return <AppShell role="SUPER_ADMIN">{children}</AppShell>;
}
