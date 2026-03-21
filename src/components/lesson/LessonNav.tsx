"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/app/actions/progress";
import { ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface LessonNavProps {
  moduleId: string;
  lessonId: string;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  nextModule: { id: string; title: string; sortOrder: number } | null;
  isCurrentComplete: boolean;
}

export function LessonNav({
  moduleId,
  lessonId,
  prevLesson,
  nextLesson,
  nextModule,
  isCurrentComplete,
}: LessonNavProps) {
  const [isPending, startTransition] = useTransition();
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const isLastLesson = !nextLesson && !nextModule;

  function handleNext() {
    startTransition(async () => {
      try {
        if (!isCurrentComplete) {
          await markLessonComplete(lessonId);
        }
        if (nextLesson) {
          router.push(`/module/${moduleId}/lesson/${nextLesson.id}`);
        } else if (nextModule) {
          router.push(`/module/${nextModule.id}`);
        } else {
          setShowAssessmentModal(true);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to save progress right now.";
        toast({
          title: "Cannot continue yet",
          description: message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <>
      <div className="mt-12 border-t border-[var(--border)] pt-6">
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

          <Button onClick={handleNext} disabled={isPending} className="gap-2" size="lg">
            {isPending
              ? "Saving..."
              : nextLesson
                ? "Next Lesson"
                : nextModule
                  ? `Next: Module ${nextModule.sortOrder}`
                  : "Complete & Take Assessment"}
            {!isPending && (isLastLesson ? <ClipboardCheck className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />)}
          </Button>
        </div>
      </div>

      <Dialog open={showAssessmentModal} onOpenChange={setShowAssessmentModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10">
              <ClipboardCheck className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <DialogTitle className="text-xl">Ready for the Assessment?</DialogTitle>
            <DialogDescription className="text-base mt-2">
              You&apos;ve completed all three training modules. The final step is a case study assessment to test what you&apos;ve learned.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              size="lg"
              className="bg-[var(--secondary)] text-white hover:bg-[var(--secondary)]/90"
              onClick={() => router.push("/assessment")}
            >
              Take the Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssessmentModal(false);
                router.push("/dashboard");
              }}
            >
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
