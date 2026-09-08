import { wordLibraries, type PlayDifficulty } from "./words";

const order: Record<string, number> = { builtin: 0, "party-night": 1 };
const libraries = [...wordLibraries].sort((a, b) => (order[a.id] ?? 2) - (order[b.id] ?? 2));

export function WordSettings({ libraryIds, difficulty, onChange }: {
  libraryIds: string[]; difficulty: PlayDifficulty;
  onChange: (settings: { libraryIds?: string[]; difficulty?: PlayDifficulty }) => void;
}) {
  return <section className="word-settings" aria-label="难度与词库">
    <div className="library-heading">词库 <span>可多选</span></div>
    <div className="library-options" role="group" aria-label="词库">
      {libraries.map(library => <label className="library-option" key={library.id}>
        <input type="checkbox" checked={libraryIds.includes(library.id)}
          disabled={libraryIds.length === 1 && libraryIds.includes(library.id)}
          onChange={event => onChange({ libraryIds: event.target.checked
            ? [...libraryIds, library.id] : libraryIds.filter(id => id !== library.id) })} />
        <span>{library.name}</span>
      </label>)}
    </div>
    <div className="difficulty-row"><span>难度</span>
      <div className="difficulty-tabs" role="group" aria-label="难度">
        {([{ id: "easy", label: "标准" }, { id: "hard", label: "挑战" }] as const).map(item =>
          <button key={item.id} aria-pressed={item.id === difficulty}
            onClick={() => onChange({ difficulty: item.id })}>{item.label}</button>)}
      </div>
    </div>
  </section>;
}
