import { expect, test } from "./fixtures/auth.fixture";

test.describe("Number Trackable Data Entry", () => {
  let trackableId: string;
  let trackableName: string;

  test.beforeEach(async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    trackableName = `E2E Number ${Date.now()}`;

    // Create a number trackable
    await page.goto("/app/create");

    await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);
    // Select number type from radio group
    await page.getByRole("radio", { name: /Number/i }).click();
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
      timeout: 10000,
    });

    // Extract trackable ID from URL
    const url = page.url();
    trackableId = url.match(/trackables\/([^/]+)/)?.[1] ?? "";
  });

  test("should enter a number value", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto(`/app/trackables/${trackableId}/view`);

    // Find the first day cell with data-empty attribute (number cells have this)
    const dayCell = page.locator("[data-number-cell]").first();
    await expect(dayCell).toBeVisible({ timeout: 10000 });

    // Find the input inside - it has opacity-0 but is still focusable
    const input = dayCell.locator("input");

    // Focus and enter the value
    await input.focus();
    await expect(input).toBeFocused({ timeout: 5000 });
    await input.fill("42");

    // Wait for debounce (300ms) + buffer before blur
    await page.waitForTimeout(500);
    await input.blur();
    await page.waitForTimeout(200); // Wait for UI update

    // Verify the value is displayed (data-empty becomes false when value != 0)
    await expect(dayCell).toHaveAttribute("data-empty", "false", {
      timeout: 10000,
    });
  });

  test("should persist number value after page reload", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto(`/app/trackables/${trackableId}/view`);

    const dayCell = page.locator("[data-number-cell]").first();
    const input = dayCell.locator("input");

    await input.focus();
    await input.fill("100");
    await input.press("Enter");
    await page.waitForTimeout(500);

    // Wait for the value to be saved
    await expect(dayCell).toHaveAttribute("data-empty", "false", {
      timeout: 10000,
    });

    // Reload the page
    await page.reload();

    // Value should persist
    const reloadedCell = page.locator('[data-empty="false"]').first();
    await expect(reloadedCell).toBeVisible({ timeout: 10000 });
  });

  test("should handle decimal numbers", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto(`/app/trackables/${trackableId}/view`);

    const dayCell = page.locator("[data-number-cell]").first();
    const input = dayCell.locator("input");

    await input.focus();
    await input.fill("3.14");
    await input.press("Enter");
    await page.waitForTimeout(500);

    await expect(dayCell).toHaveAttribute("data-empty", "false", {
      timeout: 10000,
    });

    // Reload and verify
    await page.reload();

    const reloadedCell = page.locator('[data-empty="false"]').first();
    await expect(reloadedCell).toBeVisible({ timeout: 10000 });
  });

  test("should update existing value", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto(`/app/trackables/${trackableId}/view`);

    const dayCell = page.locator("[data-number-cell]").first();
    const input = dayCell.locator("input");

    // Enter initial value
    await input.focus();
    await input.fill("50");
    await input.press("Enter");
    await page.waitForTimeout(500);

    await expect(dayCell).toHaveAttribute("data-empty", "false", {
      timeout: 10000,
    });

    // Update the value
    await input.focus();
    await input.fill("75");
    await input.press("Enter");
    await page.waitForTimeout(500);

    // Reload and verify update persisted
    await page.reload();

    const reloadedCell = page.locator('[data-empty="false"]').first();
    await expect(reloadedCell).toBeVisible({ timeout: 10000 });
  });

  test("should clear value when set to 0", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto(`/app/trackables/${trackableId}/view`);

    const dayCell = page.locator("[data-number-cell]").first();
    const input = dayCell.locator("input");

    await input.focus();
    await input.fill("42");
    await input.press("Enter");
    await page.waitForTimeout(500);

    await expect(dayCell).toHaveAttribute("data-empty", "false", {
      timeout: 10000,
    });

    // Set to 0
    await input.focus();
    await input.fill("0");
    await input.press("Enter");
    await page.waitForTimeout(500);

    // 0 should show as empty
    await expect(dayCell).toHaveAttribute("data-empty", "true", {
      timeout: 10000,
    });
  });

  test("should reject invalid input", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto(`/app/trackables/${trackableId}/view`);

    const dayCell = page.locator("[data-number-cell]").first();
    const input = dayCell.locator("input");

    await input.focus();
    await input.fill("abc");
    await input.press("Enter");
    await page.waitForTimeout(500);

    // Should remain empty or revert to 0
    await expect(dayCell).toHaveAttribute("data-empty", "true", {
      timeout: 10000,
    });
  });

  test("should format large numbers with compact notation", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto(`/app/trackables/${trackableId}/view`);

    const dayCell = page.locator("[data-number-cell]").first();
    const input = dayCell.locator("input");

    await input.focus();
    await input.fill("15000");
    await input.press("Enter");
    await page.waitForTimeout(500);

    await expect(dayCell).toHaveAttribute("data-empty", "false", {
      timeout: 10000,
    });

    // The display should show compact notation (15K)
    // Check if "15K" or similar compact format is visible
    await expect(page.getByText(/15K/)).toBeVisible({ timeout: 5000 });
  });
});
