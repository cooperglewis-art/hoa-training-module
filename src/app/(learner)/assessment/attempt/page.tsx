"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CaseStudyQuestion } from "@/components/assessment/case-study-question";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { submitAssessment } from "@/app/actions/assessment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Send } from "lucide-react";

interface AnswerOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  stem: string;
  answerOptions: AnswerOption[];
}

interface AssessmentData {
  scenario: string;
  questions: Question[];
}

export default function AssessmentAttemptPage() {
  const router = useRouter();
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  // Prevent accidental navigation away during assessment
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(answers).length > 0 && !submitting) {
        e.preventDefault();
      }
    };

    // Push a state so back-button triggers popstate instead of leaving
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [answers, submitting]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/assessment/questions");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load assessment questions.");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleSelect = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    },
    []
  );

  const allAnswered =
    data !== null &&
    data.questions.length > 0 &&
    data.questions.every((q) => answers[q.id]);

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitAssessment(answers);
      router.push(`/assessment/result?attemptId=${result.attemptId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setSubmitError(msg);
      toast({ title: "Submission failed", description: msg, variant: "destructive" });
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Loading assessment...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-12 w-12 text-[var(--destructive)]" />
            <p className="text-center font-medium">
              {error || "Unable to load the assessment."}
            </p>
            <Button variant="outline" onClick={() => router.push("/assessment")}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Case Study Scenario */}
      <Card className="mb-8 border-[#002060]/20 bg-[#002060]/[0.02]">
        <CardHeader>
          <CardTitle className="font-serif text-xl text-[#002060]">
            Case Study Scenario
          </CardTitle>
          <CardDescription className="text-[var(--foreground)]/80 text-sm leading-relaxed whitespace-pre-line">
            {data.scenario}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {data.questions.map((question, idx) => (
          <CaseStudyQuestion
            key={question.id}
            index={idx}
            stem={question.stem}
            options={question.answerOptions}
            selectedOptionId={answers[question.id] || null}
            onSelect={(optionId) => handleSelect(question.id, optionId)}
          />
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 space-y-3">
        {submitError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {submitError}
          </div>
        )}

        <Button
          onClick={() => setShowConfirm(true)}
          disabled={!allAnswered || submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Assessment
            </>
          )}
        </Button>

        {!allAnswered && (
          <p className="text-center text-xs text-[var(--muted-foreground)]">
            Please answer all {data.questions.length} questions before
            submitting.
          </p>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assessment?</DialogTitle>
            <DialogDescription>
              You are about to submit your final answers. Once submitted, this
              attempt will be graded and cannot be changed. Are you sure you want
              to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Go Back
            </Button>
            <Button
              onClick={() => {
                setShowConfirm(false);
                handleSubmit();
              }}
            >
              Yes, Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
