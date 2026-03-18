"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DISCLAIMER_TEXT, APP_NAME } from "@/lib/constants";
import { acknowledgeDisclaimer } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function DisclaimerPage() {
  const [accepted, setAccepted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await acknowledgeDisclaimer();
        // Refresh the JWT so middleware sees disclaimerAcknowledged = true
        await fetch("/api/auth/refresh-session", { method: "POST" });
        window.location.href = "/dashboard";
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{APP_NAME} — Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-h-[50vh] overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--muted)] p-4 text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-line">
            {DISCLAIMER_TEXT}
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
            />
            <span className="text-sm text-[var(--foreground)]">
              I have read and understand the above disclaimer
            </span>
          </label>

          {error && (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={!accepted || isPending}
            className="w-full"
          >
            {isPending ? "Submitting..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
