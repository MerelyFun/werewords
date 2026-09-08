import narration from "./narration.json";

export type ClipId = keyof typeof narration;
type Manifest = { ready: boolean; clips: string[] };

/** Static OpenAI recordings only. A single unlocked AudioContext survives stage changes. */
export class Narrator {
  private context: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private source: AudioBufferSourceNode | null = null;
  private settle: (() => void) | null = null;
  private generation = 0;

  async status(): Promise<boolean> {
    try {
      const response = await fetch(
        `${import.meta.env.BASE_URL}audio/manifest.json`,
        { cache: "no-cache" },
      );
      if (!response.ok) return false;
      const manifest: Manifest = await response.json();
      return (
        manifest.ready &&
        Object.keys(narration).every((id) => manifest.clips.includes(id))
      );
    } catch {
      return false;
    }
  }

  async prepare() {
    this.context ??= new AudioContext();
    await this.context.resume();
    if (this.context.state !== "running")
      throw new Error("请点击按钮允许播放声音。");
    if (this.buffers.size === Object.keys(narration).length) return;
    const decoded = await Promise.all(
      Object.entries(narration).map(async ([id, clip]) => {
        const path = clip.file.replace(/^\//, "");
        const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
        if (!response.ok)
          throw new Error("播报音频加载失败，请检查网络后重试。");
        const buffer = await this.context!.decodeAudioData(
          await response.arrayBuffer(),
        );
        return [id, buffer] as const;
      }),
    );
    this.buffers = new Map(decoded);
  }

  play(id: ClipId): Promise<void> {
    this.stop();
    const buffer = this.buffers.get(id);
    if (!this.context || !buffer)
      return Promise.reject(new Error("语音尚未准备好。"));
    if (this.context.state !== "running")
      return Promise.reject(new Error("声音已暂停，请点击继续。"));
    const generation = this.generation;
    return new Promise((resolve) => {
      const source = this.context!.createBufferSource();
      source.buffer = buffer;
      source.connect(this.context!.destination);
      this.source = source;
      this.settle = resolve;
      source.onended = () => {
        source.disconnect();
        if (generation === this.generation) {
          this.source = null;
          this.settle = null;
        }
        resolve();
      };
      source.start();
    });
  }

  stop() {
    this.generation++;
    if (this.source) {
      this.source.onended = null;
      this.source.stop();
      this.source.disconnect();
      this.source = null;
    }
    this.settle?.();
    this.settle = null;
  }
}
