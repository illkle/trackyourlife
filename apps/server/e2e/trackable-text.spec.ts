import { expect, test } from "./fixtures/auth.fixture";

test.describe("Text Trackable Data Entry", () => {
  let trackableId: string;
  let trackableName: string;

  test.beforeEach(async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    trackableName = `E2E Text ${Date.now()}`;

    // Create a text trackable
    await page.goto("/app/create");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("Unnamed Trackable").fill(trackableName);
    // Select text type from radio group
    await page.getByRole("radio", { name: /Text/i }).click();
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(/\/app\/trackables\/.*\/settings/, {
      timeout: 10000,
    });

    // Extract trackable ID from URL
    const url = page.url();
    trackableId = url.match(/trackables\/([^/]+)/)?.[1] ?? "";
  });

  test("should open text popup editor when clicking day cell", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    // Navigate to view (will redirect to include month/year params)
    await page.goto(`/app/trackables/${trackableId}/view`);
    await page.waitForLoadState("networkidle");
    await page.waitForURL(/\/app\/trackables\/.*\/view/, { timeout: 10000 });

    // Click on day 1 button (use role+name for more reliable selection)
    const dayCell = page.locator("[data-text-cell]").first();
    await expect(dayCell).toBeVisible({ timeout: 10000 });
    await dayCell.click();

    // The editor modal should appear - wait for textarea to be visible (more reliable)
    const textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
  });

  test("should enter and save text value", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const testText = "This is my test entry for today";

    await page.goto(`/app/trackables/${trackableId}/view`);
    await page.waitForLoadState("networkidle");

    // Click on day 1 button to open editor
    const dayCell = page.locator("[data-text-cell]").first();
    await dayCell.click();

    // Wait for textarea to be visible
    const textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill(testText);

    // Wait a moment for debounced save to complete
    await page.waitForTimeout(500);

    // Blur the textarea to close (onBlur closes the editor)
    await textarea.blur();

    // Wait for textarea to disappear
    await expect(textarea).not.toBeVisible({ timeout: 5000 });

    // Reopen the popup to verify text was saved
    await dayCell.click();
    const reopenedTextarea = page.locator("#editorModal textarea");
    await expect(reopenedTextarea).toBeVisible({ timeout: 5000 });
    await expect(reopenedTextarea).toHaveValue(testText, { timeout: 5000 });
  });

  test("should persist text value after page reload", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    const testText = `Persistence test ${Date.now()}`;

    await page.goto(`/app/trackables/${trackableId}/view`);
    await page.waitForLoadState("networkidle");

    // Click on day 1 button
    const dayCell = page.locator("[data-text-cell]").first();
    await dayCell.click();

    const textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill(testText);

    // Wait for debounced save to complete
    await page.waitForTimeout(500);

    // Blur to close
    await textarea.blur();
    await expect(textarea).not.toBeVisible({ timeout: 5000 });

    // Reload the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Click on day 1 to verify text persisted
    await dayCell.click();
    const reopenedTextarea = page.locator("#editorModal textarea");
    await expect(reopenedTextarea).toBeVisible({ timeout: 5000 });
    await expect(reopenedTextarea).toHaveValue(testText, { timeout: 10000 });
  });

  test("should edit existing text value", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const initialText = "Initial text value";
    const updatedText = "Updated text value";

    await page.goto(`/app/trackables/${trackableId}/view`);
    await page.waitForLoadState("networkidle");

    // Click on day 1 button
    const dayCell = page.locator("[data-text-cell]").first();
    await dayCell.click();

    let textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill(initialText);
    await page.waitForTimeout(500);
    await textarea.blur();
    await expect(textarea).not.toBeVisible({ timeout: 5000 });

    // Click again to edit
    await dayCell.click();
    textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });

    // Verify initial text is there
    await expect(textarea).toHaveValue(initialText, { timeout: 5000 });

    // Clear and enter new text
    await textarea.fill("");
    await textarea.fill(updatedText);
    await page.waitForTimeout(500);
    await textarea.blur();
    await expect(textarea).not.toBeVisible({ timeout: 5000 });

    // Verify updated text after reload
    await page.reload();
    await page.waitForLoadState("networkidle");

    await dayCell.click();
    const reopenedTextarea = page.locator("#editorModal textarea");
    await expect(reopenedTextarea).toBeVisible({ timeout: 5000 });
    await expect(reopenedTextarea).toHaveValue(updatedText, { timeout: 10000 });
  });

  test("should clear text value", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const testText = "Text to be cleared";

    await page.goto(`/app/trackables/${trackableId}/view`);
    await page.waitForLoadState("networkidle");

    // Click on day 1 button
    const dayCell = page.locator("[data-text-cell]").first();
    await dayCell.click();

    let textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill(testText);
    await textarea.blur();
    await expect(textarea).not.toBeVisible({ timeout: 5000 });

    // Click again to clear
    await dayCell.click();
    textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill("");
    await textarea.blur();

    // Verify text is cleared
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(testText)).not.toBeVisible({ timeout: 5000 });
  });

  test("should display text preview in day cell", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    const testText = "A longer text entry";

    await page.goto(`/app/trackables/${trackableId}/view`);
    await page.waitForLoadState("networkidle");

    // Click on day 1 button
    const dayCell = page.locator("[data-text-cell]").first();
    await dayCell.click();

    const textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill(testText);
    await page.waitForTimeout(500);
    await textarea.blur();
    await expect(textarea).not.toBeVisible({ timeout: 5000 });

    // The text should be visible in the day cell after the popup closes
    // The cell shows the text value inside a nested div
    await expect(page.getByText(testText, { exact: false })).toBeVisible({
      timeout: 5000,
    });
  });

  test("should display text in trackables list view", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    const testText = "List view test";

    await page.goto(`/app/trackables/${trackableId}/view`);
    await page.waitForLoadState("networkidle");

    // Click on day 1 button
    const dayCell = page.locator("[data-text-cell]").first();
    await dayCell.click();

    const textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill(testText);
    await textarea.blur();

    // Go to trackables list
    await page.goto("/app/trackables");
    await page.waitForLoadState("networkidle");

    // Trackable should appear in the list
    await expect(page.getByText(trackableName).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("should handle multiline text", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const multilineText = "Line 1\nLine 2\nLine 3";

    await page.goto(`/app/trackables/${trackableId}/view`);
    await page.waitForLoadState("networkidle");

    // Click on day 1 button
    const dayCell = page.locator("[data-text-cell]").first();
    await dayCell.click();

    const textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill(multilineText);
    await page.waitForTimeout(500);
    await textarea.blur();
    await expect(textarea).not.toBeVisible({ timeout: 5000 });

    // Reload and verify
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Open the popup again to verify multiline was saved
    await dayCell.click();
    const reopenedTextarea = page.locator("#editorModal textarea");
    await expect(reopenedTextarea).toBeVisible({ timeout: 5000 });
    await expect(reopenedTextarea).toHaveValue(multilineText, {
      timeout: 5000,
    });
  });

  test("should handle special characters", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const specialText = "Special chars: &<>\"'@#$%^&*()";

    await page.goto(`/app/trackables/${trackableId}/view`);
    await page.waitForLoadState("networkidle");

    // Click on day 1 button
    const dayCell = page.locator("[data-text-cell]").first();
    await dayCell.click();

    const textarea = page.locator("#editorModal textarea");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill(specialText);
    await page.waitForTimeout(500);
    await textarea.blur();
    await expect(textarea).not.toBeVisible({ timeout: 5000 });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify special characters were saved correctly
    await dayCell.click();
    const reopenedTextarea = page.locator("#editorModal textarea");
    await expect(reopenedTextarea).toBeVisible({ timeout: 5000 });
    await expect(reopenedTextarea).toHaveValue(specialText, { timeout: 5000 });
  });
});
