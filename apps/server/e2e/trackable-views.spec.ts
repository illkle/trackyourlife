import { addMonths, format, subMonths } from "date-fns";

import { expect, test } from "./fixtures/auth.fixture";

test.describe("Trackable Views", () => {
  let trackableId: string;
  let trackableName: string;

  test.beforeEach(async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    trackableName = `E2E View Test ${Date.now()}`;

    // Create a boolean trackable for testing views
    await page.goto("/app/create");
    

    await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);
    // Boolean type is selected by default
    await expect(page.getByRole("radio", { name: /Boolean/i })).toBeChecked();
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
      timeout: 10000,
    });

    const url = page.url();
    trackableId = url.match(/trackables\/([^/]+)/)?.[1] ?? "";
  });

  test.describe("Daily List View (Home)", () => {
    test("should display trackables in daily list on home page", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto("/app");
      

      // Should see the trackable name
      await expect(page.getByText(trackableName).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("should show days organized by date", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto("/app");
      

      // Should show day names (Monday, Tuesday, etc.)
      const dayNames = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      for (const day of dayNames) {
        await expect(page.getByText(day).first()).toBeVisible({
          timeout: 1000,
        });
      }
    });

    test("should show month header", async ({ authenticatedPage }) => {
      const page = authenticatedPage;

      await page.goto("/app");
      

      // Current month should be visible
      const currentMonth = format(new Date(), "MMMM");
      await expect(page.getByText(currentMonth).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("should navigate to trackable view when clicking trackable name", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto("/app");
      

      // Click on trackable name
      await page.getByText(trackableName).first().click();

      // Should navigate to trackable view
      await expect(page).toHaveURL(
        new RegExp(`/app/trackables/${trackableId}`),
        {
          timeout: 10000,
        },
      );
    });
  });

  test.describe("Month Calendar View", () => {
    test("should display month calendar with days", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto(`/app/trackables/${trackableId}/view`);
      

      // Should show a grid of day cells (7 columns for week)
      const dayCells = page.locator(".grid-cols-7");
      await expect(dayCells.first()).toBeVisible({ timeout: 10000 });
    });

    test("should show day numbers in calendar", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto(`/app/trackables/${trackableId}/view`);
      

      // Day numbers 1-31 should be visible (some subset)
      await expect(page.getByText("1").first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText("15").first()).toBeVisible();
    });

    test("should highlight today", async ({ authenticatedPage }) => {
      const page = authenticatedPage;

      await page.goto(`/app/trackables/${trackableId}/view`);
      

      // Today's date should have underline or special styling
      const today = format(new Date(), "d");
      const todayCell = page.locator(`.underline:has-text("${today}")`).first();

      // Either the cell itself or a label inside should indicate today
      await expect(todayCell).toBeVisible({ timeout: 10000 });
    });

    test("should navigate to previous month", async ({ authenticatedPage }) => {
      const page = authenticatedPage;
      const now = new Date();
      const previousMonth = format(subMonths(now, 1), "MMMM");

      await page.goto(`/app/trackables/${trackableId}/view`);
      

      // Find and click previous month button
      const prevButton = page.getByRole("button", {
        name: /previous|prev|←|</i,
      });
      if (await prevButton.isVisible()) {
        await prevButton.click();

        // Should show previous month
        await expect(page.getByText(previousMonth).first()).toBeVisible({
          timeout: 5000,
        });
      }
    });

    test("should navigate to next month", async ({ authenticatedPage }) => {
      const page = authenticatedPage;
      const now = new Date();
      const nextMonth = format(addMonths(now, 1), "MMMM");

      await page.goto(`/app/trackables/${trackableId}/view`);
      

      // Find and click next month button
      const nextButton = page.getByRole("button", { name: /next|→|>/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Should show next month
        await expect(page.getByText(nextMonth).first()).toBeVisible({
          timeout: 5000,
        });
      }
    });
  });

  test.describe("Trackables List View", () => {
    test("should display all trackables with mini rows", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Create another trackable
      await page.goto("/app/create");
      
      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E Second ${Date.now()}`);
      await page.getByRole("button", { name: "Create" }).click();
      await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
        timeout: 10000,
      });

      // Go to trackables list
      await page.goto("/app/trackables");
      

      // Should show both trackables (use .first() to avoid strict mode with sidebar)
      await expect(page.getByText(trackableName).first()).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText(/E2E Second/).first()).toBeVisible();
    });

    test("should show recent days data in mini row", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // First set some data
      await page.goto(`/app/trackables/${trackableId}/view`);
      

      const dayCell = page.locator("button[data-value]").first();
      await dayCell.click();
      await expect(dayCell).toHaveAttribute("data-value", "true", {
        timeout: 5000,
      });

      // Go to trackables list
      await page.goto("/app/trackables");
      

      // The mini row should show day cells
      const miniRow = page
        .locator(".grid")
        .filter({ has: page.locator("button[data-value]") })
        .first();
      await expect(miniRow).toBeVisible({ timeout: 10000 });
    });

    test("should navigate to trackable view when clicking row", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto("/app/trackables");
      

      // Click on trackable link (use .last() to get the main content link, not sidebar)
      await page.getByRole("link", { name: trackableName }).last().click();

      // Should navigate to trackable view
      await expect(page).toHaveURL(
        new RegExp(`/app/trackables/${trackableId}`),
        {
          timeout: 10000,
        },
      );
    });
  });

  test.describe("View Type Toggle", () => {
    test("should toggle between calendar and list view in month view", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto(`/app/trackables/${trackableId}/view`);
      

      // Look for view toggle buttons (calendar/list icons or text)
      const listViewButton = page.getByRole("button", { name: /list/i });
      const calendarViewButton = page.getByRole("button", {
        name: /calendar/i,
      });

      if (await listViewButton.isVisible()) {
        await listViewButton.click();

        // Should show list layout
        

        // Toggle back to calendar
        if (await calendarViewButton.isVisible()) {
          await calendarViewButton.click();

          // Should show calendar grid again
          const calendarGrid = page.locator(".grid-cols-7");
          await expect(calendarGrid.first()).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe("Sidebar Navigation", () => {
    test("should display trackables in sidebar", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto("/app");
      

      // Open sidebar if collapsed
      const sidebarToggle = page
        .locator("button")
        .filter({ has: page.locator('[class*="PanelLeft"]') })
        .first();
      if (await sidebarToggle.isVisible()) {
        await sidebarToggle.click();
      }

      // Sidebar should show the trackable
      const sidebar = page.locator("[data-sidebar]");
      await expect(sidebar.getByText(trackableName)).toBeVisible({
        timeout: 10000,
      });
    });

    test("should navigate to trackable from sidebar", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto("/app");
      

      // Click trackable in sidebar
      const sidebar = page.locator("[data-sidebar]");
      await sidebar.getByText(trackableName).click();

      // Should navigate to trackable view
      await expect(page).toHaveURL(
        new RegExp(`/app/trackables/${trackableId}`),
        {
          timeout: 10000,
        },
      );
    });

    test("should show favorite indicator in sidebar", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // First favorite the trackable
      await page.goto(`/app/trackables/${trackableId}/view`);
      

      const favoriteButton = page.getByRole("button", { name: /favorite/i });
      if (await favoriteButton.isVisible()) {
        await favoriteButton.click();
        await expect(
          page.getByRole("button", { name: /unfavorite/i }),
        ).toBeVisible({ timeout: 5000 });
      }

      // Check sidebar for heart icon
      await page.goto("/app");
      

      const sidebar = page.locator("[data-sidebar]");
      const trackableRow = sidebar
        .locator(`text=${trackableName}`)
        .locator("..");

      // Should have heart icon
      const heartIcon = trackableRow.locator("svg");
      await expect(heartIcon).toBeVisible({ timeout: 5000 });
    });
  });
});
