/**
 * e2e/payment.spec.ts
 * Payment page: mock payment flow, status display, navigation
 *
 * Strategy: intercept the API call to /api/payments/deposit so tests
 * don't actually hit Paynow. Return a mock response that exercises
 * each branch of PaynowPayment.tsx.
 */
import { test, expect } from "@playwright/test";

test.use({ serviceWorkers: "block" });

const MOCK_PAYMENT_ID = "00000000-0000-0000-0000-000000000001";
const MOCK_REFERENCE = "WD-1234567890-ABCDEF";

test.describe("Payment Page", () => {
  test("cash deposit confirmation page renders correctly", async ({ page }) => {
    // Intercept deposit API → return a cash response with manual instructions
    await page.route("**/api/payments/deposit*", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Cash deposit submitted for verification",
          data: {
            paymentId: MOCK_PAYMENT_ID,
            reference: MOCK_REFERENCE,
            amount: 10,
            paymentMethod: "cash",
            status: "pending",
            paymentUrl: null,
            pollUrl: `/api/payments/status/${MOCK_PAYMENT_ID}`,
            instructions: "Cash deposit submitted for admin verification",
            isMockPayment: false,
          },
        }),
      });
    });

    await page.goto("/wallet");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /deposit funds/i }).click();
    await page.getByLabel(/amount/i).fill("10");
    await page.getByRole("button", { name: /cash deposit/i }).click();
    await page.getByRole("button", { name: /deposit \$10/i }).click();

    // Cash flow remains on wallet and shows manual instructions panel
    await expect(page).toHaveURL(/\/wallet/);
    await expect(
      page.getByRole("heading", { name: /payment instructions/i }),
    ).toBeVisible({
      timeout: 8_000,
    });
    await expect(
      page.getByText(/cash deposit submitted|pending admin verification/i),
    ).toBeVisible();
    await expect(page.getByText(/reference:/i)).toBeVisible();
  });

  test("mock EcoCash payment shows instructions and polling UI", async ({
    page,
  }) => {
    // Intercept deposit → return mock EcoCash response (no paymentUrl = mobile money instructions)
    await page.route("**/api/payments/deposit*", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Payment initialized successfully",
          data: {
            paymentId: MOCK_PAYMENT_ID,
            reference: MOCK_REFERENCE,
            amount: 5,
            paymentMethod: "ecocash",
            status: "pending",
            paymentUrl: null, // No redirect — shows instructions page
            pollUrl: `/api/payments/status/${MOCK_PAYMENT_ID}`,
            instructions:
              "A payment prompt has been sent to your phone. Please approve it on your phone.",
            isMockPayment: true,
          },
        }),
      });
    });

    await page.route("**/api/payments/status/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            paymentId: MOCK_PAYMENT_ID,
            reference: MOCK_REFERENCE,
            status: "pending",
            paid: false,
            amount: 5,
            paymentMethod: "ecocash",
            instructions:
              "A payment prompt has been sent to your phone. Please approve it on your phone.",
            isMockPayment: true,
          },
        }),
      });
    });

    await page.goto(`/payment/${MOCK_PAYMENT_ID}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /ecocash/i })).toBeVisible({
      timeout: 8_000,
    });
    await expect(
      page.getByText(/if you didn't receive it, follow these steps/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /i've paid|check status/i }),
    ).toBeVisible();
  });

  test("payment success state renders correctly", async ({ page }) => {
    await page.route("**/api/payments/status/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            paymentId: MOCK_PAYMENT_ID,
            reference: MOCK_REFERENCE,
            status: "completed",
            paid: true,
            amount: 25,
            paymentMethod: "ecocash",
            completedAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto(`/payment/${MOCK_PAYMENT_ID}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/payment successful/i)).toBeVisible({
      timeout: 8_000,
    });
    await expect(page.getByText(/\$25/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /go to wallet/i }),
    ).toBeVisible();
  });

  test("payment failed state renders correctly", async ({ page }) => {
    await page.route("**/api/payments/status/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            paymentId: MOCK_PAYMENT_ID,
            reference: MOCK_REFERENCE,
            status: "failed",
            paid: false,
            amount: 25,
            paymentMethod: "ecocash",
          },
        }),
      });
    });

    await page.goto(`/payment/${MOCK_PAYMENT_ID}`);
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /payment failed/i }),
    ).toBeVisible({ timeout: 8_000 });
    await expect(
      page.getByRole("button", { name: /try again/i }),
    ).toBeVisible();
  });

  test("'Go to Wallet' button navigates to wallet after success", async ({
    page,
  }) => {
    await page.route("**/api/payments/status/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            paymentId: MOCK_PAYMENT_ID,
            reference: MOCK_REFERENCE,
            status: "completed",
            paid: true,
            amount: 10,
          },
        }),
      });
    });

    await page.goto(`/payment/${MOCK_PAYMENT_ID}`);
    await page
      .getByRole("button", { name: /go to wallet/i })
      .click({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/wallet/);
  });
});
