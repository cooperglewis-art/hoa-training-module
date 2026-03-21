import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PASS_THRESHOLD, TOTAL_QUESTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ResultCard } from "@/components/assessment/result-card";
import { AssessmentResultAnimation } from "@/components/assessment/result-animation";
import { ArrowRight, RotateCcw } from "lucide-react";

interface AnswerDetail {
  questionId: string;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionText: string;
  isCorrect: boolean;
  stem: string;
  explanation: string;
}

export default async function AssessmentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { attemptId } = await searchParams;
  if (!attemptId) redirect("/assessment");

  const attempt = await db.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      certificate: true,
    },
  });

  if (!attempt || attempt.userId !== session.id) {
    redirect("/assessment");
  }

  // Load questions with correct answers for result display
  const course = await db.course.findFirst();
  if (!course) redirect("/assessment");

  const questions = await db.question.findMany({
    where: { courseId: course.id },
    orderBy: { sortOrder: "asc" },
    include: {
      answerOptions: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  // Build detailed results
  const answersMap = attempt.answers as Record<string, string>;
  const details: AnswerDetail[] = questions.map((q) => {
    const selectedOptionId = answersMap[q.id] || "";
    const selectedOption = q.answerOptions.find(
      (o) => o.id === selectedOptionId
    );
    const correctOption = q.answerOptions.find((o) => o.isCorrect);

    return {
      questionId: q.id,
      selectedOptionId,
      selectedOptionText: selectedOption?.text || "No answer",
      correctOptionText: correctOption?.text || "",
      isCorrect: selectedOption?.isCorrect ?? false,
      stem: q.stem,
      explanation: q.explanation,
    };
  });

  const certificate = attempt.certificate;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Score Display */}
      <Card className="mb-8 overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-serif text-xl text-[#002060]">
            Assessment Result
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <AssessmentResultAnimation
            score={attempt.score}
            total={TOTAL_QUESTIONS}
            passed={attempt.passed}
          />

          {attempt.passed ? (
            <div className="mt-6 space-y-2">
              <p className="text-lg font-serif font-semibold text-green-700">
                Congratulations!
              </p>
              <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
                You have passed the final assessment. Your certificate of
                completion has been generated.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-2">
              <p className="text-lg font-serif font-semibold text-[#675D4F]">
                Not quite there yet
              </p>
              <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
                You needed {PASS_THRESHOLD}/{TOTAL_QUESTIONS} correct answers to
                pass. Review the explanations below and try again when
                you&apos;re ready.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question-by-question results */}
      <div className="mb-8">
        <h2 className="mb-4 font-serif text-lg font-semibold text-[#002060]">
          Question Review
        </h2>
        <div className="space-y-4">
          {details.map((detail, idx) => (
            <ResultCard
              key={detail.questionId}
              index={idx}
              stem={detail.stem}
              userAnswer={detail.selectedOptionText}
              correctAnswer={detail.correctOptionText}
              explanation={detail.explanation}
              isCorrect={detail.isCorrect}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {attempt.passed && certificate ? (
          <Button asChild className="flex-1 bg-[#002060] hover:bg-[#002060]/90" size="lg">
            <Link href={`/certificate/${certificate.id}`}>
              View Certificate
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild className="flex-1" size="lg">
            <Link href="/assessment/attempt">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="flex-1" size="lg">
          <Link href="/assessment">Back to Assessment</Link>
        </Button>
        <Button asChild variant="ghost" className="flex-1" size="lg">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
