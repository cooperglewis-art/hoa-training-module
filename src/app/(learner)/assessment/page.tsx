import { auth } from "@/lib/auth";
import { getUserProgress } from "@/lib/content";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PASS_THRESHOLD, TOTAL_QUESTIONS } from "@/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Lock,
  ClipboardCheck,
  Trophy,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default async function AssessmentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const progress = await getUserProgress(session.user.id);
  if (!progress) redirect("/dashboard");

  const { allModulesComplete, attempts, passed, certificate, modules } =
    progress;

  // Locked state - not all modules complete
  if (!allModulesComplete) {
    const incompleteModules = modules.filter((m) => !m.completedAt);

    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
              <Lock className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <CardTitle className="text-2xl font-serif text-[#002060]">
              Assessment Locked
            </CardTitle>
            <CardDescription className="text-base">
              Complete all training modules before taking the final assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                Modules remaining:
              </p>
              {incompleteModules.map((mod) => (
                <div
                  key={mod.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <XCircle className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm font-medium">{mod.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {mod.completedLessons.length}/{mod.totalLessons} lessons
                      complete
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Already passed
  if (passed && certificate) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-serif text-[#002060]">
              Congratulations!
            </CardTitle>
            <CardDescription className="text-base">
              You have passed the final assessment and earned your certificate of
              completion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm font-medium text-green-800">
                Best Score: {progress.bestScore}/{TOTAL_QUESTIONS}
              </p>
              <p className="text-xs text-green-600">
                Certificate #{certificate.serialNumber}
              </p>
            </div>

            {attempts.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">
                  Attempt History
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="text-sm">
                          {formatDate(attempt.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {attempt.score}/{TOTAL_QUESTIONS}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={attempt.passed ? "default" : "destructive"}
                            className={
                              attempt.passed ? "bg-green-600" : undefined
                            }
                          >
                            {attempt.passed ? "Pass" : "Fail"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-[#002060] hover:bg-[#002060]/90">
              <Link href={`/certificate/${certificate.id}`}>
                View Certificate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Ready to take assessment
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#002060]/10">
            <ClipboardCheck className="h-8 w-8 text-[#002060]" />
          </div>
          <CardTitle className="text-2xl font-serif text-[#002060]">
            Final Assessment: Case Study
          </CardTitle>
          <CardDescription className="text-base max-w-md mx-auto">
            This assessment presents a realistic case study scenario with{" "}
            {TOTAL_QUESTIONS} questions. You need to answer at least{" "}
            {PASS_THRESHOLD} correctly to pass. You may retake the assessment as
            many times as needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-[var(--muted)] p-3">
              <p className="text-lg font-bold text-[#002060]">
                {TOTAL_QUESTIONS}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Questions
              </p>
            </div>
            <div className="rounded-lg bg-[var(--muted)] p-3">
              <p className="text-lg font-bold text-[#002060]">
                {PASS_THRESHOLD}/{TOTAL_QUESTIONS}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">To Pass</p>
            </div>
            <div className="rounded-lg bg-[var(--muted)] p-3">
              <p className="text-lg font-bold text-[#002060]">Unlimited</p>
              <p className="text-xs text-[var(--muted-foreground)]">Retakes</p>
            </div>
          </div>

          {attempts.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">
                Previous Attempts
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="text-sm">
                        {formatDate(attempt.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {attempt.score}/{TOTAL_QUESTIONS}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={attempt.passed ? "default" : "destructive"}
                          className={
                            attempt.passed ? "bg-green-600" : undefined
                          }
                        >
                          {attempt.passed ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href="/assessment/attempt">
              Begin Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
