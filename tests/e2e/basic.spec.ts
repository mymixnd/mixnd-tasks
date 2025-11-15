import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
	test('homepage loads', async ({ page }) => {
		await page.goto('/');

		// Check that we can see the homepage content
		await expect(page).toHaveTitle(/My App/);
	});

	test('pricing page loads', async ({ page }) => {
		await page.goto('/pricing');

		// Check for pricing content
		await expect(page.locator('text=Free')).toBeVisible();
	});

	test('blog page loads', async ({ page }) => {
		await page.goto('/blog');

		// Blog should load
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	});

	test('login page loads', async ({ page }) => {
		await page.goto('/login/sign_in');

		// Should see login form
		await expect(page.locator('input[type="email"]')).toBeVisible();
	});
});