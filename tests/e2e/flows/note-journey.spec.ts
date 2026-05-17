import { test, expect } from '@playwright/test';

/**
 * E2E — Core user journey: Login → Create note → Logout
 *
 * Requires environment variables:
 *   E2E_EMAIL    — test account email
 *   E2E_PASSWORD — test account password
 *
 * Run with: npx playwright test tests/e2e/flows/note-journey.spec.ts
 */

const EMAIL = process.env.E2E_EMAIL ?? 'test@example.com';
const PASSWORD = process.env.E2E_PASSWORD ?? 'testpassword123';

test.describe('Core journey: Login → Note → Logout', () => {
  test('user can log in with email and password', async ({ page }) => {
    await page.goto('/login');

    // Page title / heading
    await expect(page.getByRole('heading', { name: /masuk|login/i })).toBeVisible();

    // Fill credentials
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|kata sandi/i).fill(PASSWORD);
    await page.getByRole('button', { name: /masuk|login/i }).click();

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('dashboard shows greeting', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|kata sandi/i).fill(PASSWORD);
    await page.getByRole('button', { name: /masuk|login/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 10_000 });

    // Dashboard should have some content
    await expect(page.locator('body')).toBeVisible();
    // Sidebar nav should be visible
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('user can navigate to notes page', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|kata sandi/i).fill(PASSWORD);
    await page.getByRole('button', { name: /masuk|login/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 10_000 });

    // Navigate to notes
    await page.goto('/notes');
    await expect(page).toHaveURL(/\/notes/);
    await page.waitForLoadState('networkidle');
  });

  test('user can create a new note', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|kata sandi/i).fill(PASSWORD);
    await page.getByRole('button', { name: /masuk|login/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 10_000 });

    await page.goto('/notes');
    await page.waitForLoadState('networkidle');

    // Find and click "new note" button
    const newNoteBtn = page.getByRole('button', { name: /catatan baru|buat catatan|new note/i });
    await newNoteBtn.click();

    // Should navigate to editor
    await page.waitForURL(/\/notes\/.+/, { timeout: 8_000 });

    // Editor should be visible
    await expect(page.locator('[contenteditable], textarea').first()).toBeVisible({
      timeout: 5_000,
    });

    // Type a title
    const titleInput = page.getByPlaceholder(/judul|title/i);
    if (await titleInput.isVisible()) {
      await titleInput.fill('Catatan E2E Test');
    }

    // Type content
    const editor = page.locator('[contenteditable]').first();
    await editor.click();
    await editor.type('Ini adalah catatan yang dibuat oleh E2E test Playwright.');

    // Wait for autosave (debounce ~1s)
    await page.waitForTimeout(2_000);
  });

  test('user can log out', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|kata sandi/i).fill(PASSWORD);
    await page.getByRole('button', { name: /masuk|login/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 10_000 });

    // Find logout button — usually in header or settings
    // Try header avatar / dropdown first
    const avatarBtn = page.getByRole('button', { name: /avatar|profil|account/i }).first();
    if (await avatarBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await avatarBtn.click();
      const logoutBtn = page.getByRole('menuitem', { name: /keluar|logout|sign out/i });
      await logoutBtn.click();
    } else {
      // Navigate to settings and click logout
      await page.goto('/settings');
      const logoutBtn = page.getByRole('button', { name: /keluar|logout|sign out/i });
      await logoutBtn.click();
    }

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 8_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('protected routes redirect unauthenticated users to login', async ({ page }) => {
    // Clear cookies to ensure unauthenticated state
    await page.context().clearCookies();
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 8_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
