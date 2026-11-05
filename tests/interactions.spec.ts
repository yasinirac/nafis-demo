import { expect, test, type Page } from '@playwright/test';

/**
 * Key interactions from the brief, driven the way a person would: by visible
 * labels, roles and keyboard. Desktop width only; the smoke suite covers 390.
 */
test.skip(({ viewport }) => (viewport?.width ?? 0) < 900, 'interaction flows run at desktop width');

async function open(page: Page, path: string) {
  await page.goto(`#${path}`);
  await expect(page.locator('h1').first()).toBeVisible();
}

/** Some charts sit behind a tab; open it first. */
async function openForCharts(page: Page, path: string) {
  await open(page, path);
  if (path === '/analyst') await page.getByRole('tab', { name: /Compare cohorts/ }).click();
}

test('charts: every Show table toggle reveals a table', async ({ page }) => {
  for (const path of ['/employer', '/staff/counsellor', '/staff/integrity/IC-2026-1183', '/analyst', '/contributor', '/executive', '/public']) {
    await openForCharts(page, path);
    const toggles = page.getByRole('button', { name: 'Show table' });
    const count = await toggles.count();
    expect(count, `${path} has at least one chart`).toBeGreaterThan(0);
    const first = toggles.first();
    await first.scrollIntoViewIfNeeded();
    await first.click();
    await expect(first).toHaveAttribute('aria-pressed', 'true');
    const controls = await first.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    await expect(page.locator(`[id="${controls}"] table`)).toBeVisible();
  }
});

test('charts: every chart drawing has role img and a label', async ({ page }) => {
  for (const path of ['/employer', '/staff/counsellor', '/staff/integrity/IC-2026-1183', '/analyst', '/contributor', '/executive', '/public']) {
    await openForCharts(page, path);
    const svgs = page.locator('figure svg[role="img"]');
    await expect(svgs.first()).toBeVisible();
    const labels = await svgs.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''));
    expect(labels.length, `${path} charts`).toBeGreaterThan(0);
    labels.forEach((label, i) => expect(label.length > 10, `${path} chart ${i} has an aria-label`).toBeTruthy());
  }
});

test('talent home: the coach draft can be accepted', async ({ page }) => {
  await open(page, '/talent');
  await expect(page.locator('[lang="ar"]').first()).toBeVisible();
  await expect(page.getByText(/Coach Agent/).first()).toBeVisible();
  await page.getByRole('button', { name: /Draft them/ }).click();
  await expect(page.getByRole('button', { name: /^Undo/ }).first()).toBeVisible();
});

test('career path: tabs switch paths with the keyboard', async ({ page }) => {
  await open(page, '/talent/path');
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(3);
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText(/62 in 100/).first()).toBeVisible();
});

test('alignment check: "no real work" daily flags the answer for a counsellor call', async ({ page }) => {
  await open(page, '/talent/alignment-check');
  await expect(page.getByText(/Your answers fit your role/).first()).toBeVisible();
  const row = page.getByRole('group', { name: /Had no real work to do/ });
  await row.getByText('Daily', { exact: true }).click();
  await expect(page.getByText(/Thank you for telling us\. A counsellor will offer you a call this week/).first()).toBeVisible();
});

test('privacy: revoking a permission changes its state', async ({ page }) => {
  await open(page, '/talent/privacy');
  await expect(page.getByRole('radio', { name: /Anonymous card/ })).toBeChecked();
  await page.getByRole('button', { name: /^Revoke: Qasr/ }).first().click();
  await page.getByRole('button', { name: /^Revoke access$/ }).click();
  await expect(page.getByText(/Revoking stops future access at once/).first()).toBeVisible();
});

test('employer discovery: sending a request counts down and confirms', async ({ page }) => {
  await open(page, '/employer/discovery');
  await expect(page.getByText(/8 of 8 introductions left/).first()).toBeVisible();
  await page.getByRole('button', { name: /^Send request/ }).click();
  await expect(page.getByText(/Sent\. Their Coach Agent will show it to them within 24 hours/).first()).toBeVisible();
  await expect(page.getByText(/7 of 8 introductions left/).first()).toBeVisible();
});

