"use server";

import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { generateCertificatePdf } from "@/lib/certificate";
import { sendEmail, certificateEmailHtml } from "@/lib/email";
import { generateSerialNumber } from "@/lib/utils";
import { PASS_THRESHOLD } from "@/lib/constants";
import { revalidatePath } from "next/cache";

interface SubmitAssessmentResult {
  attemptId: string;
  score: number;
  passed: boolean;
}

export async function submitAssessment(
  answers: Record<string, string>
): Promise<SubmitAssessmentResult> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.id;

  // Get the course and its questions
  const course = await db.course.findFirst({
    include: {
      modules: {
        include: {
          lessons: { select: { id: true } },
        },
      },
      questions: {
        orderBy: { sortOrder: "asc" },
        include: {
          answerOptions: true,
        },
      },
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Verify all modules are complete
  const moduleProgress = await db.moduleProgress.findMany({
    where: { userId },
  });

  const allModulesComplete = course.modules.every((mod) => {
    const mp = moduleProgress.find((p) => p.moduleId === mod.id);
    return mp?.completedAt !== null && mp?.completedAt !== undefined;
  });

  if (!allModulesComplete) {
    throw new Error("All modules must be completed before taking the assessment");
  }

  // Validate that all questions are answered
  const questionIds = course.questions.map((q) => q.id);
  const missingAnswers = questionIds.filter((id) => !answers[id]);
  if (missingAnswers.length > 0) {
    throw new Error("All questions must be answered");
  }

  // Calculate score
  let score = 0;
  for (const question of course.questions) {
    const selectedOptionId = answers[question.id];
    const correctOption = question.answerOptions.find((o) => o.isCorrect);
    if (correctOption && correctOption.id === selectedOptionId) {
      score++;
    }
  }

  const passed = score >= PASS_THRESHOLD;

  // Create the attempt
  const attempt = await db.assessmentAttempt.create({
    data: {
      userId,
      courseId: course.id,
      score,
      passed,
      answers,
    },
  });

  // Log the attempt
  await db.auditLog.create({
    data: {
      action: "ASSESSMENT_ATTEMPTED",
      actorId: userId,
      metadata: { attemptId: attempt.id, score, passed },
    },
  });

  // If passed for the first time, create completion + certificate + send email
  if (passed) {
    const existingCompletion = await db.courseCompletion.findUnique({
      where: {
        userId_courseId: { userId, courseId: course.id },
      },
    });

    if (!existingCompletion) {
      // Create course completion
      await db.courseCompletion.create({
        data: {
          userId,
          courseId: course.id,
        },
      });

      // Get org name for certificate
      const membership = await db.membership.findFirst({
        where: { userId },
        orderBy: { joinedAt: "desc" },
        include: { org: true },
      });
      if (!membership) {
        throw new Error("No organization membership found for this learner.");
      }
      const orgName = membership.org.name;

      // Create certificate
      const serialNumber = generateSerialNumber();
      const certificate = await db.certificate.create({
        data: {
          userId,
          attemptId: attempt.id,
          serialNumber,
          orgName,
          userName: session.name || "Learner",
        },
      });

      // Log certificate issuance
      await db.auditLog.create({
        data: {
          action: "CERTIFICATE_ISSUED",
          actorId: userId,
          orgId: membership.orgId,
          metadata: {
            certificateId: certificate.id,
            serialNumber,
          },
        },
      });

      // Log assessment passed
      await db.auditLog.create({
        data: {
          action: "ASSESSMENT_PASSED",
          actorId: userId,
          orgId: membership.orgId,
          metadata: { attemptId: attempt.id, score },
        },
      });

      // Generate PDF and send email
      try {
        const pdfBytes = await generateCertificatePdf({
          userName: session.name || "Learner",
          orgName,
          serialNumber,
          issuedAt: certificate.issuedAt,
        });

        await sendEmail({
          to: session.email || "",
          subject: "Your CCR Enforcement Training Certificate",
          html: certificateEmailHtml(session.name || "Learner"),
          templateId: "certificate",
          attachments: [
            {
              filename: `CCR-Certificate-${serialNumber}.pdf`,
              content: Buffer.from(pdfBytes),
            },
          ],
        });
      } catch (err) {
        // Email failure should not block the assessment result
        console.error("Failed to send certificate email:", err);
      }
    }
  }

  revalidatePath("/assessment");
  revalidatePath("/dashboard");

  return {
    attemptId: attempt.id,
    score,
    passed,
  };
}
