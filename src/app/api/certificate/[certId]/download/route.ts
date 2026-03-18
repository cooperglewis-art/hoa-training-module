import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { generateCertificatePdf } from "@/lib/certificate";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { certId } = await params;

  const certificate = await db.certificate.findUnique({
    where: { id: certId },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  // Only allow the certificate owner or admins to download
  const membership = await db.membership.findFirst({
    where: { userId: session.id },
  });

  if (certificate.userId !== session.id && membership?.role === "LEARNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pdfBytes = await generateCertificatePdf({
    userName: certificate.userName,
    orgName: certificate.orgName,
    serialNumber: certificate.serialNumber,
    issuedAt: certificate.issuedAt,
  });

  // Log download
  await db.auditLog.create({
    data: {
      action: "CERTIFICATE_DOWNLOADED",
      actorId: session.id,
      metadata: { certificateId: certId },
    },
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CCR-Certificate-${certificate.serialNumber}.pdf"`,
    },
  });
}