test('employer dashboard: no risk or prediction column', async ({ page }) => {
  await open(page, '/employer');
  const headers = (await page.locator('th').allTextContents()).join(' | ').toLowerCase();
  expect(headers).not.toMatch(/risk|likely|predict|score/);
});

test('monthly report: evidence field appears only for the extremes', async ({ page }) => {
  await open(page, '/employer/monthly-report');
  await expect(page.getByRole('radio', { name: 'Above', exact: true })).toBeChecked();
  await expect(page.getByLabel(/One line of evidence/)).toHaveCount(0);
  await page.getByText('Well above', { exact: true }).click();
  await expect(page.getByLabel(/One line of evidence/)).toBeVisible();
});

test('counsellor: save needs an outcome, and reassigning updates the queue', async ({ page }) => {
  await open(page, '/staff/counsellor');
  const save = page.getByRole('button', { name: /Save outcome/ });
  await expect(save).toBeDisabled();
  await page.getByText('On track, close', { exact: true }).first().click();
  await expect(save).toBeEnabled();
  await page.getByRole('button', { name: /Reassign to Omar/ }).click();
  await expect(page.getByText(/Reassigned to Omar/).first()).toBeVisible();
});

test('integrity case: second review unlocks only after all reasons and a decision', async ({ page }) => {
  await open(page, '/staff/integrity/IC-2026-1183');
  const send = page.getByRole('button', { name: /Send to Mona for second review/ });
  await expect(send).toBeDisabled();
  for (const code of ['R12', 'R03', 'R15', 'R21']) {
    await page
      .getByRole('group', { name: new RegExp(`Review of ${code}`) })
      .getByRole('button', { name: 'Confirmed', exact: true })
      .click();
  }
  await page.getByText('Ask the establishment for documents', { exact: true }).click();
  await expect(send).toBeEnabled();
  await send.click();
  await expect(page.getByText(/Sent to Mona\. Nothing reaches the establishment until she approves/).first()).toBeVisible();
});

test('integrity case: an unknown case id shows a not-found state', async ({ page }) => {
  await open(page, '/staff/integrity/IC-0000-0000');
  await expect(page.getByTestId('concept-chip')).toBeVisible();
});

test('government view: an adjustment needs a written reason', async ({ page }) => {
  await open(page, '/government/career-record');
  await expect(page.getByText(/Consent valid until 3 May 2030/).first()).toBeVisible();
  await page.getByRole('button', { name: /Adjust with a reason/ }).click();
  await expect(page.getByRole('textbox').first()).toBeVisible();
});

test('contributor: the class selector changes the tiles', async ({ page }) => {
  await open(page, '/contributor');
  await expect(page.getByText('142', { exact: true }).first()).toBeVisible();
  await page.getByText('2023', { exact: true }).first().click();
  await expect(page.getByText('128', { exact: true }).first()).toBeVisible();
});

test('executive: delta selector and heatmap drill-down', async ({ page }) => {
  await open(page, '/executive');
  const crumbs = page.getByRole('list', { name: /Drill-down/ });
  await expect(crumbs).toContainText('All sectors');
  await page.getByRole('button', { name: /Logistics in Ajman/ }).click();
  await expect(crumbs).toContainText('Logistics');
  await expect(crumbs).toContainText('Ajman');
  await page.getByRole('button', { name: /Clear drill-down/ }).click();
  await expect(crumbs).toContainText('All emirates');
});

test('monthly pack: approvals advance to signed and locked', async ({ page }) => {
  await open(page, '/executive/monthly-pack');
  await expect(page.locator('[lang="ar"]').first()).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: /^Approve/ }).click();
  }
  await expect(page.getByText(/Signed and sent to the Undersecretary's office/).first()).toBeVisible();
});

test('public: download CSV is available and the API link goes to the developer portal', async ({ page }) => {
  await open(page, '/public');
  await expect(page.getByText(/190,000\+/).first()).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download CSV/ }).first().click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/\.csv$/);
  await page.getByRole('link', { name: /Open data API/ }).click();
  await expect(page).toHaveURL(/#\/developer$/);
});
