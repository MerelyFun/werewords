import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const narration = JSON.parse(await readFile(resolve(root, 'src/narration.json'), 'utf8'));
const manifest = JSON.parse(await readFile(resolve(root, 'public/audio/manifest.json'), 'utf8'));
if (manifest.ready !== true) throw new Error('播报音频尚未就绪。');
for (const [id, clip] of Object.entries(narration)) {
  if (!manifest.clips?.includes(id) || clip.file !== `audio/${id}.mp3`) throw new Error(`清单缺失或路径错误：${id}`);
  const bytes = await readFile(resolve(root, 'public', clip.file));
  if (bytes.length < 128 || !(bytes.subarray(0, 3).toString() === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0))) {
    throw new Error(`不是有效的 MP3 文件：${id}`);
  }
  if (manifest.provider === 'user-recording') {
    const asset = manifest.assets?.[id];
    if (!asset || asset.text !== clip.text || !(asset.duration > 0) || asset.sha256 !== createHash('sha256').update(bytes).digest('hex')) {
      throw new Error(`录音文案、时长或文件哈希不匹配：${id}`);
    }
  }
  console.log(`已验证：${id} (${bytes.length} bytes)`);
}
console.log(`全部 ${Object.keys(narration).length} 段播报音频检查通过，来源：${manifest.provider}。`);
