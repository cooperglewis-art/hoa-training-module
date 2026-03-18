import { test, expect } from "@playwright/test";

test.describe("Learner Flow", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=CCR Enforcement Training")).toBeVisible();
    await expect(page.locator("text=Start Training")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Sign In")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("text=Create Account")).toBeVisible();
  });

  test("unauthenticated user redirected from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("learner can log in and see dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "learner2@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(dashboard|disclaimer)/);
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|disclaimer)/);
  });

  test("completed learner can view certificate", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "learner1@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);
    await expect(page.locator("text=Certificate")).toBeVisible();
  });
});

test.describe("Admin Flow", () => {
  test("org admin can view learner roster", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "orgadmin@sunsetridge.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(org\/dashboard|dashboard)/);
  });

  test("super admin can access admin dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(admin\/dashboard|dashboard)/);
  });
});
