/**
 * e2e/auth.setup.ts
 *
 * Runs once before all tests.
 * Logs in as a buyer and saves the browser storage state to disk so
 * subsequent test files don't have to repeat the login flow.
 *
 * To run setup only:  npx playwright test --project=setup
 */
import {
  test as setup,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BUYER_STATE = path.join(__dirname, ".auth/buyer.json");
const ADMIN_STATE = path.join(__dirname, ".auth/admin.json");
const API_BASE_URL = (
  process.env.PLAYWRIGHT_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:5000"
).replace(/\/$/, "");
const AUTO_REGISTER_BUYER =
  process.env.E2E_AUTO_REGISTER_BUYER === "true" ||
  API_BASE_URL.includes("localhost") ||
  API_BASE_URL.includes("127.0.0.1");

// ── Credentials — set via environment variables or .env.test ─────────────────
// Never hardcode real credentials. Use environment variables.
const BUYER_EMAIL = process.env.E2E_BUYER_EMAIL ?? "buyer@test.agrivus.com";
const BUYER_PASSWORD = process.env.E2E_BUYER_PASSWORD ?? "TestPass123!";
const BUYER_PHONE = process.env.E2E_BUYER_PHONE ?? "+263771000001";
const BUYER_FULL_NAME = process.env.E2E_BUYER_FULL_NAME ?? "E2E Buyer";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

interface AuthPayload {
  token: string;
  user: Record<string, unknown>;
}

interface LoginAttempt {
  ok: boolean;
  status: number;
  message: string;
  payload?: AuthPayload;
}

async function tryLogin(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<LoginAttempt> {
  const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
    data: { email, password },
  });
  const body = await response.json().catch(() => ({}));

  if (
    response.ok() &&
    body?.success &&
    typeof body?.data?.token === "string" &&
    body?.data?.user
  ) {
    return {
      ok: true,
      status: response.status(),
      message: "ok",
      payload: {
        token: body.data.token,
        user: body.data.user as Record<string, unknown>,
      },
    };
  }

  return {
    ok: false,
    status: response.status(),
    message: body?.message ?? `HTTP ${response.status()}`,
  };
}

async function ensureBuyerExists(request: APIRequestContext): Promise<void> {
  const registerPayload = {
    email: BUYER_EMAIL,
    password: BUYER_PASSWORD,
    phone: BUYER_PHONE,
    fullName: BUYER_FULL_NAME,
    role: "buyer",
    profileData: {
      businessLocation: "Harare",
      buyerType: "retailer",
      productsInterested: ["maize"],
      purchaseVolume: "small",
      qualityRequirements: "standard",
    },
  };

  const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
    data: registerPayload,
  });
  const body = await response.json().catch(() => ({}));

  if (response.status() === 201) {
    return;
  }

  if (response.status() === 409) {
    const message = String(body?.message ?? "").toLowerCase();
    if (message.includes("phone")) {
      const fallbackPhone = `+26377${Date.now().toString().slice(-6)}`;
      const retryPayload = { ...registerPayload, phone: fallbackPhone };
      const retry = await request.post(`${API_BASE_URL}/api/auth/register`, {
        data: retryPayload,
      });
      if (retry.status() === 201) {
        return;
      }
    }
    if (message.includes("email")) {
      throw new Error(
        `Buyer account ${BUYER_EMAIL} exists but credentials are invalid. Set E2E_BUYER_PASSWORD to the real password.`,
      );
    }
  }

  throw new Error(
    `Unable to register buyer test account: ${body?.message ?? `HTTP ${response.status()}`}`,
  );
}

async function getBuyerSession(
  request: APIRequestContext,
): Promise<AuthPayload> {
  let login = await tryLogin(request, BUYER_EMAIL, BUYER_PASSWORD);
  if (login.ok && login.payload) {
    return login.payload;
  }

  if (!AUTO_REGISTER_BUYER) {
    throw new Error(
      `Buyer login failed for ${BUYER_EMAIL}: ${login.message}. Set valid E2E_BUYER_* credentials or enable E2E_AUTO_REGISTER_BUYER=true.`,
    );
  }

  await ensureBuyerExists(request);
  login = await tryLogin(request, BUYER_EMAIL, BUYER_PASSWORD);

  if (login.ok && login.payload) {
    return login.payload;
  }

  throw new Error(
    `Buyer login failed for ${BUYER_EMAIL}: ${login.message} (API: ${API_BASE_URL})`,
  );
}

async function persistSession(
  page: Page,
  statePath: string,
  auth: AuthPayload,
): Promise<void> {
  await page.goto("/");
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    { token: auth.token, user: auth.user },
  );

  const token = await page.evaluate(() => localStorage.getItem("token"));
  expect(token, "JWT token should be stored").toBeTruthy();

  await page.context().storageState({ path: statePath });
}

// ── Buyer login ───────────────────────────────────────────────────────────────
setup("authenticate as buyer", async ({ page, request }) => {
  const session = await getBuyerSession(request);
  await persistSession(page, BUYER_STATE, session);
  console.log("✅ Buyer auth state saved to", BUYER_STATE);
});

// ── Admin login ───────────────────────────────────────────────────────────────
setup("authenticate as admin", async ({ page, request }) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    setup.skip(
      true,
      "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to enable admin auth setup.",
    );
    return;
  }

  const login = await tryLogin(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  if (!login.ok || !login.payload) {
    throw new Error(
      `Admin login failed for ${ADMIN_EMAIL}: ${login.message} (set valid E2E_ADMIN_* env vars).`,
    );
  }

  await persistSession(page, ADMIN_STATE, login.payload);
  console.log("✅ Admin auth state saved to", ADMIN_STATE);
});
