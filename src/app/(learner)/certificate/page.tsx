import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export default async function CertificateIndexPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const certificate = await db.certificate.findFirst({
    where: { userId: session.id },
    orderBy: { issuedAt: "desc" },
  });

  if (certificate) {
    redirect(`/certificate/${certificate.id}`);
  }

  redirect("/assessment");
}
