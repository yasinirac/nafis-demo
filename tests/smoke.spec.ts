import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { conceptNotice, screens } from '../src/data/platform';

/**
 * Opens every route at both widths and checks:
 * the page renders an h1, the concept chip is present and visible, the
 * console has no errors, and the page does not scroll sideways.
 */
for (const screen of screens) {
  test(`${screen.path} renders with the concept chip and no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(String(err)));

    await page.goto(`#${screen.path}`);
    await expect(page.locator('h1').first()).toBeVisible();

    const chip = page.getByTestId('concept-chip');
    await expect(chip).toHaveCount(1);
    await expect(chip).toBeVisible();
    await expect(chip).toHaveText(conceptNotice);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'page should not scroll horizontally').toBeLessThanOrEqual(1);

    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test(`${screen.path} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(`#${screen.path}`);
    await expect(page.locator('h1').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id} (${v.nodes.length}): ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    expect(serious).toEqual([]);
  });
}

test('every page has no login or password field', async ({ page }) => {
  for (const screen of screens) {
    await page.goto(`#${screen.path}`);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  }
});

test('the role switcher navigates between personas', async ({ page }) => {
  await page.goto('#/');
  const switcher = page.getByRole('button', { name: /view as/i }).locator('visible=true').first();
  await switcher.click();
  await page.getByRole('link', { name: /^Huda/ }).locator('visible=true').first().click();
  await expect(page).toHaveURL(/#\/employer$/);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('unknown routes show the not-found screen with the concept chip', async ({ page }) => {
  await page.goto('#/no-such-screen');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/not in the demo/i);
  await expect(page.getByTestId('concept-chip')).toBeVisible();
});
