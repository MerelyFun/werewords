import { RoleArt, type ArtKind } from "./RoleArt";

/** Opposite seats see the same public content; secrets are masked before passing props. */
export function TablePrompt({ title, description, art, word, timer, response, wordOnly = false }: {
  title: string; description: string; art: ArtKind;
  word?: string; timer?: string; response?: string; wordOnly?: boolean;
}) {
  if (wordOnly) return <section className="opposite-face word-only-face" aria-hidden="true" data-testid="opposite-face">
    <strong className="opposite-word">{word}</strong>
  </section>;
  return <section className="opposite-face" aria-hidden="true" data-testid="opposite-face">
    <RoleArt kind={art} />
    <div className="opposite-copy">
      <p className="opposite-title">{title}</p>
      {word ? <strong className="opposite-word">{word}</strong> : null}
      {response ? <strong className="opposite-response">{response}</strong> : null}
      <p className="opposite-description">{description}</p>
      {timer ? <span className="opposite-timer">{timer}</span> : null}
    </div>
  </section>;
}
