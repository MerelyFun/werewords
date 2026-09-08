import { readFileSync, writeFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const expand = groups => groups.flatMap(({ words, ...group }) => words.split(' ').map(text => ({ text, ...group })));
const raw = [
  ...expand(read('../src/data/generated-everyday-groups.json')),
  ...read('../src/data/generated-culture.json'),
  ...read('../src/data/generated-internet.json'),
  ...expand(read('../src/data/generated-extra-groups.json')),
];
// 编辑审阅：避免同一答案的别称、替换跨部分重名，并扩大中外文化覆盖。
const edits = { '齐天大圣': '达芬奇', '水墨画': '油画', '名侦探柯南': '江户川柯南',
  '卡皮巴拉': '浪浪山小妖怪', '磕糖': '脱单', '发癫': '拉布布', '饭搭子': '谷子经济',
  '社交牛杂症': '精神股东' };
const seen = new Set();
const result = raw.map((word, index) => {
  let text = edits[word.text] ?? word.text;
  if (seen.has(text)) {
    const replacements = { '流星雨': '赤道', '仪式感': '情绪劳动', '主播': '视频博主' };
    text = replacements[text] ?? text;
  }
  if (seen.has(text)) throw new Error(`重复词面需要人工替换：${text}`);
  if (!['standard', 'challenge'].includes(word.difficulty)) throw new Error(`未知难度：${text}`);
  seen.add(text);
  return { id: `wanxiang-${String(index + 1).padStart(3, '0')}`, text,
    category: word.category === '网络/梗词' ? '网络梗词' : word.category,
    difficulty: word.difficulty === 'standard' ? 'easy' : 'hard' };
});
writeFileSync(new URL('../src/data/generated-words.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ count: result.length, standard: result.filter(w => w.difficulty === 'easy').length,
  challenge: result.filter(w => w.difficulty === 'hard').length, categories: [...new Set(result.map(w => w.category))] }));
