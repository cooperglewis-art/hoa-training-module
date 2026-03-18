import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import { Download, ArrowLeft } from "lucide-react";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { certId } = await params;

  const certificate = await db.certificate.findUnique({
    where: { id: certId },
  });

  if (!certificate) {
    redirect("/assessment");
  }

  // Only allow owner or admins
  const membership = await db.membership.findFirst({
    where: { userId: session.user.id },
  });

  if (
    certificate.userId !== session.user.id &&
    membership?.role === "LEARNER"
  ) {
    redirect("/assessment");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/assessment">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Link>
        </Button>
      </div>

      <div className="mb-8 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#002060]">
          Your Certificate
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Issued on {formatDate(certificate.issuedAt)} &middot; Serial #{certificate.serialNumber}
        </p>
      </div>

      <CertificatePreview
        userName={certificate.userName}
        orgName={certificate.orgName}
        serialNumber={certificate.serialNumber}
        issuedAt={certificate.issuedAt}
      />

      <div className="mt-8 flex justify-center">
        <Button asChild size="lg" className="bg-[#002060] hover:bg-[#002060]/90">
          <a href={`/api/certificate/${certId}/download`}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </a>
        </Button>
      </div>
    </div>
  );
}
