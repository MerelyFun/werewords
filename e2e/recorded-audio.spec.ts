import { test, expect, type Page } from "@playwright/test";
import narration from "../src/narration.json" with { type: "json" };

type AudioEvent = { action: "start" | "stop" | "ended"; id: number };
type AudioTraceWindow = Window & { recordedAudioTrace: AudioEvent[] };

async function requireRecordings(page: Page) {
  const response = await page.request.get("/audio/manifest.json");
  const manifest = response.ok() ? await response.json() : null;
  test.skip(!manifest?.ready, "真实录音尚未就绪，等待裁剪资源。");
  expect(manifest.clips).toEqual(expect.arrayContaining(Object.keys(narration)));
  return manifest as { ready: boolean; clips: string[] };
}

function runtimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

test("real recordings decode with audible signal in native WebAudio", async ({ page }) => {
  const manifest = await requireRecordings(page);
  const errors = runtimeErrors(page);
  await page.goto("/");
  const decoded = await page.evaluate(async (ids) => {
    const context = new AudioContext();
    try {
      return await Promise.all(ids.map(async (id) => {
        const response = await fetch(`audio/${id}.mp3`);
        if (!response.ok) throw new Error(`${id}: HTTP ${response.status}`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        let squared = 0;
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          for (const value of buffer.getChannelData(channel)) squared += value * value;
        }
        return {
          id,
          duration: buffer.duration,
          rms: Math.sqrt(squared / (buffer.length * buffer.numberOfChannels)),
        };
      }));
    } finally {
      await context.close();
    }
  }, manifest.clips);
  expect(decoded).toHaveLength(manifest.clips.length);
  for (const clip of decoded) {
    expect(clip.duration, `${clip.id} duration`).toBeGreaterThan(0.1);
    expect(clip.duration, `${clip.id} duration`).toBeLessThan(120);
    expect(clip.rms, `${clip.id} audible signal`).toBeGreaterThan(0.002);
  }
  expect(errors).toEqual([]);
});

test("real recording preview finishes and skipping cancels the native night source", async ({ page }) => {
  test.setTimeout(90_000);
  await requireRecordings(page);
  const errors = runtimeErrors(page);
  // Observe native nodes without replacing the context, decoder, or playback.
  await page.addInitScript(() => {
    const trace: AudioEvent[] = [];
    (window as AudioTraceWindow).recordedAudioTrace = trace;
    let nextId = 0;
    const original = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      const source = original.call(this);
      const id = ++nextId;
      const start = source.start.bind(source);
      const stop = source.stop.bind(source);
      source.start = (...args) => {
        trace.push({ action: "start", id });
        start(...args);
      };
      source.stop = (...args) => {
        trace.push({ action: "stop", id });
        stop(...args);
      };
      source.addEventListener("ended", () => trace.push({ action: "ended", id }));
      return source;
    };
  });
  const trace = () => page.evaluate(() => (window as AudioTraceWindow).recordedAudioTrace);
  await page.goto("/");
  await expect(page.getByRole("button", { name: "开始夜晚", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "试听", exact: true }).click();
  await expect.poll(trace).toContainEqual({ action: "start", id: 1 });
  await expect.poll(trace, { timeout: 60_000 }).toContainEqual({ action: "ended", id: 1 });
  expect(await trace()).not.toContainEqual({ action: "stop", id: 1 });
  await expect(page.getByRole("button", { name: "试听", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "开始夜晚", exact: true }).click();
  await expect.poll(trace).toContainEqual({ action: "start", id: 2 });
  await page.getByRole("button", { name: "跳过此阶段", exact: true }).click();
  await expect(page.getByRole("heading", { name: "镇长，请睁眼" })).toBeVisible();
  await expect.poll(trace).toContainEqual({ action: "stop", id: 2 });
  await expect.poll(trace).toContainEqual({ action: "start", id: 3 });
  const events = await trace();
  expect(events.findIndex((event) => event.action === "stop" && event.id === 2))
    .toBeLessThan(events.findIndex((event) => event.action === "start" && event.id === 3));
  expect(errors).toEqual([]);
});
