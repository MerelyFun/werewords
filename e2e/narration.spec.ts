import { test, expect } from "@playwright/test";
import narration from "../src/narration.json" with { type: "json" };

test("recording lifecycle: narration before timer, automatic night, and skip cancellation", async ({
  page,
}) => {
  // Test double, not generated speech. Real MP3 listening is a separate release gate.
  await page.addInitScript(() => {
    const trace: string[] = [];
    Object.assign(window, { audioTrace: trace });
    class TestAudioContext {
      state = "running";
      destination = {};
      async resume() {}
      async decodeAudioData(bytes: ArrayBuffer) {
        return { id: new TextDecoder().decode(bytes) };
      }
      createBufferSource() {
        let timeout: number | undefined;
        const source = {
          buffer: { id: "" },
          onended: null as (() => void) | null,
          connect() {},
          disconnect() {},
          start() {
            trace.push(`start:${source.buffer.id}`);
            timeout = window.setTimeout(() => {
              trace.push(`end:${source.buffer.id}`);
              source.onended?.();
            }, 100);
          },
          stop() {
            clearTimeout(timeout);
            trace.push(`stop:${source.buffer.id}`);
          },
        };
        return source;
      }
    }
    Object.assign(window, { AudioContext: TestAudioContext });
  });
  await page.route("**/audio/manifest.json", (route) =>
    route.fulfill({ json: { ready: true, clips: Object.keys(narration) } }),
  );
  await page.route("**/audio/*.mp3", (route) =>
    route.fulfill({
      body: route.request().url().split("/").at(-1)!.replace(".mp3", ""),
      contentType: "audio/mpeg",
    }),
  );
  await page.clock.install();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "开始夜晚", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "开始夜晚", exact: true }).click();
  await page.clock.runFor(150);
  await expect(page.locator(".small-timer")).toHaveText("04");
  await page.clock.fastForward(4_100);
  await expect(
    page.getByRole("heading", { name: "镇长，请睁眼" }),
  ).toBeVisible();
  await page.clock.runFor(150);
  // Mayor has no deadline, even with a ready narrator.
  await page.clock.fastForward(60_000);
  await expect(
    page.getByRole("heading", { name: "镇长，请睁眼" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "跳过此阶段" }).click();
  await expect(
    page.getByRole("heading", { name: "镇长，请闭眼" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "跳过此阶段" }).click();
  await expect(
    page.getByRole("heading", { name: "先知，请睁眼" }),
  ).toBeVisible();
  await page.clock.runFor(150);
  await expect(page.locator(".small-timer")).toHaveCount(0);
  await page.clock.fastForward(7_000);
  await expect(page.getByRole("heading", { name: "先知，请睁眼" })).toHaveCount(1);
  await page.clock.fastForward(1_100);
  await expect(
    page.getByRole("heading", { name: "先知，请闭眼" }),
  ).toBeVisible();
  const trace = await page.evaluate(
    () => (window as unknown as { audioTrace: string[] }).audioTrace,
  );
  expect(trace).toContain("start:nightIntro");
  expect(trace).toContain("end:nightIntro");
  expect(trace).toContain("start:mayorClose");
  expect(trace).toContain("start:seer");
  expect(trace.filter((item) => item === "start:seer")).toHaveLength(1);
});

test("missing audio does not auto-advance the night", async ({ page }) => {
  await page.route("**/audio/manifest.json", (route) =>
    route.fulfill({ json: { ready: false, clips: [] } }),
  );
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "无声预览流程" }).click();
  await page.clock.fastForward(120_000);
  await expect(
    page.getByRole("heading", { name: "天黑，请闭眼" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "手动继续", exact: true })).toBeVisible();
});
