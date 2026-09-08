import { getWordLibrary, wordLibraries, type Category, type Difficulty } from "./words";

const difficulties = [
  { id: "easy", label: "标准", hint: "熟悉的事物，轻松开局" },
  { id: "hard", label: "挑战", hint: "更细的线索，更有趣的答案" },
] as const;
const themes: { id: Category | "all"; labels: Partial<Record<Difficulty, string>> }[] = [
  { id: "all", labels: { easy: "全部主题", hard: "全部主题" } },
  { id: "日常", labels: { easy: "日常生活", hard: "奇妙器物" } },
  { id: "自然", labels: { easy: "自然万物", hard: "自然奇观" } },
  { id: "饮食", labels: { easy: "好吃好喝", hard: "风味美食" } },
  { id: "趣味", labels: { easy: "休闲趣味", hard: "艺术游艺" } },
];

export function WordSettings({ libraryId, difficulty, category, onChange }: {
  libraryId: string; difficulty: Difficulty; category: Category | "all";
  onChange: (settings: { libraryId?: string; difficulty?: Difficulty; category?: Category | "all" }) => void;
}) {
  const library = getWordLibrary(libraryId);
  const pool = library.words.filter(word => word.difficulty === difficulty);
  const categories = ["all", ...new Set(pool.map(word => word.category))];
  return <section className="word-settings" aria-label="难度与词库">
    <div className="library-select"><label htmlFor="word-library">词库来源</label>
      <select id="word-library" value={library.id} onChange={event => onChange({ libraryId: event.target.value, category: "all", difficulty: "easy" })}>
        {wordLibraries.map(item => <option key={item.id} value={item.id}>{item.name} · {item.words.length} 词</option>)}
      </select>
    </div>
    <div className="difficulty-tabs" role="group" aria-label="难度">
      {library.difficulties.map(item => <button key={item.id} aria-pressed={item.id === difficulty}
        onClick={() => onChange({ difficulty: item.id })}>{item.label}</button>)}
    </div>
    {library.id === "builtin" && <p className="difficulty-hint">{difficulties.find(item => item.id === difficulty)?.hint}</p>}
    <div className="theme-options" role="group" aria-label="词库主题">
      {categories.map(id => {
        const count = pool.filter(word => id === "all" || word.category === id).length;
        const label = library.id === "builtin" ? themes.find(theme => theme.id === id)?.labels[difficulty] : id === "all" ? "全部主题" : id;
        return <button key={id} aria-pressed={category === id} disabled={count < 3}
          onClick={() => onChange({ category: id })}>{label ?? id}<span>{count}</span></button>;
      })}
    </div>
  </section>;
}
