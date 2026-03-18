"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateContent, publishContent } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import { Save, Globe, History, Eye } from "lucide-react";
import { useParams } from "next/navigation";

interface ContentVersion {
  id: string;
  version: number;
  content: unknown;
  publishedAt: string | null;
  changelog: string | null;
  createdAt: string;
}

interface LessonData {
  id: string;
  title: string;
  slug: string;
  versions: ContentVersion[];
}

export default function ContentEditorPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [contentJson, setContentJson] = useState("");
  const [changelog, setChangelog] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<unknown>(null);

  const fetchLesson = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/content/${lessonId}`);
      if (!res.ok) {
        // Fallback: fetch directly via a simpler mechanism
        setError("Failed to load lesson data. Ensure the lesson exists.");
        return;
      }
      const data = await res.json();
      setLesson(data);
      if (data.versions.length > 0) {
        setContentJson(JSON.stringify(data.versions[0].content, null, 2));
      }
    } catch {
      setError("Failed to load lesson data.");
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  useEffect(() => {
    try {
      if (contentJson.trim()) {
        setParsedPreview(JSON.parse(contentJson));
      } else {
        setParsedPreview(null);
      }
    } catch {
      setParsedPreview(null);
    }
  }, [contentJson]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const parsed = JSON.parse(contentJson);
      await updateContent(lessonId, parsed, changelog || undefined);
      setSuccess("Content saved as new version.");
      setChangelog("");
      await fetchLesson();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON. Please fix the syntax and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to save content.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (versionId: string) => {
    setPublishing(true);
    setError(null);
    setSuccess(null);

    try {
      await publishContent(lessonId, versionId);
      setSuccess("Version published successfully.");
      await fetchLesson();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish.");
    } finally {
      setPublishing(false);
    }
  };

  const renderPreview = (data: unknown): React.ReactNode => {
    if (data === null || data === undefined) return null;
    if (typeof data === "string") return <p>{data}</p>;
    if (typeof data === "number" || typeof data === "boolean") return <p>{String(data)}</p>;
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {data.map((item, i) => (
            <li key={i}>{renderPreview(item)}</li>
          ))}
        </ul>
      );
    }
    if (typeof data === "object") {
      const obj = data as Record<string, unknown>;
      return (
        <div className="space-y-2">
          {Object.entries(obj).map(([key, value]) => (
            <div key={key}>
              <span className="font-semibold text-[#002060]">{key}: </span>
              {typeof value === "string" || typeof value === "number" ? (
                <span>{String(value)}</span>
              ) : (
                <div className="ml-4">{renderPreview(value)}</div>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!lesson && !error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--muted-foreground)]">Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002060]">
          {lesson?.title ?? "Content Editor"}
        </h1>
        {lesson && (
          <p className="text-[var(--muted-foreground)] mt-1">
            Lesson slug: {lesson.slug} &middot;{" "}
            {lesson.versions.length} version{lesson.versions.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}
      {success && <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded">{success}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[#002060]">
              JSON Editor
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={contentJson}
              onChange={(e) => setContentJson(e.target.value)}
              className="font-mono text-sm min-h-[400px]"
              placeholder='{"title": "...", "sections": [...]}'
            />
            <div className="grid gap-2">
              <Label htmlFor="changelog">Changelog (optional)</Label>
              <Input
                id="changelog"
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="Describe what changed..."
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#737852] hover:bg-[#737852]/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save New Version"}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#002060]">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {parsedPreview ? (
                <div className="prose prose-sm max-w-none">
                  {renderPreview(parsedPreview)}
                </div>
              ) : (
                <p className="text-[var(--muted-foreground)] text-sm">
                  Enter valid JSON to see a preview.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Version History */}
        {!showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#002060]">
                <History className="h-5 w-5" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(!lesson || lesson.versions.length === 0) && (
                  <p className="text-sm text-[var(--muted-foreground)]">No versions yet.</p>
                )}
                {lesson?.versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-md border border-[var(--border)] p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">v{v.version}</span>
                        {v.publishedAt ? (
                          <Badge className="bg-emerald-600">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                      {v.changelog && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          {v.changelog}
                        </p>
                      )}
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {formatDate(new Date(v.createdAt))}
                      </p>
                    </div>
                    {!v.publishedAt && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublish(v.id)}
                        disabled={publishing}
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
