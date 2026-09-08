import { test, expect } from "@playwright/test";
import narration from "../src/narration.json" with { type: "json" };

test("opposite seats see rotated prompts but mayor candidates stay single-direction and concealed on pause", async ({ page }) => {
  await page.route("**/audio/manifest.json", route => route.fulfill({ json: { ready: false, clips: [] } }));
  await page.goto("/");
  await page.getByRole("button", { name: "无声预览流程" }).click();
  await expect(page.locator(".opposite-title")).toHaveText("天黑，请闭眼");
  const transform = await page.locator(".opposite-face").evaluate(element => getComputedStyle(element).transform);
  expect(transform).toBe("matrix(-1, 0, 0, -1, 0, 0)");
  await page.getByRole("button", { name: "跳过此阶段" }).click();
  const candidates = await page.locator(".word-options button").allTextContents();
  await expect(page.locator(".opposite-face")).toHaveCount(0);
  expect(candidates).toHaveLength(3);
  for (const candidate of candidates) await expect(page.getByText(candidate, { exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "暂停", exact: true }).click();
  await expect(page.locator(".opposite-face")).toHaveCount(0);
  await expect(page.locator(".word-options button")).toHaveText(["已遮挡", "已遮挡", "已遮挡"]);
  for (const candidate of candidates) await expect(page.getByText(candidate, { exact: true })).toHaveCount(0);
});

test("role counts persist and optional roles run as a fully manual secret-free rehearsal", async ({ page }) => {
  await page.route("**/audio/manifest.json", route => route.fulfill({ json: { ready: true, clips: Object.keys(narration) } }));
  await page.addInitScript(() => {
    const starts: number[] = [];
    Object.assign(window, { roleAudioStarts: starts });
    const create = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      const source = create.call(this);
      const start = source.start.bind(source);
      source.start = (...args) => { starts.push(Date.now()); start(...args); };
      return source;
    };
  });
  await page.clock.install();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "开始夜晚", exact: true })).toBeEnabled();
  await page.locator(".role-settings summary").click();
  const villagers = page.locator(".role-row").filter({ has: page.getByText("村民", { exact: true }) });
  await expect(villagers.locator("output")).toHaveText("4");
  await page.getByRole("button", { name: "增加爪牙", exact: true }).click();
  await expect(villagers.locator("output")).toHaveText("3");
  await expect(page.getByRole("button", { name: "预演所选角色" })).toBeEnabled();
  await page.reload();
  await page.locator(".role-settings summary").click();
  await expect(villagers.locator("output")).toHaveText("3");
  await expect(page.locator(".role-row").filter({ has: page.getByText("爪牙", { exact: true }) }).locator("output")).toHaveText("1");
  await page.getByRole("button", { name: "预演所选角色" }).click();
  await page.clock.fastForward(120_000);
  await expect(page.getByRole("heading", { name: "天黑，请闭眼" })).toBeVisible();
  await page.getByRole("button", { name: "跳过此阶段" }).click();
  const secret = await page.locator(".word-options button").first().innerText();
  for (let index = 0; index < 6; index++) await page.getByRole("button", { name: "跳过此阶段" }).click();
  await expect(page.getByRole("heading", { name: "爪牙，请睁眼" })).toBeVisible();
  await expect(page.locator(".opposite-title")).toHaveText("爪牙，请睁眼");
  await expect(page.getByText(secret, { exact: true })).toHaveCount(0);
  await expect(page.locator(".secret-panel, .opposite-word")).toHaveCount(0);
  await page.clock.fastForward(120_000);
  await expect(page.getByRole("heading", { name: "爪牙，请睁眼" })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { roleAudioStarts: number[] }).roleAudioStarts)).toEqual([]);
});

