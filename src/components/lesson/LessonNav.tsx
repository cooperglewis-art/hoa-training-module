"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { markLessonComplete } from "@/app/actions/progress";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface LessonNavProps {
  moduleId: string;
  lessonId: string;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  isCurrentComplete: boolean;
}

export function LessonNav({
  moduleId,
  lessonId,
  prevLesson,
  nextLesson,
  isCurrentComplete,
}: LessonNavProps) {
  const [isPending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function handleNext() {
    startTransition(async () => {
      if (!isCurrentComplete) {
        await markLessonComplete(lessonId);
        setJustSaved(true);
        toast({ title: "Progress saved", description: "Lesson marked as complete." });
      }
      if (nextLesson) {
        router.push(`/module/${moduleId}/lesson/${nextLesson.id}`);
      } else {
        router.push(`/module/${moduleId}`);
      }
    });
  }

  const showSaved = isCurrentComplete || justSaved;

  return (
    <div className="mt-12 border-t border-[var(--border)] pt-6">
      {showSaved && (
        <div className="mb-4 flex items-center justify-center gap-1.5 text-sm text-[var(--primary)]">
          <CheckCircle2 className="h-4 w-4" />
          <span>Your progress is saved</span>
        </div>
      )}
      <div className="flex items-center justify-between">
      {prevLesson ? (
        <Link href={`/module/${moduleId}/lesson/${prevLesson.id}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        </Link>
      ) : (
        <div />
      )}

      <Button onClick={handleNext} disabled={isPending} className="gap-2">
        {isPending
          ? "Saving..."
          : nextLesson
            ? "Next Lesson"
            : "Complete Module"}
        {!isPending && <ArrowRight className="h-4 w-4" />}
      </Button>
      </div>
    </div>
  );
}
