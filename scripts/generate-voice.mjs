import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// This script runs locally only. Never import it into browser code.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const narration = JSON.parse(await readFile(resolve(root, 'src/narration.json'), 'utf8'));
const args = new Set(process.argv.slice(2));
if ([...args].some((arg) => !['--check', '--force'].includes(arg))) {
  console.error('用法：node scripts/generate-voice.mjs [--check | --force]');
  process.exit(1);
}
const model = 'gpt-4o-mini-tts-2025-12-15';
const voice = 'marin';
const instructions = '请用标准普通话播报桌游主持词。声音沉稳、温和、清晰，语速稍慢，句间自然停顿。只读输入的中文内容，不添加任何词语、音效或背景音乐。';
const metadataPath = resolve(root, 'public/audio/generation.json');
const manifestPath = resolve(root, 'public/audio/manifest.json');
let metadata = {};
try { metadata = JSON.parse(await readFile(metadataPath, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const key = process.env.OPENAI_API_KEY;
const missing = [];
if (!args.has('--check')) {
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify({ ready: false, provider: 'openai', clips: [] }, null, 2)}\n`);
}

for (const [id, clip] of Object.entries(narration)) {
  if (!/^[a-zA-Z]+$/.test(id) || clip.file !== `audio/${id}.mp3` || !clip.text?.trim()) {
    throw new Error(`播报清单无效：${id}`);
  }
  const fingerprint = createHash('sha256').update(JSON.stringify({ model, voice, instructions, text: clip.text })).digest('hex');
  const target = resolve(root, 'public', clip.file);
  let exists = false;
  try { exists = (await stat(target)).size > 0 && metadata[id]?.fingerprint === fingerprint; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (exists && !args.has('--force')) { console.log(`已就绪：${id}`); continue; }
  if (args.has('--check')) { missing.push(id); continue; }
  if (!key) {
    console.error('尚未生成音频：当前环境缺少 OPENAI_API_KEY。请在本地安全设置后重试；不要将密钥写入网页、Git 或聊天。');
    process.exit(1);
  }
  console.log(`生成中文语音：${id}`);
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, voice, instructions, input: clip.text, response_format: 'mp3' }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    // Do not print response bodies or credentials. Failed requests are not retried automatically.
    throw new Error(`语音生成失败（HTTP ${response.status}，${id}），请检查账户访问权限和额度。`);
  }
  const type = response.headers.get('content-type') ?? '';
  if (!type.startsWith('audio/') && !type.startsWith('application/octet-stream')) {
    throw new Error(`返回内容不是音频：${id}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 128) throw new Error(`音频内容不完整：${id}`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(`${target}.tmp`, bytes);
  await rename(`${target}.tmp`, target);
  metadata[id] = { fingerprint, model, voice, generatedAt: new Date().toISOString(), bytes: bytes.length };
  await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
}

if (missing.length) {
  console.error(`尚未生成或需要更新 ${missing.length} 段模型语音：${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  if (!args.has('--check')) {
    await writeFile(manifestPath, `${JSON.stringify({ ready: true, provider: 'openai', clips: Object.keys(narration) }, null, 2)}\n`);
  }
  console.log('全部中文模型语音已就绪。请试听后再发布。');
}
