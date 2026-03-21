"use client";

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
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { Download } from "lucide-react";

interface LearnerRow {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  modulesCompleted: number;
  totalModules: number;
  assessmentStatus: "not_started" | "attempted" | "passed";
  certificateId?: string | null;
}

interface LearnerTableProps {
  learners: LearnerRow[];
  onExportCSV?: () => void;
}

export function LearnerTable({ learners, onExportCSV }: LearnerTableProps) {
  const assessmentBadge = (status: LearnerRow["assessmentStatus"]) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-emerald-600">Passed</Badge>;
      case "attempted":
        return <Badge variant="secondary">Attempted</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div>
      {onExportCSV && (
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={onExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Assessment</TableHead>
            <TableHead>Certificate</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {learners.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <p className="text-[var(--muted-foreground)] mb-2">No learners have enrolled yet.</p>
                <a
                  href="/org/invites"
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  Send invitations to get started
                </a>
              </TableCell>
            </TableRow>
          )}
          {learners.map((learner) => {
            const progressPct =
              learner.totalModules > 0
                ? Math.round((learner.modulesCompleted / learner.totalModules) * 100)
                : 0;
            return (
              <TableRow key={learner.id}>
                <TableCell className="font-medium">{learner.name}</TableCell>
                <TableCell>{learner.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress value={progressPct} className="h-2 flex-1" />
                    <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                      {learner.modulesCompleted}/{learner.totalModules}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{assessmentBadge(learner.assessmentStatus)}</TableCell>
                <TableCell>
                  {learner.certificateId ? (
                    <Button variant="link" size="sm" asChild>
                      <a href={`/api/certificate/${learner.certificateId}/download`}>
                        Download
                      </a>
                    </Button>
                  ) : (
                    <span className="text-sm text-[var(--muted-foreground)]">--</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-[var(--muted-foreground)]">
                  {formatDate(new Date(learner.joinedAt))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
