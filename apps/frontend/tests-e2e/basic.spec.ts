import { test, expect } from '@playwright/test';

test('has title and landing page content', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/HairAgenda/);

  // Check if landing page CTA is present
  const cta = page.getByRole('link', { name: /Sou Profissional/i });
  await expect(cta).toBeVisible();
});

test('check navigation to login', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Entrar/i }).first().click();
  
  // URL should contain 'sign-in' if it redirects to Clerk
  await expect(page.url()).toContain('sign-in');
});
