# Agrivus Frontend — E2E Tests (Playwright)

## Setup

### 1. Install Playwright

```bash
cd agrivus-frontend
npm install --save-dev @playwright/test
npx playwright install chromium
```

### 2. Create test user accounts

The E2E tests need two real accounts in your database:

| Role  | Email                      | Password      |
|-------|----------------------------|---------------|
| buyer | buyer@test.agrivus.com     | TestPass123!  |
| admin | admin@test.agrivus.com     | AdminPass123! |

Create them via your admin panel or directly in the DB. These are test-only accounts — do not use production credentials.

### 3. Configure environment variables

Create `agrivus-frontend/.env.test`:

```env
E2E_BUYER_EMAIL=buyer@test.agrivus.com
E2E_BUYER_PASSWORD=TestPass123!
E2E_ADMIN_EMAIL=admin@test.agrivus.com
E2E_ADMIN_PASSWORD=AdminPass123!
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

Or for testing against production:
```env
PLAYWRIGHT_BASE_URL=https://agrivus.com
```

### 4. Create the auth state directory

```bash
mkdir -p agrivus-frontend/e2e/.auth
echo '{}' > agrivus-frontend/e2e/.auth/buyer.json
echo '{}' > agrivus-frontend/e2e/.auth/admin.json
```

Add `e2e/.auth/` to `.gitignore` — these files contain auth tokens.

---

## Running tests

```bash
# Run all E2E tests (starts dev server automatically)
npx playwright test

# Run a specific file
npx playwright test e2e/wallet.spec.ts

# Run with the visual UI
npx playwright test --ui

# Run against production
PLAYWRIGHT_BASE_URL=https://agrivus.com npx playwright test

# Show the HTML report
npx playwright show-report
```

---

## Test files

| File | What it covers |
|------|---------------|
| `auth.setup.ts` | Login setup — creates stored auth state for all tests |
| `auth.spec.ts` | Login, register, logout, protected route redirects |
| `marketplace.spec.ts` | Listing browsing, search, listing detail |
| `wallet.spec.ts` | Balance display, deposit modal, payment method selection |
| `payment.spec.ts` | Payment page flows (mocked API — no real Paynow calls) |
| `agrimall.spec.ts` | Products, cart, checkout, wallet balance guard |
| `navigation.spec.ts` | Smoke tests for all major routes, 404, no JS errors |

---

## CI/CD (GitHub Actions)

Add this to `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: agrivus-frontend/package-lock.json

      - name: Install dependencies
        working-directory: agrivus-frontend
        run: npm ci

      - name: Install Playwright browsers
        working-directory: agrivus-frontend
        run: npx playwright install --with-deps chromium

      - name: Create auth state directory
        working-directory: agrivus-frontend
        run: mkdir -p e2e/.auth && echo '{}' > e2e/.auth/buyer.json && echo '{}' > e2e/.auth/admin.json

      - name: Run E2E tests
        working-directory: agrivus-frontend
        run: npx playwright test
        env:
          PLAYWRIGHT_BASE_URL: https://agrivus.com
          E2E_BUYER_EMAIL: ${{ secrets.E2E_BUYER_EMAIL }}
          E2E_BUYER_PASSWORD: ${{ secrets.E2E_BUYER_PASSWORD }}
          E2E_ADMIN_EMAIL: ${{ secrets.E2E_ADMIN_EMAIL }}
          E2E_ADMIN_PASSWORD: ${{ secrets.E2E_ADMIN_PASSWORD }}

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: agrivus-frontend/playwright-report/
          retention-days: 7
```

Add `E2E_BUYER_EMAIL`, `E2E_BUYER_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` as GitHub repository secrets.

---

## Notes

- **Payment tests use API mocking** — they intercept `/api/payments/*` and return fake responses. No real EcoCash or Paynow calls are made.
- **Auth state is file-based** — `auth.setup.ts` logs in once and saves the browser storage state. All other tests reuse this state, so login is not repeated.
- Tests are written to be **resilient to empty data** — they check for either content or empty-state messages so they pass even on a fresh database.