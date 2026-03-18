import { describe, it, expect } from "vitest";
import { PASS_THRESHOLD, TOTAL_QUESTIONS } from "@/lib/constants";

function calculateScore(
  answers: Record<string, string>,
  correctAnswers: Record<string, string>
): { score: number; passed: boolean } {
  let score = 0;
  for (const [questionId, answerId] of Object.entries(answers)) {
    if (correctAnswers[questionId] === answerId) {
      score++;
    }
  }
  return { score, passed: score >= PASS_THRESHOLD };
}

describe("Assessment scoring", () => {
  const correctAnswers: Record<string, string> = {
    q1: "a1-b",
    q2: "a2-c",
    q3: "a3-b",
    q4: "a4-b",
  };

  it("scores a perfect attempt as passed", () => {
    const result = calculateScore(
      { q1: "a1-b", q2: "a2-c", q3: "a3-b", q4: "a4-b" },
      correctAnswers
    );
    expect(result.score).toBe(4);
    expect(result.passed).toBe(true);
  });

  it("scores 3/4 as passed", () => {
    const result = calculateScore(
      { q1: "a1-b", q2: "a2-c", q3: "a3-b", q4: "a4-wrong" },
      correctAnswers
    );
    expect(result.score).toBe(3);
    expect(result.passed).toBe(true);
  });

  it("scores 2/4 as failed", () => {
    const result = calculateScore(
      { q1: "a1-b", q2: "a2-wrong", q3: "a3-b", q4: "a4-wrong" },
      correctAnswers
    );
    expect(result.score).toBe(2);
    expect(result.passed).toBe(false);
  });

  it("scores 0/4 as failed", () => {
    const result = calculateScore(
      { q1: "wrong", q2: "wrong", q3: "wrong", q4: "wrong" },
      correctAnswers
    );
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it("has correct threshold constants", () => {
    expect(PASS_THRESHOLD).toBe(3);
    expect(TOTAL_QUESTIONS).toBe(4);
  });
});
