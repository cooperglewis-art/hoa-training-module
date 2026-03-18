"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrganization } from "@/app/actions/admin";

interface OrgDetailFormProps {
  org: {
    id: string;
    name: string;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    logo: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    active: boolean;
  };
}

export function OrgDetailForm({ org }: OrgDetailFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(org.name);
  const [contactName, setContactName] = useState(org.contactName ?? "");
  const [contactEmail, setContactEmail] = useState(org.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(org.contactPhone ?? "");
  const [logo, setLogo] = useState(org.logo ?? "");
  const [active, setActive] = useState(org.active);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateOrganization(org.id, {
        name,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        logo: logo || undefined,
        active,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#002060]">Edit Organization</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-600 bg-emerald-50 p-2 rounded">
              Organization updated successfully.
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="orgName">Name</Label>
            <Input id="orgName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="orgContactName">Contact Name</Label>
            <Input
              id="orgContactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="orgContactEmail">Contact Email</Label>
            <Input
              id="orgContactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="orgContactPhone">Contact Phone</Label>
            <Input
              id="orgContactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="orgLogo">Logo URL</Label>
            <Input
              id="orgLogo"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="orgActive"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-[var(--input)]"
            />
            <Label htmlFor="orgActive">Active</Label>
          </div>
          <Button type="submit" disabled={loading} className="bg-[#737852] hover:bg-[#737852]/90">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
