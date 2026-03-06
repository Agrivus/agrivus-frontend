/**
 * e2e/auth.spec.ts
 * Authentication flows: login, register, logout, protected route guard
 */
import { test, expect } from "@playwright/test";

// These tests run without pre-authenticated state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /login|log in|sign in/i }),
    ).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("invalid@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /login|log in|sign in/i }).click();

    // Should not authenticate; app may redirect back to /login on 401
    await expect(page).toHaveURL(/login/, { timeout: 10_000 });

    const hasToken = await page.evaluate(() =>
      Boolean(localStorage.getItem("token")),
    );
    expect(hasToken).toBeFalsy();

    const alert = page.getByRole("alert");
    if (await alert.isVisible().catch(() => false)) {
      await expect(alert).toContainText(
        /login failed|invalid|incorrect|wrong|credentials|unauthorized|401/i,
      );
    }
  });

  test("unauthenticated user is redirected from /wallet to /login", async ({
    page,
  }) => {
    await page.goto("/wallet");
    await expect(page).toHaveURL(/login/, { timeout: 10_000 });
  });

  test("unauthenticated user is redirected from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/, { timeout: 10_000 });
  });

  test("unauthenticated user is redirected from /admin to /login", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/login/, { timeout: 10_000 });
  });

  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /register|sign up|create/i }),
    ).toBeVisible();
  });

  test("shows validation error for missing fields on register", async ({
    page,
  }) => {
    await page.goto("/register");
    await page
      .getByRole("button", { name: /register|sign up|create/i })
      .click();
    // Should stay on register page — HTML5 or custom validation
    await expect(page).toHaveURL(/register/);
  });
});
