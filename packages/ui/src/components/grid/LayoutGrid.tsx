import { useEffect, useRef, useState, type ReactNode } from "react";
import { PASTILLE_COLORS, layoutGridStyle, type LayoutN } from "./layout";

interface LayoutGridProps {
  layout: LayoutN;
  onLayoutChange: (n: LayoutN) => void;
  /** Show the 6-window option (PC in fullscreen). */
  allow6?: boolean;
  renderSlot: (index: number, pastilleColor: string) => ReactNode;
  onOpenSettings?: () => void;
}

/** N-window grid with an inline layout picker in the corner. */
export function LayoutGrid({
  layout,
  onLayoutChange,
  allow6 = false,
  renderSlot,
  onOpenSettings,
}: LayoutGridProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [pickerOpen]);

  const options: LayoutN[] = allow6 ? [1, 2, 4, 6] : [1, 2, 4];

  return (
    <div className="rg-grid" style={layoutGridStyle(layout)}>
      {Array.from({ length: layout }, (_, i) => (
        <div key={i} className="rg-grid__slot">
          {renderSlot(i, PASTILLE_COLORS[i]!)}
        </div>
      ))}

      <button
        className="rg-grid__dots"
        onClick={() => setPickerOpen((v) => !v)}
        aria-label="Options"
        data-open={pickerOpen}
      >
        <span /><span /><span />
      </button>

      {pickerOpen && (
        <div ref={pickerRef} className="rg-grid__picker" role="toolbar">
          {options.map((n) => (
            <button
              key={n}
              className="rg-grid__picker-btn"
              data-selected={n === layout}
              onClick={() => { onLayoutChange(n); setPickerOpen(false); }}
            >
              {n}
            </button>
          ))}
          <span className="rg-grid__picker-sep" />
          <button
            className="rg-grid__picker-btn"
            onClick={() => { setPickerOpen(false); onOpenSettings?.(); }}
            aria-label="Réglages"
          >
            <GearIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
