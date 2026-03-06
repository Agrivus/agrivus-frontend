/**
 * e2e/agrimall.spec.ts
 * AgriMall: product browsing, cart, checkout wallet balance guard
 */
import { test, expect } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test.describe("AgriMall", () => {
  const buildCheckoutSummary = (wallet: {
    balance: string;
    sufficient: boolean;
    shortfall: string | null;
  }) => ({
    success: true,
    data: {
      cart: {
        id: "cart-1",
        itemCount: 1,
        items: [
          {
            productId: "prod-1",
            quantity: 1,
            price: "100.00",
            subtotal: "100.00",
            product: {
              id: "prod-1",
              name: "Fertilizer Bag",
              images: [],
              stockQuantity: 20,
              unit: "bag",
            },
            vendor: {
              id: "vendor-1",
              storeName: "Green Farm Supplies",
              phone: "+263771234567",
              deliveryAreas: ["Harare"],
            },
            available: true,
          },
        ],
      },
      pricing: {
        subtotal: "100.00",
        estimatedDeliveryFee: "5.00",
        tax: "0.00",
        total: "105.00",
      },
      availability: {
        allAvailable: true,
        unavailableItems: [],
      },
      wallet,
    },
  });

  test("products page loads", async ({ page }) => {
    await page.goto("/agrimall/products");
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .getByRole("heading", { name: /agri.mall|products|shop/i })
        .or(page.getByText(/no products/i)),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("cart page loads", async ({ page }) => {
    await page.goto("/agrimall/cart");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/cart|your cart|empty/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("checkout page loads and shows wallet payment option", async ({
    page,
  }) => {
    await page.route("**/api/agrimall/checkout/summary*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          buildCheckoutSummary({
            balance: "250.00",
            sufficient: true,
            shortfall: null,
          }),
        ),
      });
    });

    await page.goto("/agrimall/checkout");
    await page.waitForLoadState("networkidle");

    // Checkout should show wallet and escrow messaging
    await expect(page.getByText(/wallet balance/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/escrow/i)).toBeVisible();
  });

  test("checkout shows insufficient balance warning when wallet is low", async ({
    page,
  }) => {
    await page.route("**/api/agrimall/checkout/summary*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          buildCheckoutSummary({
            balance: "10.00",
            sufficient: false,
            shortfall: "95.00",
          }),
        ),
      });
    });

    await page.goto("/agrimall/checkout");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText(/insufficient wallet balance|you need \$95\.00 more/i),
    ).toBeVisible({
      timeout: 10_000,
    });
  });

  test("AgriMall orders page loads", async ({ page }) => {
    await page.goto("/agrimall/orders");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/orders|no orders/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
