import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Narrator } from "./audio";
import narration from "./narration.json";

class FakeSource {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  state = "running";
  destination = {};
  sources: FakeSource[] = [];
  resume = vi.fn(async () => undefined);
  decodeAudioData = vi.fn(async (bytes: ArrayBuffer) => ({ bytes }));
  createBufferSource = vi.fn(() => {
    const source = new FakeSource();
    this.sources.push(source);
    return source;
  });
  constructor() {
    FakeAudioContext.instances.push(this);
  }
}

const fetchMock = vi.fn();
const ids = Object.keys(narration);
const context = () => FakeAudioContext.instances[0]!;

beforeEach(() => {
  FakeAudioContext.instances = [];
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(16),
  });
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("BASE_URL", "/Wolf/");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("静态模型录音 Narrator", () => {
  it("仅在就绪标记与完整片段清单同时成立时报告就绪", async () => {
    const narrator = new Narrator();
    for (const manifest of [
      { ready: false, clips: ids },
      { ready: true, clips: ids.slice(1) },
      { ready: true, clips: [] },
    ]) {
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => manifest });
      await expect(narrator.status()).resolves.toBe(false);
    }
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ready: true, clips: ids }),
    });
    await expect(narrator.status()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("/Wolf/audio/manifest.json", {
      cache: "no-cache",
    });
  });

  it("清单网络故障、HTTP 失败和错误 JSON 均不误报就绪", async () => {
    const narrator = new Narrator();
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    await expect(narrator.status()).resolves.toBe(false);
    fetchMock.mockResolvedValueOnce({ ok: false });
    await expect(narrator.status()).resolves.toBe(false);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error("invalid json");
      },
    });
    await expect(narrator.status()).resolves.toBe(false);
  });

  it("按 GitHub Pages 子路径预加载全部 MP3，重复准备复用解码缓存和上下文", async () => {
    const narrator = new Narrator();
    await narrator.prepare();
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(
      Object.values(narration).map((clip) => `/Wolf/${clip.file}`),
    );
    expect(context().decodeAudioData).toHaveBeenCalledTimes(ids.length);
    await narrator.prepare();
    expect(fetchMock).toHaveBeenCalledTimes(ids.length);
    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(context().resume).toHaveBeenCalledTimes(2);
  });

  it("跳过时停止当前音源并结束旧的等待，不需要收到 ended 事件", async () => {
    const narrator = new Narrator();
    await narrator.prepare();
    const ended = vi.fn();
    const playback = narrator.play("nightIntro").then(ended);
    const source = context().sources[0]!;
    expect(source.start).toHaveBeenCalledOnce();
    narrator.stop();
    await playback;
    expect(ended).toHaveBeenCalledOnce();
    expect(source.stop).toHaveBeenCalledOnce();
    expect(source.disconnect).toHaveBeenCalledOnce();
    expect(source.onended).toBeNull();
    narrator.stop();
    expect(source.stop).toHaveBeenCalledOnce();
  });

  it("上一阶段延迟到达的 ended 回调不会清除新阶段的音源或等待", async () => {
    const narrator = new Narrator();
    await narrator.prepare();
    const first = narrator.play("nightIntro");
    const staleEnded = context().sources[0]!.onended!;
    const secondEnded = vi.fn();
    const second = narrator.play("mayor").then(secondEnded);
    const current = context().sources[1]!;
    await first;
    staleEnded();
    await Promise.resolve();
    expect(secondEnded).not.toHaveBeenCalled();
    expect(current.stop).not.toHaveBeenCalled();
    narrator.stop();
    await second;
    expect(current.stop).toHaveBeenCalledOnce();
    expect(secondEnded).toHaveBeenCalledOnce();
  });

  it("播放自然结束后正常释放音源", async () => {
    const narrator = new Narrator();
    await narrator.prepare();
    const playback = narrator.play("test");
    const source = context().sources[0]!;
    source.onended!();
    await playback;
    expect(source.disconnect).toHaveBeenCalledOnce();
    narrator.stop();
    expect(source.stop).not.toHaveBeenCalled();
  });

  it("音频 HTTP 加载失败时拒绝准备且不能播放不完整资源", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    const narrator = new Narrator();
    await expect(narrator.prepare()).rejects.toThrow("播报音频加载失败");
    await expect(narrator.play("nightIntro")).rejects.toThrow("语音尚未准备好");
  });

  it("网络或解码失败会传递错误，而非静默开始游戏", async () => {
    const narrator = new Narrator();
    fetchMock.mockRejectedValueOnce(new Error("network unavailable"));
    await expect(narrator.prepare()).rejects.toThrow("network unavailable");
    context().decodeAudioData.mockRejectedValueOnce(new Error("bad mp3"));
    await expect(narrator.prepare()).rejects.toThrow("bad mp3");
  });

  it("浏览器挂起音频上下文时拒绝播放", async () => {
    const narrator = new Narrator();
    await narrator.prepare();
    context().state = "suspended";
    await expect(narrator.play("test")).rejects.toThrow("声音已暂停");
    await expect(narrator.prepare()).rejects.toThrow("请点击按钮允许播放声音");
  });
});
