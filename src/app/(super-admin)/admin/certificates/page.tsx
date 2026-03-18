import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Award, Download } from "lucide-react";

export default async function CertificatesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const certificates = await db.certificate.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002060]">Certificates</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          All issued certificates of completion ({certificates.length} total).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#002060]">
            <Award className="h-5 w-5" />
            Issued Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Learner Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-[var(--muted-foreground)] py-8"
                  >
                    No certificates issued yet.
                  </TableCell>
                </TableRow>
              )}
              {certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-mono text-sm">{cert.serialNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cert.userName}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {cert.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{cert.orgName}</TableCell>
                  <TableCell>{formatDate(cert.issuedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/api/certificate/${cert.id}/download`}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
