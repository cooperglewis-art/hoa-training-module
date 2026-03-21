"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createInvite } from "@/app/actions/admin";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText } from "lucide-react";

interface BulkInviteUploadProps {
  orgId: string;
}

export function BulkInviteUpload({ orgId }: BulkInviteUploadProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ total: number; success: number; failed: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResults(null);

    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.toLowerCase().startsWith("email"));

      const emails = lines
        .map((line) => line.split(",")[0]?.trim())
        .filter((email) => email && email.includes("@"));

      if (emails.length === 0) {
        toast({
          title: "No valid emails found",
          description: "CSV should have one email per line or an 'email' column.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      let success = 0;
      const failed: string[] = [];

      for (const email of emails) {
        try {
          await createInvite({ email, role: "LEARNER", orgId });
          success++;
        } catch {
          failed.push(email);
        }
      }

      setResults({ total: emails.length, success, failed });
      toast({
        title: "Bulk invite complete",
        description: `${success} of ${emails.length} invites created.`,
      });
    } catch {
      toast({
        title: "Upload failed",
        description: "Could not read the CSV file.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#002060] text-base">
          <Upload className="h-4 w-4" />
          Bulk Invite (CSV)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-[var(--muted-foreground)]">
          Upload a CSV file with one email per line to invite multiple learners at once.
        </p>

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleUpload}
            className="hidden"
            id="csv-upload"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            {loading ? "Processing..." : "Choose CSV File"}
          </Button>
        </div>

        {results && (
          <div className="text-sm space-y-1">
            <p className="text-emerald-600">
              {results.success} invite{results.success !== 1 ? "s" : ""} created successfully.
            </p>
            {results.failed.length > 0 && (
              <p className="text-red-600">
                Failed: {results.failed.join(", ")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
