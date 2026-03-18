"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvite } from "@/app/actions/admin";
import { UserPlus } from "lucide-react";

interface CreateInviteFormProps {
  orgId: string;
}

export function CreateInviteForm({ orgId }: CreateInviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"LEARNER" | "ORG_ADMIN">("LEARNER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const invite = await createInvite({
        email: email || undefined,
        role,
        orgId,
      });
      setSuccess(
        email
          ? `Invite sent to ${email}`
          : `Open invite link created. Share the link with your learners.`
      );
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#002060]">
          <UserPlus className="h-5 w-5" />
          Create Invite
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-600 bg-emerald-50 p-2 rounded">{success}</p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="inviteEmail">
              Email <span className="text-[var(--muted-foreground)]">(optional for open invite)</span>
            </Label>
            <Input
              id="inviteEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="learner@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="inviteRole">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "LEARNER" | "ORG_ADMIN")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEARNER">Learner</SelectItem>
                <SelectItem value="ORG_ADMIN">Org Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#737852] hover:bg-[#737852]/90"
          >
            {loading ? "Creating..." : email ? "Send Invite" : "Create Open Invite"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
