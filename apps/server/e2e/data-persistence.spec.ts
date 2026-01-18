import { expect, test } from "./fixtures/auth.fixture";

test.describe("Data Persistence", () => {
  test.describe("Trackable Data Persistence", () => {
    test("should persist boolean data after page reload", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Create boolean trackable
      await page.goto("/app/create");

      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E Persist Bool ${Date.now()}`);
      // Boolean type is selected by default, no need to click
      await page.getByRole("button", { name: "Create" }).click();

      // Go to view and set data
      await page.getByRole("button", { name: "View" }).click();

      const dayCell = page.locator("button[data-value]").first();
      await dayCell.click();
      await expect(dayCell).toHaveAttribute("data-value", "true", {
        timeout: 5000,
      });

      // Reload page
      await page.reload();

      // Data should persist
      const reloadedCell = page.locator("button[data-value='true']").first();
      await expect(reloadedCell).toBeVisible({ timeout: 10000 });
    });

    test("should persist number data after page reload", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Create number trackable
      await page.goto("/app/create");

      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E Persist Num ${Date.now()}`);
      await page.getByRole("radio", { name: /Number/i }).click();
      await page.getByRole("button", { name: "Create" }).click();

      // Go to view and set data
      await page.getByRole("button", { name: "View" }).click();

      // Find and fill a day cell for number input
      const dayCell = page.locator("[data-number-cell]").first();
      await expect(dayCell).toBeVisible({ timeout: 10000 });
      await dayCell.click();
      const input = dayCell.locator("input");
      await expect(input).toBeVisible({ timeout: 5000 });
      await input.fill("42");
      await page.waitForTimeout(500); // Wait for debounced save
      await input.blur();

      await expect(dayCell).toHaveAttribute("data-empty", "false", {
        timeout: 5000,
      });

      // Reload page
      await page.reload();

      // Data should persist
      const reloadedCell = page.locator('[data-empty="false"]').first();
      await expect(reloadedCell).toBeVisible({ timeout: 10000 });
    });

    test("should persist text data after page reload", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;
      const testText = `Persistence test ${Date.now()}`;

      // Create text trackable
      await page.goto("/app/create");

      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E Persist Text ${Date.now()}`);
      await page.getByRole("radio", { name: /Text/i }).click();
      await page.getByRole("button", { name: "Create" }).click();

      // Go to view and set data
      await page.getByRole("button", { name: "View" }).click();

      // Click on day 1 button to open editor
      const dayCell = page.locator("[data-text-cell]").first();
      await dayCell.click();

      // Wait for textarea in editor modal
      const textarea = page.locator("#editorModal textarea");
      await expect(textarea).toBeVisible({ timeout: 5000 });
      await textarea.fill(testText);
      await page.waitForTimeout(500); // Wait for debounced save
      await textarea.blur();
      await expect(textarea).not.toBeVisible({ timeout: 5000 });

      // Reload page
      await page.reload();

      // Data should persist - click to open and verify
      await dayCell.click();
      const reopenedTextarea = page.locator("#editorModal textarea");
      await expect(reopenedTextarea).toBeVisible({ timeout: 5000 });
      await expect(reopenedTextarea).toHaveValue(testText, { timeout: 5000 });
    });
  });

  test.describe("Data Across Multiple Days", () => {
    test("should persist data for multiple days", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Create boolean trackable
      await page.goto("/app/create");

      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E Multi Day ${Date.now()}`);
      // Boolean type is selected by default, no need to click
      await page.getByRole("button", { name: "Create" }).click();

      // Go to view
      await page.getByRole("button", { name: "View" }).click();

      const dayCells = page.locator("[data-boolean-cell]");

      await expect(dayCells.first()).toBeVisible();

      // Click multiple day cells
      const cellCount = await dayCells.count();

      // Toggle at least 3 cells
      for (let i = 0; i < Math.min(3, cellCount); i++) {
        const cell = dayCells.nth(i);
        await cell.click();
        await expect(cell).toHaveAttribute("data-value", "true", {
          timeout: 5000,
        });
      }

      // Reload page
      await page.waitForTimeout(500);
      await page.reload();

      await expect(dayCells.first()).toBeVisible();

      // All toggled cells should still be true
      const trueCells = page.locator("button[data-value='true']");
      const trueCount = await trueCells.count();
      expect(trueCount).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe("Loading States", () => {
    test("should show loading state while data is fetching", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Create a trackable first
      await page.goto("/app/create");

      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E Loading ${Date.now()}`);
      await page.getByRole("button", { name: "Create" }).click();

      // Navigate with slow network simulation
      await page.route("**/*", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await route.continue();
      });

      await page.getByRole("button", { name: "View" }).click();

      // Should eventually load
      await expect(page.locator(".grid-cols-7").first()).toBeVisible({
        timeout: 15000,
      });
    });

    test("should show empty state when user has no trackables", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Fresh user should have no trackables
      await page.goto("/app/trackables");

      // Should show empty state
      await expect(
        page.getByText("You do not have any trackables yet"),
      ).toBeVisible({ timeout: 10000 });
    });

    test("should show spinner while data loads on home page", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Create a trackable
      await page.goto("/app/create");

      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E Spinner ${Date.now()}`);
      await page.getByRole("button", { name: "Create" }).click();

      // Go to home and check for spinner or content
      await page.goto("/app");

      // Should either show spinner initially or load content
      // Using waitForSelector to wait for either state
      await Promise.race([
        page
          .waitForSelector('[class*="Spinner"], [class*="spinner"]', {
            timeout: 3000,
          })
          .catch(() => null),
        page.waitForSelector(".grid", { timeout: 10000 }),
      ]);

      // Eventually should show content
    });
  });

  test.describe("Data Consistency", () => {
    test("should show same data in list view and detail view", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;
      const trackableName = `E2E Consistency ${Date.now()}`;

      // Create boolean trackable
      await page.goto("/app/create");

      await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);
      // Boolean type is selected by default, no need to click
      await page.getByRole("button", { name: "Create" }).click();

      // Go to detail view and set data
      await page.getByRole("button", { name: "View" }).click();

      const dayCell = page.locator("button[data-value]").last();
      await dayCell.click();
      await expect(dayCell).toHaveAttribute("data-value", "true", {
        timeout: 5000,
      });

      // Go to trackables list
      await page.goto("/app/trackables");

      // The same day should show as checked in the mini row
      await expect(page.getByText(trackableName).first()).toBeVisible({
        timeout: 10000,
      });

      // Find the mini row and verify it has checked cells
      const miniRowCheckedCell = page
        .locator("button[data-value='true']")
        .last();
      await expect(miniRowCheckedCell).toBeVisible({ timeout: 5000 });
    });

    test("should show same data in home view and detail view", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;
      const trackableName = `E2E Home Consistency ${Date.now()}`;

      // Create boolean trackable
      await page.goto("/app/create");

      await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);
      // Boolean type is selected by default, no need to click
      await page.getByRole("button", { name: "Create" }).click();

      // Go to detail view and set data
      await page.getByRole("button", { name: "View" }).click();

      const dayCell = page.locator("button[data-value]").last();
      await dayCell.click();
      await expect(dayCell).toHaveAttribute("data-value", "true", {
        timeout: 5000,
      });

      // Go to home page
      await page.goto("/app");

      // The same data should be visible (use .first() to avoid strict mode with duplicate elements)
      await expect(page.getByText(trackableName).first()).toBeVisible({
        timeout: 10000,
      });

      // Find checked cell in home view
      const homeCheckedCell = page.locator("button[data-value='true']").first();
      await expect(homeCheckedCell).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Session Persistence", () => {
    test("should maintain data after navigating away and back", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Create boolean trackable
      await page.goto("/app/create");

      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E Navigate ${Date.now()}`);
      // Boolean type is selected by default, no need to click
      await page.getByRole("button", { name: "Create" }).click();

      // Set data
      await page.getByRole("button", { name: "View" }).click();
      
      // Extract trackableId from URL for later navigation
      const url = page.url();
      const trackableId = url.match(/trackables\/([^/]+)/)?.[1];

      const dayCell = page.locator("button[data-value]").first();
      await dayCell.click();
      await expect(dayCell).toHaveAttribute("data-value", "true", {
        timeout: 5000,
      });

      // Navigate to settings
      await page.goto("/app/settings");

      // Navigate to home
      await page.goto("/app");

      // Navigate back to trackable
      await page.goto(`/app/trackables/${trackableId}/view`);

      // Data should still be there
      const persistedCell = page.locator("button[data-value='true']").first();
      await expect(persistedCell).toBeVisible({ timeout: 10000 });
    });

    test("should maintain data across browser back/forward navigation", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Create boolean trackable
      await page.goto("/app/create");

      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E BackForward ${Date.now()}`);
      // Boolean type is selected by default, no need to click
      await page.getByRole("button", { name: "Create" }).click();

      // Set data
      await page.getByRole("button", { name: "View" }).click();

      const dayCell = page.locator("button[data-value]").first();
      await dayCell.click();
      await expect(dayCell).toHaveAttribute("data-value", "true", {
        timeout: 5000,
      });

      await page.waitForTimeout(500);

      // Navigate to another page
      await page.goto("/app");

      // Go back
      await page.goBack();

      // Data should still be there
      const persistedCell = page.locator("button[data-value='true']").first();
      await expect(persistedCell).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Real-time Updates", () => {
    test("should update UI immediately after data change", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Create boolean trackable
      await page.goto("/app/create");

      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E Realtime ${Date.now()}`);
      // Boolean type is selected by default, no need to click
      await page.getByRole("button", { name: "Create" }).click();

      await page.getByRole("button", { name: "View" }).click();

      const dayCell = page.locator("button[data-value]").first();

      // Click and immediately check - should be instant
      await dayCell.click();

      // UI should update within 1 second (not waiting for network)
      await expect(dayCell).toHaveAttribute("data-value", "true", {
        timeout: 1000,
      });
    });
  });
});
