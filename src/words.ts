import partyNight from "./data/party-night.json" with { type: "json" };
import steamWords from "./data/steam-words.json" with { type: "json" };
import steamSources from "./data/steam-sources.json" with { type: "json" };
import handleWords from "./data/handle-words.json" with { type: "json" };
import partiWords from "./data/parti-words.json" with { type: "json" };
import githubSources from "./data/github-sources.json" with { type: "json" };
import generatedWords from "./data/generated-words.json" with { type: "json" };

export type Difficulty = "easy" | "medium" | "hard";
export type PlayDifficulty = "easy" | "hard" | "all";
export type Category = string;
export interface Word {
  id: string;
  text: string;
  difficulty: Difficulty;
  category: Category;
}

// 自行整理的中文常用词，不来自官方应用词库。
const groups: [Category, Difficulty, string][] = [
  [
    "日常",
    "easy",
    "雨伞 书包 闹钟 牙刷 毛巾 电梯 镜子 钥匙 台灯 枕头 冰箱 拖鞋 自行车 邮箱 门铃 窗帘",
  ],
  [
    "自然",
    "easy",
    "彩虹 月亮 星星 太阳 雪花 沙漠 森林 大海 瀑布 火山 蝴蝶 熊猫 海豚 企鹅 松树 蘑菇",
  ],
  [
    "饮食",
    "easy",
    "火锅 饺子 面条 包子 蛋糕 冰淇淋 西瓜 草莓 香蕉 苹果 牛奶 豆浆 饼干 爆米花 巧克力 茶叶",
  ],
  [
    "趣味",
    "easy",
    "风筝 秋千 滑梯 积木 气球 拼图 魔术 电影 足球 篮球 跳绳 游泳 滑雪 拔河 迷宫 木马",
  ],
  [
    "日常",
    "hard",
    "指南针 显微镜 投影仪 打字机 留声机 订书机 温度计 望远镜 自动售货机 红绿灯 电路板 回形针 储蓄罐 洗碗机 吸尘器 放大镜",
  ],
  [
    "自然",
    "hard",
    "极光 海市蜃楼 日食 潮汐 珊瑚 苔藓 萤火虫 螳螂 穿山甲 蒲公英 猪笼草 钟乳石 龙卷风 含羞草 食人鱼 石榴树",
  ],
  [
    "饮食",
    "hard",
    "提拉米苏 可颂 杏仁豆腐 糖葫芦 螺蛳粉 狮子头 松鼠桂鱼 杨枝甘露 酸梅汤 千层面 马卡龙 桂花糕 肠粉 油条 芝士焗饭 椰子冻",
  ],
  [
    "趣味",
    "hard",
    "密室逃脱 皮影戏 万花筒 九连环 华容道 套娃 陶笛 独轮车 定格动画 立体书 飞行棋 抖空竹 手影 水上芭蕾 花样滑冰 沙画",
  ],
];

export const words: Word[] = groups.flatMap(
  ([category, difficulty, text], group) =>
    text
      .split(" ")
      .map((word, index) => ({
        id: `w-${group}-${index}`,
        text: word,
        category,
        difficulty,
      })),
);

export interface WordLibrary {
  id: string;
  name: string;
  words: Word[];
  difficulties: { id: Difficulty; label: string }[];
}

const levels: Record<number, Difficulty> = { 1: "easy", 2: "medium", 3: "hard" };
const githubWords: Record<string, Word[]> = {
  "github-handle": handleWords.map(word => ({ ...word, difficulty: word.difficulty as Difficulty })),
  "github-parti": partiWords.map(word => ({ ...word, difficulty: word.difficulty as Difficulty })),
};
/** 新词库只需提供数据适配和目录项；抽词、主题与难度均读取此目录。 */
export const wordLibraries: WordLibrary[] = [
  { id: "builtin", name: "原有精选", words, difficulties: [
    { id: "easy", label: "标准" }, { id: "hard", label: "挑战" },
  ] },
  { id: "generated-wanxiang", name: "万象趣猜", words: generatedWords.map(word => ({
    ...word, difficulty: word.difficulty as Difficulty,
  })), difficulties: [
    { id: "easy", label: "标准" }, { id: "hard", label: "挑战" },
  ] },
  ...githubSources.map(source => ({
    id: source.id, name: source.name, words: githubWords[source.id],
    difficulties: [{ id: "easy" as const, label: "标准" }, { id: "hard" as const, label: "挑战" }],
  })),
  ...steamSources.map(({ sourceId, name }): WordLibrary => ({
    id: `steam-${sourceId}`,
    name,
    words: steamWords.filter(word => word.sourceId === sourceId).map(word => ({
      ...word, difficulty: word.difficulty as Difficulty,
    })),
    difficulties: [{ id: "easy", label: "标准" }, { id: "hard", label: "挑战" }],
  })),
  { id: "party-night", name: "群友派对之夜", words: partyNight.words.map((word, index) => ({
    id: `party-night-${index}`, text: word.w, difficulty: levels[word.level], category: word.tag,
  })), difficulties: [
    { id: "easy", label: "简单" }, { id: "medium", label: "中等" }, { id: "hard", label: "困难" },
  ] },
];

export function getWordLibrary(id: string): WordLibrary {
  return wordLibraries.find(library => library.id === id) ?? wordLibraries[0];
}

/** 只接受目录内的来源，且始终保留至少一个来源。 */
export function normalizeLibraryIds(value: unknown): string[] {
  const ids = Array.isArray(value) ? value : [];
  const valid = [...new Set(ids.filter((id): id is string =>
    typeof id === "string" && wordLibraries.some(library => library.id === id),
  ))];
  return valid.length ? valid : ["builtin"];
}

/** 多库混抽：游戏使用 all，历史分级仅保留作数据整理；按词面去重。 */
export function pickLibraryWords(
  difficulty: PlayDifficulty,
  libraryIds: readonly string[],
  count = 3,
  random: () => number = Math.random,
): Word[] {
  const unique = new Map<string, Word>();
  for (const id of normalizeLibraryIds(libraryIds)) {
    for (const word of getWordLibrary(id).words) {
      const matches = difficulty === "all" || (difficulty === "hard" ? word.difficulty === "hard" : word.difficulty !== "hard");
      const key = word.text.trim().normalize("NFKC").toLocaleLowerCase("zh-CN");
      if (matches && !unique.has(key)) unique.set(key, word);
    }
  }
  return shuffleWords([...unique.values()], count, random);
}

export function pickWords(
  difficulty: Difficulty,
  category: Category | "all",
  count = 3,
  random: () => number = Math.random,
  libraryId = "builtin",
): Word[] {
  const pool = getWordLibrary(libraryId).words.filter(
    (word) =>
      word.difficulty === difficulty &&
      (category === "all" || word.category === category),
  );
  return shuffleWords(pool, count, random);
}

function shuffleWords(pool: Word[], count: number, random: () => number): Word[] {
  // Fisher–Yates: 不使用有偏的随机 sort；每轮候选不重复。
  for (let index = pool.length - 1; index > 0; index--) {
    const target = Math.min(
      index,
      Math.max(0, Math.floor(random() * (index + 1))),
    );
    [pool[index], pool[target]] = [pool[target]!, pool[index]!];
  }
  return pool.slice(0, Math.max(0, count));
}
