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

  // Only allow the certificate owner or org admins/super admins to download
  const membership = await db.membership.findFirst({
    where: { userId: session.id },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (certificate.userId !== session.id) {
    // Non-owners must be an admin, and must belong to the same org
    if (membership.role === "LEARNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Verify the certificate owner is in the same org as the requesting admin
    const certOwnerMembership = await db.membership.findFirst({
      where: { userId: certificate.userId, orgId: membership.orgId },
    });
    if (!certOwnerMembership && membership.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
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
