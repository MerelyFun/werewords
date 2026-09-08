import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`upright daylight and settlement ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route('**/audio/manifest.json', route => route.fulfill({ json: { ready: false, clips: [] } }));
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.getByRole('button', { name: '无声预览流程' }).click();
    await expect(page.locator('.opposite-face')).toHaveCount(1);
    await page.getByRole('button', { name: '跳过此阶段' }).click();
    await expect(page.locator('.opposite-face')).toHaveCount(0);
    const secret = await page.locator('.word-options button').first().innerText();
    for (let i = 0; i < 6; i++) await page.getByRole('button', { name: '跳过此阶段' }).click();
    await expect(page.getByRole('heading', { name: '天亮了', exact: true })).toBeVisible();
    await expect(page.locator('.opposite-face')).toHaveCount(0);
    await page.getByRole('button', { name: '跳过此阶段' }).click();
    await expect(page.getByRole('timer')).toBeVisible();
    await expect(page.locator('.opposite-face')).toHaveCount(0);
    await expect(page.getByText(secret, { exact: true })).toHaveCount(0);
    await expect(page.locator('.stage-heading .role-art')).toBeVisible();
    expect(await page.locator('main').evaluate(el => getComputedStyle(el).display)).toBe('block');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: '是', exact: true }).click();
    await expect(page.getByRole('button', { name: '是', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.answer-hint')).toHaveText('镇长回答：是');
    await page.getByRole('button', { name: '猜中真言了' }).click();
    await expect(page.getByRole('heading', { name: '谁是先知？' })).toBeVisible();
    await expect(page.locator('.opposite-face')).toHaveCount(0);
    await page.getByRole('button', { name: '指认完成，确认结果' }).click();
    await expect(page.locator('.opposite-face')).toHaveCount(0);
    await page.getByRole('button', { name: '没有找到', exact: true }).click();
    await expect(page.getByRole('heading', { name: '村民阵营获胜' })).toBeVisible();
    await expect(page.locator('.opposite-face')).toHaveCount(0);
    await page.getByRole('button', { name: '再来一局' }).click();
    await page.getByRole('button', { name: '无声预览流程' }).click();
    for (let i = 0; i < 8; i++) await page.getByRole('button', { name: '跳过此阶段' }).click();
    await page.getByRole('button', { name: '回答标记用完了' }).click();
    await expect(page.getByRole('heading', { name: '谁是狼人？' })).toBeVisible();
    await expect(page.locator('.opposite-face')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
