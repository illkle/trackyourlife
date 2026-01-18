import { expect, test } from "./fixtures/auth.fixture";

test.describe("Boolean Trackable Data Entry", () => {
  let trackableId: string;
  let trackableName: string;

  test.beforeEach(async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    trackableName = `E2E Boolean ${Date.now()}`;

    // Create a boolean trackable
    await page.goto("/app/create");
    

    await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);
    // Boolean type is selected by default (it's a radio group)
    await expect(page.getByRole("radio", { name: /Boolean/i })).toBeChecked();
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
      timeout: 10000,
    });

    // Extract trackable ID from URL
    const url = page.url();
    trackableId = url.match(/trackables\/([^/]+)/)?.[1] ?? "";
  });

  test("should toggle boolean value from false to true", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    // Go to trackable view
    await page.goto(`/app/trackables/${trackableId}/view`);
    

    // Find a day cell (today's cell should be clickable)
    const todayCell = page.locator("button[data-value]").first();
    await expect(todayCell).toBeVisible({ timeout: 10000 });

    // Initial state should be false
    await expect(todayCell).toHaveAttribute("data-value", "false");

    // Click to toggle
    await todayCell.click();

    // Should now be true
    await expect(todayCell).toHaveAttribute("data-value", "true", {
      timeout: 5000,
    });
  });

  test("should toggle boolean value from true back to false", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await page.goto(`/app/trackables/${trackableId}/view`);
    

    const todayCell = page.locator("button[data-value]").first();
    await expect(todayCell).toBeVisible({ timeout: 10000 });

    // Toggle to true
    await todayCell.click();
    await expect(todayCell).toHaveAttribute("data-value", "true", {
      timeout: 5000,
    });

    // Toggle back to false
    await todayCell.click();
    await expect(todayCell).toHaveAttribute("data-value", "false", {
      timeout: 5000,
    });
  });

  test("should persist boolean value after page reload", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await page.goto(`/app/trackables/${trackableId}/view`);
    

    const todayCell = page.locator("button[data-value]").first();
    await expect(todayCell).toBeVisible({ timeout: 10000 });

    // Toggle to true
    await todayCell.click();
    await expect(todayCell).toHaveAttribute("data-value", "true", {
      timeout: 5000,
    });

    // Reload the page
    await page.reload();
    

    // Value should still be true
    const reloadedCell = page.locator("button[data-value]").first();
    await expect(reloadedCell).toHaveAttribute("data-value", "true", {
      timeout: 10000,
    });
  });

  test("should display boolean in daily list view", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    // Navigate to view page with current month
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    await page.goto(
      `/app/trackables/${trackableId}/view?month=${month}&year=${year}`,
    );
    

    // Wait for cells to be available
    await page.waitForSelector("button[data-value]", { timeout: 10000 });

    // Set a value
    const todayCell = page.locator("button[data-value]").first();
    await todayCell.click();
    await expect(todayCell).toHaveAttribute("data-value", "true", {
      timeout: 5000,
    });

    // Go to home page (daily list view)
    await page.goto("/app");
    

    // Should see the trackable in the daily list (use link instead of text to be more specific)
    await expect(
      page.getByRole("link", { name: trackableName }).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display boolean in trackables list view", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    // First set a value
    await page.goto(`/app/trackables/${trackableId}/view`);
    

    const todayCell = page.locator("button[data-value]").first();
    await todayCell.click();
    await expect(todayCell).toHaveAttribute("data-value", "true", {
      timeout: 5000,
    });

    // Go to trackables list
    await page.goto("/app/trackables");
    

    // Should see the trackable with its mini row
    await expect(page.getByText(trackableName).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("should handle keyboard navigation", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto(`/app/trackables/${trackableId}/view`);
    

    const todayCell = page.locator("button[data-value]").first();
    await expect(todayCell).toBeVisible({ timeout: 10000 });

    // Focus and press Enter
    await todayCell.focus();
    await page.keyboard.press("Enter");

    // Should toggle
    await expect(todayCell).toHaveAttribute("data-value", "true", {
      timeout: 5000,
    });

    // Press Enter again
    await page.keyboard.press("Enter");

    // Should toggle back
    await expect(todayCell).toHaveAttribute("data-value", "false", {
      timeout: 5000,
    });
  });

  test("should show multiple days in month view", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    // Navigate to view page with current month
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    await page.goto(
      `/app/trackables/${trackableId}/view?month=${month}&year=${year}`,
    );
    

    // Wait for the calendar grid to be rendered
    await page.waitForSelector("button[data-value]", { timeout: 10000 });

    // Get all clickable day cells (only days up to today are buttons)
    const dayCells = page.locator("button[data-value]");
    const count = await dayCells.count();

    // Should have at least some cells (days up to current date)
    expect(count).toBeGreaterThanOrEqual(1);

    // Toggle a few cells
    const cellsToToggle = Math.min(count, 3);
    for (let i = 0; i < cellsToToggle; i++) {
      const cell = dayCells.nth(i);
      if ((await cell.getAttribute("data-value")) === "false") {
        await cell.click();
        await expect(cell).toHaveAttribute("data-value", "true", {
          timeout: 5000,
        });
      }
    }
  });
});
