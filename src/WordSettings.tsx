import { words, type Category, type Difficulty } from "./words";

const difficulties = [
  { id: "easy", label: "标准", hint: "熟悉的事物，轻松开局" },
  { id: "hard", label: "挑战", hint: "更细的线索，更有趣的答案" },
] as const;
const themes: { id: Category | "all"; labels: Record<Difficulty, string> }[] = [
  { id: "all", labels: { easy: "全部主题", hard: "全部主题" } },
  { id: "日常", labels: { easy: "日常生活", hard: "奇妙器物" } },
  { id: "自然", labels: { easy: "自然万物", hard: "自然奇观" } },
  { id: "饮食", labels: { easy: "好吃好喝", hard: "风味美食" } },
  { id: "趣味", labels: { easy: "休闲趣味", hard: "艺术游艺" } },
];

export function WordSettings({ difficulty, category, onChange }: {
  difficulty: Difficulty; category: Category | "all";
  onChange: (settings: { difficulty?: Difficulty; category?: Category | "all" }) => void;
}) {
  const pool = words.filter(word => word.difficulty === difficulty);
  return <section className="word-settings" aria-label="难度与词库">
    <div className="difficulty-tabs" role="group" aria-label="难度">
      {difficulties.map(item => <button key={item.id} aria-pressed={item.id === difficulty}
        onClick={() => onChange({ difficulty: item.id })}>{item.label}</button>)}
    </div>
    <p className="difficulty-hint">{difficulties.find(item => item.id === difficulty)?.hint}</p>
    <div className="theme-options" role="group" aria-label="词库主题">
      {themes.map(theme => {
        const count = pool.filter(word => theme.id === "all" || word.category === theme.id).length;
        return <button key={theme.id} aria-pressed={category === theme.id} disabled={count < 3}
          onClick={() => onChange({ category: theme.id })}>{theme.labels[difficulty]}<span>{count}</span></button>;
      })}
    </div>
  </section>;
}
