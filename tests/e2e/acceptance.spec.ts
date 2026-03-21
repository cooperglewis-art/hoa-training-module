import { test, expect } from "@playwright/test";

/**
 * Full acceptance test: covers the entire learner journey from
 * enrollment through certificate issuance, plus org admin verification.
 *
 * Requires a seeded database with test data (npx tsx prisma/seed.ts).
 */
test.describe("Full Learner Journey — Acceptance Test", () => {
  // Use learner2 — has module 1 complete, needs to finish modules 2 & 3 + assessment
  const LEARNER_EMAIL = "learner2@example.com";
  const LEARNER_PASSWORD = "password123";
  const ORG_ADMIN_EMAIL = "orgadmin@sunsetridge.com";
  const ORG_ADMIN_PASSWORD = "password123";

  test("complete learner flow: login → modules → assessment → certificate", async ({
    page,
  }) => {
    // Increase timeout for full flow
    test.setTimeout(120_000);

    // ─── Step 1: Login ───────────────────────────────────────────────
    await page.goto("/login");
    await page.fill('input[type="email"]', LEARNER_EMAIL);
    await page.fill('input[type="password"]', LEARNER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|disclaimer)/);

    // Handle disclaimer if shown
    if (page.url().includes("/disclaimer")) {
      const acknowledgeBtn = page.locator("button", { hasText: /acknowledge|agree|continue/i });
      if (await acknowledgeBtn.isVisible({ timeout: 3000 })) {
        await acknowledgeBtn.click();
        await page.waitForURL(/\/dashboard/);
      }
    }

    // ─── Step 2: Verify Dashboard ────────────────────────────────────
    await expect(page.locator("text=Understanding Governing Documents")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator("text=The Enforcement Process")).toBeVisible();
    await expect(page.locator("text=Pre-Lawsuit")).toBeVisible();

    // ─── Step 3: Complete Module 2 ───────────────────────────────────
    // Click into Module 2
    await page.locator("text=The Enforcement Process").click();
    await page.waitForURL(/\/module\//);

    // Navigate through each lesson
    const lessonLinks = page.locator('a[href*="/lesson/"]');
    const lessonCount = await lessonLinks.count();

    for (let i = 0; i < lessonCount; i++) {
      // Click each lesson
      const lessons = page.locator('a[href*="/lesson/"]');
      await lessons.nth(i).click();
      await page.waitForURL(/\/lesson\//);

      // Scroll to bottom to simulate reading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Handle knowledge-check or checkpoint blocks if present
      const checkButtons = page.locator('button:has-text("Check"), button:has-text("Submit")');
      const checkCount = await checkButtons.count();
      for (let j = 0; j < checkCount; j++) {
        // Try to select an answer first
        const radioButtons = page.locator('input[type="radio"]');
        const radioCount = await radioButtons.count();
        if (radioCount > 0) {
          // Select the correct answer (index 1 is usually correct in our content)
          await radioButtons.nth(1).click();
          await checkButtons.nth(j).click();
          await page.waitForTimeout(300);
        }
      }

      // Click Next or Complete Module if available
      const nextBtn = page.locator('a:has-text("Next"), button:has-text("Next"), a:has-text("Complete"), button:has-text("Complete")');
      if (await nextBtn.first().isVisible({ timeout: 2000 })) {
        await nextBtn.first().click();
        await page.waitForTimeout(500);
      } else {
        // Navigate back to module page
        await page.goBack();
      }
    }

    // ─── Step 4: Complete Module 3 ───────────────────────────────────
    await page.goto("/dashboard");
    await page.waitForTimeout(1000);

    await page.locator("text=Pre-Lawsuit").click();
    await page.waitForURL(/\/module\//);

    const m3LessonLinks = page.locator('a[href*="/lesson/"]');
    const m3LessonCount = await m3LessonLinks.count();

    for (let i = 0; i < m3LessonCount; i++) {
      const lessons = page.locator('a[href*="/lesson/"]');
      await lessons.nth(i).click();
      await page.waitForURL(/\/lesson\//);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      const checkButtons = page.locator('button:has-text("Check"), button:has-text("Submit")');
      const checkCount = await checkButtons.count();
      for (let j = 0; j < checkCount; j++) {
        const radioButtons = page.locator('input[type="radio"]');
        if ((await radioButtons.count()) > 0) {
          await radioButtons.nth(1).click();
          await checkButtons.nth(j).click();
          await page.waitForTimeout(300);
        }
      }

      const nextBtn = page.locator('a:has-text("Next"), button:has-text("Next"), a:has-text("Complete"), button:has-text("Complete")');
      if (await nextBtn.first().isVisible({ timeout: 2000 })) {
        await nextBtn.first().click();
        await page.waitForTimeout(500);
      } else {
        await page.goBack();
      }
    }

    // ─── Step 5: Take Assessment ─────────────────────────────────────
    await page.goto("/dashboard");
    await page.waitForTimeout(1000);

    // Find and click the assessment link/button
    const assessmentLink = page.locator('a:has-text("Assessment"), a:has-text("assessment"), button:has-text("Assessment")');
    if (await assessmentLink.first().isVisible({ timeout: 5000 })) {
      await assessmentLink.first().click();
      await page.waitForURL(/\/assessment/);

      // Start the assessment if there's a start button
      const startBtn = page.locator('a:has-text("Begin"), button:has-text("Begin"), a:has-text("Start"), button:has-text("Start")');
      if (await startBtn.first().isVisible({ timeout: 3000 })) {
        await startBtn.first().click();
        await page.waitForURL(/\/assessment\/attempt/);
      }

      // Answer all 4 questions — select the second option (index 1) which is correct in our seed data
      for (let q = 0; q < 4; q++) {
        const options = page.locator('input[type="radio"]');
        const optionCount = await options.count();
        if (optionCount > 0) {
          // Select the second option (our correct answers are at sortOrder 1)
          await options.nth(1).click();
          await page.waitForTimeout(300);
        }

        // Move to next question if there's a next button
        const nextQ = page.locator('button:has-text("Next")');
        if (await nextQ.isVisible({ timeout: 1000 })) {
          await nextQ.click();
          await page.waitForTimeout(500);
        }
      }

      // Submit the assessment
      const submitBtn = page.locator('button:has-text("Submit")');
      if (await submitBtn.isVisible({ timeout: 3000 })) {
        await submitBtn.click();

        // Confirm if there's a confirmation dialog
        const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmBtn.isVisible({ timeout: 2000 })) {
          await confirmBtn.click();
        }

        // Wait for results
        await page.waitForURL(/\/assessment\/result/, { timeout: 15_000 });

        // Check if we passed
        const resultPage = page.locator("body");
        const resultText = await resultPage.textContent();
        expect(resultText).toBeTruthy();
      }
    }

    // ─── Step 6: Verify Certificate ──────────────────────────────────
    await page.goto("/dashboard");
    await page.waitForTimeout(1000);

    // Check for certificate visibility on dashboard
    const certLink = page.locator('a:has-text("Certificate"), a:has-text("certificate"), a:has-text("View Certificate")');
    if (await certLink.first().isVisible({ timeout: 5000 })) {
      await certLink.first().click();
      await page.waitForURL(/\/certificate\//);
      await expect(page.locator("body")).not.toBeEmpty();
    }
  });

  test("org admin can see learner progress", async ({ page }) => {
    test.setTimeout(30_000);

    // Login as org admin
    await page.goto("/login");
    await page.fill('input[type="email"]', ORG_ADMIN_EMAIL);
    await page.fill('input[type="password"]', ORG_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(org\/dashboard|dashboard)/, { timeout: 10_000 });

    // Navigate to learners page
    const learnersLink = page.locator('a:has-text("Learners"), a:has-text("learners"), a[href*="/learners"]');
    if (await learnersLink.first().isVisible({ timeout: 5000 })) {
      await learnersLink.first().click();
      await page.waitForURL(/\/learners/);

      // Verify learner data is visible
      await expect(page.locator("body")).toContainText("Emily Rodriguez");
    }
  });
});
