import { expect, test } from "./fixtures/auth.fixture";

test.describe("Trackable CRUD Operations", () => {
  test.describe("Create Trackable", () => {
    test("should create a boolean trackable", async ({ authenticatedPage }) => {
      const page = authenticatedPage;
      const trackableName = `E2E Boolean ${Date.now()}`;

      // Navigate to create page
      await page.goto("/app/create");
      await page.waitForLoadState("networkidle");

      // Fill in name
      await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);

      // Boolean type is selected by default (it's a radio group)
      // Just verify it's selected
      await expect(page.getByRole("radio", { name: /Boolean/i })).toBeChecked();

      // Create trackable
      await page.getByRole("button", { name: "Create" }).click();

      // Should redirect to settings page
      await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
        timeout: 10000,
      });

      // Navigate to trackables list
      await page.goto("/app/trackables");
      await page.waitForLoadState("networkidle");

      // Verify trackable appears in list
      await expect(page.getByText(trackableName).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("should create a number trackable", async ({ authenticatedPage }) => {
      const page = authenticatedPage;
      const trackableName = `E2E Number ${Date.now()}`;

      await page.goto("/app/create");
      await page.waitForLoadState("networkidle");

      await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);

      // Select number type from radio group
      await page.getByRole("radio", { name: /Number/i }).click();

      await page.getByRole("button", { name: "Create" }).click();

      await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
        timeout: 10000,
      });

      await page.goto("/app/trackables");
      await page.waitForLoadState("networkidle");

      await expect(page.getByText(trackableName).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("should create a text trackable", async ({ authenticatedPage }) => {
      const page = authenticatedPage;
      const trackableName = `E2E Text ${Date.now()}`;

      await page.goto("/app/create");
      await page.waitForLoadState("networkidle");

      await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);

      // Select text type from radio group
      await page.getByRole("radio", { name: /Text/i }).click();

      await page.getByRole("button", { name: "Create" }).click();

      await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
        timeout: 10000,
      });

      await page.goto("/app/trackables");
      await page.waitForLoadState("networkidle");

      await expect(page.getByText(trackableName).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("should create trackable with empty name as 'Unnamed'", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto("/app/create");
      await page.waitForLoadState("networkidle");

      // Don't fill in name, just create
      await page.getByRole("button", { name: "Create" }).click();

      await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
        timeout: 10000,
      });

      // The trackable should exist (even without a name)
      await page.goto("/app/trackables");
      await page.waitForLoadState("networkidle");

      // Look for "Unnamed" in the sidebar or list
      await expect(page.getByText("Unnamed").first()).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("Delete Trackable", () => {
    test("should delete trackable with confirmation", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;
      const trackableName = `E2E Delete Test ${Date.now()}`;

      // First create a trackable
      await page.goto("/app/create");
      await page.waitForLoadState("networkidle");
      await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);
      await page.getByRole("button", { name: "Create" }).click();
      await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
        timeout: 10000,
      });

      // Get the trackable ID from URL
      const url = page.url();
      const trackableId = url.match(/trackables\/([^/]+)/)?.[1];
      expect(trackableId).toBeTruthy();

      // The dropdown menu trigger is a button next to the Favorite and View buttons
      // Find it by locating the Favorite button's parent container and then the last button
      const favoriteButton = page.getByRole("button", { name: "Favorite" });
      const buttonContainer = favoriteButton.locator(".."); // parent of Favorite button
      const moreOptionsButton = buttonContainer.locator("button").last();
      await moreOptionsButton.click();

      // Click Delete in the dropdown menu
      await page.getByRole("menuitem", { name: "Delete" }).click();

      // Confirm deletion in dialog
      await expect(page.getByText("Are you absolutely sure?")).toBeVisible({
        timeout: 5000,
      });
      await page.getByRole("button", { name: "Delete" }).click();

      // Should redirect to trackables list
      await expect(page).toHaveURL(/\/app\/trackables/, { timeout: 10000 });

      // Verify trackable no longer appears
      await page.waitForLoadState("networkidle");
      await expect(page.getByText(trackableName)).not.toBeVisible({
        timeout: 5000,
      });
    });

    test("should cancel deletion when clicking cancel", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;
      const trackableName = `E2E Cancel Delete ${Date.now()}`;

      // Create a trackable
      await page.goto("/app/create");
      await page.waitForLoadState("networkidle");
      await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);
      await page.getByRole("button", { name: "Create" }).click();
      await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
        timeout: 10000,
      });

      const url = page.url();
      const trackableId = url.match(/trackables\/([^/]+)/)?.[1];

      // Open the more options menu
      const favoriteButton = page.getByRole("button", { name: "Favorite" });
      const buttonContainer = favoriteButton.locator("..");
      const moreOptionsButton = buttonContainer.locator("button").last();
      await moreOptionsButton.click();

      // Click Delete in menu
      await page.getByRole("menuitem", { name: "Delete" }).click();

      // Cancel deletion
      await expect(page.getByText("Are you absolutely sure?")).toBeVisible({
        timeout: 5000,
      });
      await page.getByRole("button", { name: "Cancel" }).click();

      // Should still be on the same page
      await expect(page).toHaveURL(new RegExp(trackableId!));

      // Trackable should still exist
      await page.goto("/app/trackables");
      await expect(page.getByText(trackableName).first()).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("Archive Trackable", () => {
    test("should archive trackable", async ({ authenticatedPage }) => {
      const page = authenticatedPage;
      const trackableName = `E2E Archive Test ${Date.now()}`;

      // Create a trackable
      await page.goto("/app/create");
      await page.waitForLoadState("networkidle");
      await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);
      await page.getByRole("button", { name: "Create" }).click();
      await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
        timeout: 10000,
      });

      // Open the more options menu using exact match on Favorite button
      const favoriteButton = page.getByRole("button", {
        name: "Favorite",
        exact: true,
      });
      const buttonContainer = favoriteButton.locator("..");
      const moreOptionsButton = buttonContainer.locator("button").last();
      await moreOptionsButton.click();

      // Click Archive in menu
      await page.getByRole("menuitem", { name: "Archive" }).click();

      // Go to trackables list - should not appear in main list
      await page.goto("/app/trackables");
      await page.waitForLoadState("networkidle");

      // The trackable should not be in the main list
      await expect(page.getByText(trackableName)).not.toBeVisible({
        timeout: 5000,
      });

      // Click "Archive" link/button to view archived trackables
      await page.getByRole("button", { name: "Archive" }).click();
      await page.waitForLoadState("networkidle");

      // Should appear in archived list
      await expect(page.getByText(trackableName).first()).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("Favorite Trackable", () => {
    test("should favorite and unfavorite trackable", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;
      const trackableName = `E2E Favorite Test ${Date.now()}`;

      // Create a trackable
      await page.goto("/app/create");
      await page.waitForLoadState("networkidle");
      await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);
      await page.getByRole("button", { name: "Create" }).click();
      await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
        timeout: 10000,
      });

      // The Favorite button is in the header on the settings page
      // Use exact match to avoid matching the trackable name button
      const favoriteButton = page.getByRole("button", {
        name: "Favorite",
        exact: true,
      });
      await expect(favoriteButton).toBeVisible({ timeout: 5000 });
      await favoriteButton.click();

      // Wait for the state to update - button should now say "Unfavorite"
      await expect(
        page.getByRole("button", { name: /Unfavorite/i }),
      ).toBeVisible({ timeout: 5000 });

      // Unfavorite
      await page.getByRole("button", { name: /Unfavorite/i }).click();

      // Should be back to "Favorite"
      await expect(
        page.getByRole("button", { name: "Favorite", exact: true }),
      ).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe("Trackables List", () => {
    test("should display empty state when no trackables", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Fresh user should have empty state
      await page.goto("/app/trackables");
      await page.waitForLoadState("networkidle");

      await expect(
        page.getByText("You do not have any trackables yet"),
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByRole("button", { name: "Create Trackable" }),
      ).toBeVisible();
    });

    test("should navigate to create page from empty state", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      await page.goto("/app/trackables");
      await page.waitForLoadState("networkidle");

      await page.getByRole("button", { name: "Create Trackable" }).click();

      await expect(page).toHaveURL(/\/app\/create/);
    });

    test("should toggle between trackables and archive views", async ({
      authenticatedPage,
    }) => {
      const page = authenticatedPage;

      // Create a trackable first
      await page.goto("/app/create");
      await page.waitForLoadState("networkidle");
      await page
        .getByPlaceholder("Unnamed Trackable")
        .fill(`E2E Toggle ${Date.now()}`);
      await page.getByRole("button", { name: "Create" }).click();
      await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
        timeout: 10000,
      });

      // Go to trackables list
      await page.goto("/app/trackables");
      await page.waitForLoadState("networkidle");

      // Should show "Your Trackables" heading
      await expect(page.getByText("Your Trackables")).toBeVisible();

      // Click Archive button
      await page.getByRole("button", { name: "Archive" }).click();

      // Should show "Archive" heading
      await expect(page.getByText("Archive")).toBeVisible();

      // Click Trackables button to go back
      await page.getByRole("button", { name: "Trackables" }).click();

      // Should show "Your Trackables" again
      await expect(page.getByText("Your Trackables")).toBeVisible();
    });
  });
});
