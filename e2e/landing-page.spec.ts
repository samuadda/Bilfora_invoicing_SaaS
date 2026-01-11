import { test, expect } from '@playwright/test';

test('landing page has title and loads successfully', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/بيلفورة/);

    // Check for main heading
    await expect(page.locator('h1')).toBeVisible();
});
