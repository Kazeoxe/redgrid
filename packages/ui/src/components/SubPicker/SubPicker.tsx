import { useState, type FormEvent } from "react";

interface SubPickerProps {
  /** Current subs in this slot (one = normal, many = group). */
  subs: string[];
  /** Previously-used subs across all slots — suggestions. */
  suggestions?: string[];
  /** Human label for the slot: "Fenêtre 3". */
  title: string;
  pastilleColor: string;
  onSave: (subs: string[]) => void;
  onClose: () => void;
}

const clean = (raw: string) =>
  raw.trim().replace(/^\/?r\//i, "").replace(/[^A-Za-z0-9_]/g, "");

/** Edit which subreddit(s) a single window pulls from. Multi = group. */
export function SubPicker({ subs, suggestions = [], title, pastilleColor, onSave, onClose }: SubPickerProps) {
  const [list, setList] = useState<string[]>(subs);
  const [input, setInput] = useState("");
  const canSave = list.length > 0;

  const add = (raw: string) => {
    const v = clean(raw);
    if (!v) return;
    if (list.some((s) => s.toLowerCase() === v.toLowerCase())) return;
    setList([...list, v]);
    setInput("");
  };
  const remove = (s: string) => setList(list.filter((x) => x !== s));

  const submit = (e: FormEvent) => { e.preventDefault(); add(input); };
  const suggest = suggestions.filter((s) => !list.some((l) => l.toLowerCase() === s.toLowerCase()));

  return (
    <div className="rg-picker" onClick={onClose}>
      <div className="rg-picker__card" onClick={(e) => e.stopPropagation()}>
        <div className="rg-picker__header">
          <div className="rg-picker__title">
            <span className="rg-picker__dot" style={{ background: pastilleColor }} />
            {title}
          </div>
          <button className="rg-picker__close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <p className="rg-picker__intro">
          Une seule chaîne = un subreddit. Plusieurs = un groupe combiné dans la même fenêtre.
        </p>

        <div className="rg-picker__chips">
          {list.map((s) => (
            <span key={s} className="rg-picker__chip">
              r/{s}
              <button onClick={() => remove(s)} aria-label={`Retirer r/${s}`}>×</button>
            </span>
          ))}
          {list.length === 0 && <span className="rg-picker__empty">Aucun subreddit.</span>}
        </div>

        <form onSubmit={submit} className="rg-picker__form">
          <input
            className="rg-picker__input rg-mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="nom du subreddit"
            spellCheck={false}
            autoComplete="off"
            autoFocus
          />
          <button type="submit" className="rg-picker__add" disabled={!clean(input)}>Ajouter</button>
        </form>

        {suggest.length > 0 && (
          <div className="rg-picker__suggest">
            <div className="rg-picker__suggest-label">Récents</div>
            <div className="rg-picker__suggest-list">
              {suggest.slice(0, 10).map((s) => (
                <button key={s} className="rg-picker__suggest-chip" onClick={() => add(s)}>
                  r/{s}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="rg-picker__save" disabled={!canSave} onClick={() => onSave(list)}>
          Enregistrer
        </button>
      </div>
    </div>
  );
}
