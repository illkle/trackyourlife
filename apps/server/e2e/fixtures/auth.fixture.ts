import type { Page } from "@playwright/test";
import { test as base, expect } from "@playwright/test";

/**
 * Test user credentials generator for isolated test runs
 */
const generateTestUser = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return {
    email: `e2e-test-${timestamp}-${random}@test.local`,
    password: "TestPassword123!",
    name: `E2E Test User ${random}`,
  };
};

export interface TestUser {
  email: string;
  password: string;
  name: string;
}

export interface AuthFixtures {
  testUser: TestUser;
  authenticatedPage: Page;
  login: (page: Page, email: string, password: string) => Promise<void>;
  register: (
    page: Page,
    email: string,
    password: string,
    name: string,
  ) => Promise<void>;
  logout: (page: Page) => Promise<void>;
}

/**
 * Login helper function
 */
const login = async (page: Page, email: string, password: string) => {
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");

  // Ensure we're on login tab (not register)
  const existingUserTab = page.getByRole("radio", { name: "Existing user" });
  if (await existingUserTab.isVisible()) {
    await existingUserTab.click();
  }

  // Fill login form
  await page.getByPlaceholder("person@somemail.com").fill(email);
  await page.locator('input[type="password"]').fill(password);

  // Submit and wait for navigation
  await page.getByRole("button", { name: "Login" }).click();

  // Wait for redirect to app
  await expect(page).toHaveURL(/\/app/, { timeout: 10000 });
};

/**
 * Register helper function
 */
const register = async (
  page: Page,
  email: string,
  password: string,
  name: string,
) => {
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");

  // Switch to register tab
  await page.getByRole("radio", { name: "New user" }).click();

  // Fill registration form
  await page.getByPlaceholder("person@somemail.com").fill(email);
  await page.getByPlaceholder("John Doe").fill(name);
  await page.locator('input[type="password"]').fill(password);

  // Submit and wait for navigation
  await page.getByRole("button", { name: "Create Account" }).click();

  // Wait for redirect to app
  await expect(page).toHaveURL(/\/app/, { timeout: 10000 });
};

/**
 * Logout helper function
 */
const logout = async (page: Page) => {
  // Open sidebar if on mobile or collapsed
  page
    .getByRole("button")
    .filter({ has: page.locator("svg") })
    .first();

  // Try to find and click the user menu in sidebar
  const userMenuButton = page
    .locator('[data-sidebar="footer"]')
    .getByRole("button");

  if (await userMenuButton.isVisible()) {
    await userMenuButton.click();
    await page.getByText("Sign out").click();
  } else {
    // Fallback: navigate to settings and sign out
    await page.goto("/app/settings");
    await page.getByRole("button", { name: "Sign out" }).click();
  }

  // Wait for redirect to login
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
};

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  testUser: async (_fixtures, use) => {
    const user = generateTestUser();
    await use(user);
  },

  login: async (_fixtures, use) => {
    await use(login);
  },

  register: async (_fixtures, use) => {
    await use(register);
  },

  logout: async (_fixtures, use) => {
    await use(logout);
  },

  authenticatedPage: async ({ page, testUser, register }, use) => {
    // Register a new test user and authenticate
    await register(page, testUser.email, testUser.password, testUser.name);
    await use(page);
  },
});

export { expect };
