/**
 * e2e/wallet.spec.ts
 * Wallet: balance display, deposit modal, payment method selection, cash deposit flow
 *
 * These tests use the pre-authenticated buyer state (set up by auth.setup.ts).
 * They do NOT complete real Paynow transactions — they verify the UI flow up to
 * the point of redirect/submission, then assert the correct outcome.
 */
import { test, expect } from "@playwright/test";

test.describe("Wallet", () => {
  test("wallet page loads and shows balance cards", async ({ page }) => {
    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");

    // Three balance cards should be visible
    await expect(page.getByText(/total balance/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/in escrow/i)).toBeVisible();
    await expect(page.getByText(/available/i)).toBeVisible();

    // Balance values should render (even if $0.00)
    await expect(page.getByText(/\$[\d,]+(\.\d{2})?/).first()).toBeVisible();
  });

  test("deposit button opens deposit modal", async ({ page }) => {
    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /deposit funds/i }).click();

    await expect(
      page.getByRole("heading", { name: /deposit funds/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/amount/i)).toBeVisible();
  });

  test("deposit modal shows all available payment methods", async ({
    page,
  }) => {
    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /deposit funds/i }).click();

    // EcoCash should be visible
    await expect(page.getByRole("button", { name: /ecocash/i })).toBeVisible();
    // InnBucks
    await expect(page.getByRole("button", { name: /innbucks/i })).toBeVisible();
    // Cash
    await expect(
      page.getByRole("button", { name: /cash deposit/i }),
    ).toBeVisible();
  });

  test("deposit modal validates minimum amount", async ({ page }) => {
    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /deposit funds/i }).click();

    // Enter amount below minimum
    await page.getByLabel(/amount/i).fill("0.50");

    // Try to submit
    const submitButton = page.getByRole("button", { name: /deposit \$/i });
    // Button should be disabled for amounts below $1
    await expect(submitButton).toBeDisabled();
  });

  test("deposit modal validates maximum amount", async ({ page }) => {
    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /deposit funds/i }).click();

    await page.getByLabel(/amount/i).fill("50000");
    await page.getByRole("button", { name: /ecocash/i }).click();

    const submitButton = page.getByRole("button", { name: /deposit \$/i });
    await submitButton.click();

    const amountInput = page.getByLabel(/amount/i);
    const rangeOverflow = await amountInput.evaluate((input) => {
      const validity = (input as { validity?: { rangeOverflow?: boolean } })
        .validity;
      return validity?.rangeOverflow === true;
    });
    expect(rangeOverflow).toBeTruthy();
    await expect(
      page.getByRole("heading", { name: /deposit funds/i }),
    ).toBeVisible();
  });

  test("selecting EcoCash shows phone prompt hint", async ({ page }) => {
    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /deposit funds/i }).click();

    // Click EcoCash
    await page.getByRole("button", { name: /ecocash/i }).click();

    // Should show prompt hint
    await expect(page.getByText(/payment prompt will be sent/i)).toBeVisible();
  });

  test("selecting cash deposit shows verification instructions", async ({
    page,
  }) => {
    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /deposit funds/i }).click();

    // Click Cash
    await page.getByRole("button", { name: /cash deposit/i }).click();

    // Should show cash instructions
    await expect(page.getByText(/how cash deposits work/i)).toBeVisible();
  });

  test("cancel button closes the deposit modal", async ({ page }) => {
    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /deposit funds/i }).click();

    await expect(
      page.getByRole("heading", { name: /deposit funds/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(
      page.getByRole("heading", { name: /deposit funds/i }),
    ).not.toBeVisible();
  });

  test("payment history link navigates to history page", async ({ page }) => {
    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /payment history/i }).click();
    await expect(page).toHaveURL(/payment\/history|payment-history/);
  });

  test("wallet page shows transaction history section", async ({ page }) => {
    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /transaction history/i }),
    ).toBeVisible();
  });

  test("wallet shows success message when redirected with ?payment=success", async ({
    page,
  }) => {
    await page.goto("/wallet?payment=success");
    await page.waitForLoadState("networkidle");

    // Toast notification should appear
    await expect(
      page.getByText(/payment completed|successfully/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("wallet shows failure message when redirected with ?payment=failed", async ({
    page,
  }) => {
    await page.goto("/wallet?payment=failed");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText(/payment failed|try again/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });
});
