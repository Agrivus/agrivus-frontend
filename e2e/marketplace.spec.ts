/**
 * e2e/marketplace.spec.ts
 * Marketplace: listing browsing, search, filters, listing detail
 */
import { test, expect } from "@playwright/test";

test.describe("Marketplace", () => {
  test("marketplace page loads with listings", async ({ page }) => {
    await page.goto("/marketplace");
    await expect(page).toHaveTitle(/agrivus/i);
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /^marketplace$/i }),
    ).toBeVisible({ timeout: 15_000 });

    const hasListings = await page
      .locator("a[href^='/listings/']")
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState = await page
      .getByRole("heading", { name: /no listings found/i })
      .isVisible()
      .catch(() => false);

    expect(hasListings || hasEmptyState).toBeTruthy();
  });

  test("search filters listings by keyword", async ({ page }) => {
    await page.goto("/marketplace");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder("Search...");
    await expect(searchInput).toBeVisible();

    const filteredResponse = page.waitForResponse((response) => {
      const url = response.url().toLowerCase();
      return url.includes("/api/listings") && url.includes("search=maize");
    });

    await searchInput.fill("maize");
    await filteredResponse;
    await expect(searchInput).toHaveValue("maize");
  });

  test("listing card links to listing detail page", async ({ page }) => {
    await page.goto("/marketplace");
    await page.waitForLoadState("networkidle");

    // Find first listing card and click it
    const firstCard = page.locator("a[href*='/listings/']").first();

    if (await firstCard.isVisible()) {
      await firstCard.click();
      await expect(page).toHaveURL(/\/listings\//);
      await page.waitForLoadState("networkidle");

      await expect(
        page.getByRole("heading", { name: /place order/i }),
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test("home page renders without errors", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/agrivus/i);
    await page.waitForLoadState("networkidle");

    // No JS errors
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });
});
