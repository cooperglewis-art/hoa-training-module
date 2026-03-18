import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/admin/stats-card";
import { PASS_THRESHOLD, TOTAL_QUESTIONS } from "@/lib/constants";
import { ClipboardList, Target, TrendingUp, BarChart3 } from "lucide-react";

export default async function AssessmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [questions, totalAttempts, passedAttempts, allAttempts] = await Promise.all([
    db.question.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        answerOptions: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    db.assessmentAttempt.count(),
    db.assessmentAttempt.count({ where: { passed: true } }),
    db.assessmentAttempt.findMany({ select: { score: true } }),
  ]);

  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const avgScore =
    allAttempts.length > 0
      ? Math.round(
          (allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length) * 10
        ) / 10
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002060]">Assessment Management</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Review assessment questions and performance statistics. Pass threshold:{" "}
          {PASS_THRESHOLD}/{TOTAL_QUESTIONS} correct.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Attempts" value={totalAttempts} icon={ClipboardList} />
        <StatsCard title="Pass Rate" value={`${passRate}%`} icon={TrendingUp} />
        <StatsCard
          title="Average Score"
          value={`${avgScore}/${TOTAL_QUESTIONS}`}
          icon={BarChart3}
        />
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-[#002060]">
                Question {idx + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {q.scenario && (
                <div className="bg-[var(--muted)]/50 rounded-lg p-4 text-sm">
                  <span className="font-semibold text-[#675D4F]">Scenario: </span>
                  {q.scenario}
                </div>
              )}
              <p className="font-medium">{q.stem}</p>
              <div className="space-y-2">
                {q.answerOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-3 rounded-md border p-3 ${
                      opt.isCorrect
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <span className="text-sm flex-1">{opt.text}</span>
                    {opt.isCorrect && (
                      <Badge className="bg-emerald-600 shrink-0">
                        <Target className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <span className="font-semibold text-[#002060]">Explanation: </span>
                {q.explanation}
              </div>
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-[var(--muted-foreground)]">
              No assessment questions found. Seed the database to add questions.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
