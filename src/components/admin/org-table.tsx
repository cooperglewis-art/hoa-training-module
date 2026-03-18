"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORG_TYPES } from "@/lib/constants";
import { Settings, ExternalLink } from "lucide-react";

interface OrgRow {
  id: string;
  name: string;
  type: keyof typeof ORG_TYPES;
  slug: string;
  active: boolean;
  _count: {
    memberships: number;
  };
  completionRate?: number;
}

interface OrgTableProps {
  organizations: OrgRow[];
}

export function OrgTable({ organizations }: OrgTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead className="text-right">Learners</TableHead>
          <TableHead className="text-right">Completion Rate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizations.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-[var(--muted-foreground)] py-8">
              No organizations found.
            </TableCell>
          </TableRow>
        )}
        {organizations.map((org) => (
          <TableRow key={org.id}>
            <TableCell className="font-medium">{org.name}</TableCell>
            <TableCell>{ORG_TYPES[org.type]}</TableCell>
            <TableCell className="font-mono text-sm">{org.slug}</TableCell>
            <TableCell className="text-right">{org._count.memberships}</TableCell>
            <TableCell className="text-right">
              {org.completionRate !== undefined ? `${org.completionRate}%` : "--"}
            </TableCell>
            <TableCell>
              <Badge variant={org.active ? "default" : "secondary"}>
                {org.active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/organizations/${org.id}`}>
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Manage {org.name}</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/enroll/${org.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Enrollment page</span>
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
