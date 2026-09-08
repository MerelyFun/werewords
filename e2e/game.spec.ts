import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/audio/manifest.json", (route) =>
    route.fulfill({ json: { ready: false, clips: [] } }),
  );
});

async function start(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "无声预览流程" }).click();
  await expect(
    page.getByRole("heading", { name: "天黑，请闭眼" }),
  ).toBeVisible();
}
async function skipToDay(page: Page) {
  for (let i = 0; i < 9; i++) {
    if (
      await page.getByRole("heading", { name: "真言，藏在问题里" }).isVisible()
    )
      return;
    await page.getByRole("button", { name: "跳过此阶段" }).click();
  }
  await expect(
    page.getByRole("heading", { name: "真言，藏在问题里" }),
  ).toBeVisible();
}

test("mobile setup stays minimal, settings persist and layout fits", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("狼人真言 · 今夜一起猜");
  await expect(page.getByText("播报音频未就绪", { exact: true })).toHaveCount(0);
  await expect(page.getByText("语音主持已就绪")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "无声预览流程" })).toBeEnabled();
  await page.getByRole("button", { name: "增加游戏人数" }).click();
  await expect(page.locator(".setting-row").filter({ hasText: "游戏人数" }).locator("output")).toHaveText("7 人");
  await page.reload();
  await expect(page.locator(".setting-row").filter({ hasText: "游戏人数" }).locator("output")).toHaveText("7 人");
  await page.getByRole("button", { name: "试听", exact: true }).click();
  await expect(page.locator(".notice")).toContainText("播报音频未就绪");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("every stage can be skipped, including unknown verdict and restart", async ({
  page,
}) => {
  await start(page);
  await skipToDay(page);
  await page.getByRole("button", { name: "跳过此阶段" }).click();
  await expect(page.getByRole("heading", { name: "谁是狼人？" })).toBeVisible();
  await page.getByRole("button", { name: "跳过此阶段" }).click();
  await expect(page.getByRole("heading", { name: "揭晓这一局" })).toBeVisible();
  await page.getByRole("button", { name: "跳过此阶段" }).click();
  await expect(page.getByText("已跳过结算，本局不判定胜负。")).toBeVisible();
  await page.getByRole("button", { name: "跳过，返回设置" }).click();
  await expect(
    page.getByRole("heading", { name: "今夜，谁在说谎？" }),
  ).toBeVisible();
});

test("seer and werewolf see only large two-direction words, concealed during pause and day", async ({
  page,
}) => {
  await start(page);
  await page.getByRole("button", { name: "跳过此阶段" }).click();
  const wordButton = page.locator(".word-options button").nth(1);
  const word = (await wordButton.innerText()).trim();
  await wordButton.click();
  await page.getByRole("button", { name: "记住了，进入下一阶段" }).click();
  await expect(page.getByText(word, { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "跳过此阶段" }).click();
  for (const role of ["先知", "狼人"]) {
    await expect(page.getByRole("heading", { name: `${role}，请睁眼` })).toHaveCount(1);
    await expect(page.locator(".secret-panel")).toHaveText(word);
    await expect(page.locator(".opposite-face")).toHaveText(word);
    await expect(page.locator(".opposite-title, .opposite-description, .opposite-timer, .secret-panel .timer-label, .secret-panel .small-timer")).toHaveCount(0);
    for (const selector of [".secret-panel strong", ".opposite-word"]) {
      const fontSize = await page.locator(selector).evaluate(element => parseFloat(getComputedStyle(element).fontSize));
      expect(fontSize).toBeGreaterThanOrEqual(48);
    }
    expect(await page.locator(".opposite-face").evaluate(element => getComputedStyle(element).transform)).toBe("matrix(-1, 0, 0, -1, 0, 0)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "暂停", exact: true }).click();
    await expect(page.locator(".secret-panel strong")).toHaveText("已遮挡");
    await expect(page.locator(".opposite-word")).toHaveText("已遮挡");
    await expect(page.getByText(word, { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "继续", exact: true }).click();
    await expect(page.locator(".secret-panel strong")).toHaveText(word);
    await expect(page.locator(".opposite-word")).toHaveText(word);
    if (role === "先知") {
      await page.getByRole("button", { name: "跳过此阶段" }).click();
      await expect(page.getByText(word, { exact: true })).toHaveCount(0);
      await page.getByRole("button", { name: "跳过此阶段" }).click();
    }
  }
  await skipToDay(page);
  await expect(page.getByText(word, { exact: true })).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("玩家名单");
});

for (const [correct, hit, winner] of [
  [true, true, "狼人"],
  [true, false, "村民"],
  [false, true, "村民"],
  [false, false, "狼人"],
] as const) {
  test(`outcome correct=${correct} hit=${hit} => ${winner}`, async ({
    page,
  }) => {
    await start(page);
    await skipToDay(page);
    await page
      .getByRole("button", { name: correct ? "猜中真言了" : "回答标记用完了" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: correct ? "谁是先知？" : "谁是狼人？",
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "跳过此阶段" }).click();
    await page
      .getByRole("button", { name: hit ? "找到了" : "没有找到", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: `${winner}阵营获胜` }),
    ).toBeVisible();
  });
}

test("deadline timer pauses, resumes and expires into discussion", async ({
  page,
}) => {
  await page.clock.install();
  await start(page);
  await skipToDay(page);
  await expect(page.locator(".big-timer")).toHaveText("04:00");
  await page.clock.fastForward(10_000);
  await expect(page.locator(".big-timer")).toHaveText("03:50");
  await page.getByRole("button", { name: "暂停", exact: true }).click();
  await page.clock.fastForward(30_000);
  await expect(page.locator(".big-timer")).toHaveText("03:50");
  await page.getByRole("button", { name: "继续", exact: true }).click();
  await page.clock.fastForward(230_100);
  await expect(page.getByRole("heading", { name: "谁是狼人？" })).toBeVisible();
});

test("reset confirmation preserves settings and clears round", async ({
  page,
}) => {
  await start(page);
  await skipToDay(page);
  await page.getByRole("button", { name: "结束本局", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "继续游戏", exact: true }).click();
  await expect(page.locator(".big-timer")).toBeVisible();
  await page.getByRole("button", { name: "结束本局", exact: true }).click();
  await page.getByRole("button", { name: "结束并返回设置" }).click();
  await expect(
    page.getByRole("heading", { name: "今夜，谁在说谎？" }),
  ).toBeVisible();
});
