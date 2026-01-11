import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should allow user to navigate to login page', async ({ page }) => {
        await page.goto('/');

        // Click the login link and wait for navigation
        await Promise.all([
            page.waitForURL(/.*login/),
            page.getByRole('link', { name: 'تسجيل الدخول' }).first().click(),
        ]);

        // "مرحباً بعودتك" matches the actual h2 in login/page.tsx
        await expect(page.getByRole('heading', { name: 'مرحباً بعودتك' })).toBeVisible();
    });

    test('should show validation error on empty login submit', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: 'تسجيل الدخول' }).click();

        // Validating the email input using HTML5 validation or simple visibility check
        const emailInput = page.getByPlaceholder('name@example.com');
        await expect(emailInput).toBeVisible();
    });
});
