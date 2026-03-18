import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserProgress } from "@/lib/content";
import { ModuleCard } from "@/components/learner/module-card";
import { ProgressRing } from "@/components/learner/progress-ring";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Award, ClipboardCheck, Lock } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const progress = await getUserProgress(session.user.id);
  if (!progress) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--muted-foreground)]">
          No course found. Please contact your administrator.
        </p>
      </div>
    );
  }

  const { modules, allModulesComplete, certificate, passed } = progress;

  // Calculate overall progress
  const totalLessons = modules.reduce((sum, m) => sum + m.totalLessons, 0);
  const completedLessons = modules.reduce(
    (sum, m) => sum + m.completedLessons.length,
    0
  );
  const overallPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Determine locked state: module N is locked until module N-1 is completed
  const modulesWithLock = modules.map((mod, index) => ({
    ...mod,
    locked: index > 0 && modules[index - 1].completedAt === null,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Welcome back, {session.user.name?.split(" ")[0] ?? "Learner"}
          </h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            {APP_NAME} — Track your progress below.
          </p>
        </div>
        <ProgressRing percentage={overallPercent} size={100} strokeWidth={8} />
      </div>

      {/* Module Grid */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">
          Training Modules
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modulesWithLock.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      </section>

      {/* Assessment and Certificate Row */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Assessment Card */}
        <Card
          className={
            !allModulesComplete ? "opacity-60" : "transition-shadow hover:shadow-md"
          }
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              {allModulesComplete ? (
                <ClipboardCheck className="h-5 w-5 text-[var(--secondary)]" />
              ) : (
                <Lock className="h-4 w-4 text-[var(--muted-foreground)]" />
              )}
              <CardTitle className="text-lg">Final Assessment</CardTitle>
            </div>
            <CardDescription>
              {allModulesComplete
                ? passed
                  ? "You have passed the assessment."
                  : "Complete the final assessment to earn your certificate."
                : "Complete all training modules to unlock the assessment."}
            </CardDescription>
          </CardHeader>
          {allModulesComplete && !passed && (
            <CardContent>
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center rounded-md bg-[var(--secondary)] px-4 py-2 text-sm font-medium text-[var(--secondary-foreground)] shadow hover:bg-[var(--secondary)]/90 transition-colors"
              >
                Start Assessment
              </Link>
            </CardContent>
          )}
        </Card>

        {/* Certificate Card */}
        {certificate && (
          <Card className="border-[var(--primary)] transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[var(--primary)]" />
                <CardTitle className="text-lg">Certificate Earned</CardTitle>
              </div>
              <CardDescription>
                Serial: {certificate.serialNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/certificate/${certificate.id}`}
                className="inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] shadow hover:bg-[var(--primary)]/90 transition-colors"
              >
                View Certificate
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
