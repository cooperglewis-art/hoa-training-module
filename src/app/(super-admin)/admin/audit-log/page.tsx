import { db } from "@/lib/db";
import { AuditAction } from "@prisma/client";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ScrollText, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 25;

interface Props {
  searchParams: Promise<{ page?: string; action?: string }>;
}

export default async function AuditLogPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  const page = Math.max(1, parseInt(resolvedParams.page ?? "1", 10));
  const actionFilter = resolvedParams.action ?? undefined;

  const isValidAuditAction =
    actionFilter && Object.values(AuditAction).includes(actionFilter as AuditAction);
  const where = isValidAuditAction
    ? { action: actionFilter as AuditAction }
    : {};

  const [logs, totalCount, distinctActions] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        actor: { select: { name: true, email: true } },
        org: { select: { name: true } },
      },
    }),
    db.auditLog.count({ where }),
    db.auditLog.groupBy({ by: ["action"], orderBy: { action: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002060]">Audit Log</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Complete activity history across the platform ({totalCount} entries).
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/audit-log">
              <Badge
                variant={!actionFilter ? "default" : "outline"}
                className="cursor-pointer"
              >
                All
              </Badge>
            </Link>
            {distinctActions.map((a) => (
              <Link key={a.action} href={`/admin/audit-log?action=${a.action}`}>
                <Badge
                  variant={actionFilter === a.action ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {a.action.replace(/_/g, " ")}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#002060]">
            <ScrollText className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-[var(--muted-foreground)] py-8"
                  >
                    No audit log entries found.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{log.actor?.name ?? "System"}</p>
                      {log.actor?.email && (
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {log.actor.email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.org?.name ?? "--"}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--muted-foreground)] max-w-[200px] truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : "--"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                  {page > 1 ? (
                    <Link
                      href={`/admin/audit-log?page=${page - 1}${
                        actionFilter ? `&action=${actionFilter}` : ""
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Link>
                  ) : (
                    <span>
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  asChild={page < totalPages}
                >
                  {page < totalPages ? (
                    <Link
                      href={`/admin/audit-log?page=${page + 1}${
                        actionFilter ? `&action=${actionFilter}` : ""
                      }`}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
