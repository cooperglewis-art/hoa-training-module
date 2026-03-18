"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/app/actions/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  const router = useRouter();

  function handleNext() {
    startTransition(async () => {
      if (!isCurrentComplete) {
        await markLessonComplete(lessonId);
      }
      if (nextLesson) {
        router.push(`/module/${moduleId}/lesson/${nextLesson.id}`);
      } else {
        router.push(`/module/${moduleId}`);
      }
    });
  }

  return (
    <div className="mt-12 flex items-center justify-between border-t border-[var(--border)] pt-6">
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
  );
}
