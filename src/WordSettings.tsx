import { wordLibraries } from "./words";

const order: Record<string, number> = { builtin: 0, "party-night": 1 };
const libraries = [...wordLibraries].sort((a, b) => (order[a.id] ?? 2) - (order[b.id] ?? 2));

export function WordSettings({ libraryIds, onChange }: {
  libraryIds: string[];
  onChange: (settings: { libraryIds?: string[] }) => void;
}) {
  const selected = libraries.filter(library => libraryIds.includes(library.id));
  const summary = selected.length > 1 ? `${selected[0].name} 等 ${selected.length} 个` : selected[0]?.name ?? "选择词库";
  return <section className="word-settings" aria-label="词库设置">
    <details className="library-picker">
      <summary>
        <span className="library-picker-label">词库</span>
        <span className="library-selection" title={selected.map(library => library.name).join("、")}>{summary}</span>
        <span className="library-chevron" aria-hidden="true" />
      </summary>
      <div className="library-picker-hint">可多选</div>
      <div className="library-options" role="group" aria-label="词库">
      {libraries.map(library => <label className="library-option" key={library.id}>
        <input type="checkbox" checked={libraryIds.includes(library.id)}
          disabled={libraryIds.length === 1 && libraryIds.includes(library.id)}
          onChange={event => onChange({ libraryIds: event.target.checked
            ? [...libraryIds, library.id] : libraryIds.filter(id => id !== library.id) })} />
        <span>{library.name}</span>
      </label>)}
      </div>
    </details>
  </section>;
}
