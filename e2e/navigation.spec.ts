import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between all pages', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    await expect(page.locator('h2:has-text("Submit Action Item")')).toBeVisible();

    // Navigate to Dashboard
    await page.click('a:has-text("Dashboard")');
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();

    // Navigate to Edit page
    await page.click('a:has-text("Edit Items")');
    await expect(page.locator('h2:has-text("Edit Action Items")')).toBeVisible();

    // Navigate to Export page
    await page.click('a:has-text("Export")');
    await expect(page.locator('h1:has-text("Export Data")')).toBeVisible();

    // Navigate back to home
    await page.click('a:has-text("Submit Item")');
    await expect(page.locator('h2:has-text("Submit Action Item")')).toBeVisible();
  });

  test('should have navigation links on all pages', async ({ page }) => {
    const pages = [
      { path: '/', title: 'Submit Action Item' },
      { path: '/dashboard', title: 'Dashboard' },
      { path: '/edit', title: 'Edit Action Items' },
      { path: '/export', title: 'Export Data' },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      
      // Check that navigation is present
      await expect(page.locator('nav')).toBeVisible();
      
      // Check that we can see navigation links
      const navLinks = page.locator('nav a');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should display logo in navbar', async ({ page }) => {
    await page.goto('/');

    // Check for logo (inline SVG with role="img"); the logo carries the
    // "Pulse" branding — the nav deliberately has no separate title text
    const logo = page.getByRole('img', { name: 'Pulse logo' });
    await expect(logo).toBeVisible();

    // Verify navbar is black
    const nav = page.locator('nav');
    await expect(nav).toHaveClass(/bg-black/);
  });

  test('should maintain navigation state during form interactions', async ({ page }) => {
    await page.goto('/');

    // Fill in some form fields
    await page.fill('input[id="user_name"]', 'Test User');

    // Navigate away and come back, waiting for each page to render so the
    // second click can't fire before the first navigation completes (the
    // shared nav means "Submit Item" exists on the origin page too)
    await page.click('a:has-text("Edit Items")');
    await expect(page.locator('h2:has-text("Edit Action Items")')).toBeVisible();
    await page.click('a:has-text("Submit Item")');
    await expect(page.locator('h2:has-text("Submit Action Item")')).toBeVisible();

    // Form should be reset (this is expected behavior)
    const nameValue = await page.inputValue('input[id="user_name"]');
    expect(nameValue).toBe('');
  });
});
