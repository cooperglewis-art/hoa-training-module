"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrganization } from "@/app/actions/admin";
import { Settings } from "lucide-react";

interface OrgData {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  logo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

export default function OrgSettingsPage() {
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [logo, setLogo] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#737852");
  const [secondaryColor, setSecondaryColor] = useState("#002060");

  useEffect(() => {
    async function fetchOrg() {
      try {
        const res = await fetch("/api/admin/org-settings");
        if (!res.ok) {
          setError("Failed to load organization settings.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setOrg(data);
        setName(data.name);
        setContactName(data.contactName ?? "");
        setContactEmail(data.contactEmail ?? "");
        setContactPhone(data.contactPhone ?? "");
        setLogo(data.logo ?? "");
        setPrimaryColor(data.primaryColor ?? "#737852");
        setSecondaryColor(data.secondaryColor ?? "#002060");
      } catch {
        setError("Failed to load organization settings.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrg();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateOrganization(org.id, {
        name,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        logo: logo || undefined,
        primaryColor: primaryColor || undefined,
        secondaryColor: secondaryColor || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--muted-foreground)]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002060]">Organization Settings</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Manage your organization&apos;s profile and branding.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#002060]">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
            {success && (
              <p className="text-sm text-emerald-600 bg-emerald-50 p-2 rounded">
                Settings saved successfully.
              </p>
            )}

            <div className="grid gap-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="settingsContactName">Contact Name</Label>
              <Input
                id="settingsContactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="settingsContactEmail">Contact Email</Label>
              <Input
                id="settingsContactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="settingsContactPhone">Contact Phone</Label>
              <Input
                id="settingsContactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="settingsLogo">Logo URL</Label>
              <Input
                id="settingsLogo"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="settingsPrimary">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="settingsPrimary"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-12 rounded border border-[var(--input)] cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="settingsSecondary">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="settingsSecondary"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-9 w-12 rounded border border-[var(--input)] cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-[#737852] hover:bg-[#737852]/90"
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
