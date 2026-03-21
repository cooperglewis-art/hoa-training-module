import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import { Download, ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/certificate/print-button";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { certId } = await params;

  const certificate = await db.certificate.findUnique({
    where: { id: certId },
  });

  if (!certificate) {
    redirect("/assessment");
  }

  // Only allow owner or admins
  const membership = await db.membership.findFirst({
    where: { userId: session.id },
    orderBy: { joinedAt: "desc" },
  });

  if (certificate.userId !== session.id) {
    if (!membership || membership.role === "LEARNER") {
      redirect("/assessment");
    }

    if (membership.role !== "SUPER_ADMIN") {
      const certOwnerMembership = await db.membership.findFirst({
        where: {
          userId: certificate.userId,
          orgId: membership.orgId,
        },
      });

      if (!certOwnerMembership) {
        redirect("/assessment");
      }
    }
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-print, #certificate-print * { visibility: visible; }
          #certificate-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Button asChild variant="ghost" size="sm">
            <Link href="/assessment">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessment
            </Link>
          </Button>
        </div>

        <div className="mb-8 text-center print:hidden">
          <h1 className="font-serif text-2xl font-bold text-[#002060]">
            Your Certificate
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Issued on {formatDate(certificate.issuedAt)} &middot; Serial #{certificate.serialNumber}
          </p>
        </div>

        <div id="certificate-print">
          <CertificatePreview
            userName={certificate.userName}
            orgName={certificate.orgName}
            serialNumber={certificate.serialNumber}
            issuedAt={certificate.issuedAt}
          />
        </div>

        <div className="mt-8 flex justify-center gap-3 print:hidden">
          <Button asChild size="lg" className="bg-[#002060] hover:bg-[#002060]/90">
            <a href={`/api/certificate/${certId}/download`}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
          <PrintButton />
        </div>
      </div>
    </>
  );
}
