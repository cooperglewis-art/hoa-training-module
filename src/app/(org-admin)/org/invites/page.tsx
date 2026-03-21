import { db } from "@/lib/db";
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
import { formatDate } from "@/lib/utils";
import { Mail, Link as LinkIcon } from "lucide-react";
import { CreateInviteForm } from "./create-invite-form";
import { BulkInviteUpload } from "./bulk-invite-upload";
import { CopyLinkButton } from "./copy-link-button";

export default async function OrgInvitesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const membership = await db.membership.findFirst({
    where: { userId: session.id },
    orderBy: { joinedAt: "desc" },
    include: { org: true },
  });

  if (!membership || (membership.role !== "ORG_ADMIN" && membership.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const orgId = membership.orgId;

  const invites = await db.inviteToken.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002060]">Invitations</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          {membership.org.name} &middot; Invite learners and admins.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <CreateInviteForm orgId={orgId} />
          <BulkInviteUpload orgId={orgId} />
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#002060]">
                <Mail className="h-5 w-5" />
                Invite History ({invites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email / Type</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-[var(--muted-foreground)] py-8"
                      >
                        No invites yet. Create one above.
                      </TableCell>
                    </TableRow>
                  )}
                  {invites.map((invite) => {
                    const isExpired = new Date(invite.expiresAt) < new Date();
                    const isUsed = !!invite.usedAt;
                    const status = isUsed
                      ? "accepted"
                      : isExpired
                        ? "expired"
                        : "pending";
                    const inviteUrl = `${appUrl}/invite/${invite.token}`;

                    return (
                      <TableRow key={invite.id}>
                        <TableCell>
                          {invite.email ? (
                            <span className="text-sm">{invite.email}</span>
                          ) : (
                            <span className="text-sm flex items-center gap-1 text-[var(--muted-foreground)]">
                              <LinkIcon className="h-3 w-3" />
                              Open invite
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {invite.role.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "accepted"
                                ? "default"
                                : status === "expired"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              status === "accepted"
                                ? "bg-emerald-600"
                                : ""
                            }
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(invite.expiresAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {status === "pending" && (
                            <CopyLinkButton url={inviteUrl} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
