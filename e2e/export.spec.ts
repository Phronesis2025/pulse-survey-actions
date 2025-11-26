import { test, expect } from '@playwright/test';

test.describe('Export Functionality', () => {
  test('should display export page', async ({ page }) => {
    await page.goto('/export');

    // Check that the export page loads
    await expect(page.locator('h1:has-text("Export Data")')).toBeVisible();
    await expect(page.locator('button:has-text("Export to Excel")')).toBeVisible();
  });

  test('should display action items table or cards', async ({ page }) => {
    await page.goto('/export');

    // Wait for the content to load (either table on desktop or cards on mobile)
    await page.waitForTimeout(2000);

    // Check that either table or card view is present
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasCards = await page.locator('text=User Name').isVisible().catch(() => false);
    
    // On desktop, table should be visible; on mobile, cards should be visible
    // Both should show "User Name" somewhere
    expect(hasTable || hasCards).toBe(true);
  });

  test('should filter action items by search', async ({ page }) => {
    await page.goto('/export');

    // Wait for the page to load
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });

    // Enter search term
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');

    // Wait for filtering (if implemented client-side, it's instant)
    await page.waitForTimeout(500);

    // The content should still be visible (table on desktop, cards on mobile)
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasCards = await page.locator('.bg-white.rounded-lg.shadow-md').isVisible().catch(() => false);
    expect(hasTable || hasCards).toBe(true);
  });

  test('should show item count', async ({ page }) => {
    await page.goto('/export');

    // Wait for the count text to appear
    await page.waitForSelector('text=Showing', { timeout: 10000 });
    
    // Check that count is displayed
    const countText = await page.textContent('body');
    expect(countText).toMatch(/Showing \d+ of \d+ action items/);
  });
});

