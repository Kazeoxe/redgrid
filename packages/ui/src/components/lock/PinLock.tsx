import { useState } from "react";
import { hashPin } from "../../lib/hashPin";

interface PinLockProps {
  /** SHA-256 hex hash of the expected PIN. */
  expectedHash: string;
  length?: 4 | 6;
  onUnlock: () => void;
}

/** Numeric keypad, filled dots, shake on error. No alarming text. */
export function PinLock({ expectedHash, length = 4, onUnlock }: PinLockProps) {
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);
  const [ok, setOk] = useState(false);

  const press = async (d: string) => {
    if (error || ok) return;
    const next = (entered + d).slice(0, length);
    setEntered(next);
    if (next.length === length) {
      const h = await hashPin(next);
      if (h === expectedHash) {
        setOk(true);
        setTimeout(onUnlock, 180);
      } else {
        setError(true);
      }
    }
  };
  const del = () => !error && !ok && setEntered(entered.slice(0, -1));
  const shakeEnd = () => {
    if (error) {
      setError(false);
      setEntered("");
    }
  };

  const filled = ok ? length : entered.length;
  const dotColor = ok ? "var(--rg-accent)" : error ? "var(--rg-danger)" : "var(--rg-ink)";

  return (
    <div className="rg-lock">
      <div className="rg-lock__brand">
        <span className="rg-lock__logo" />
        RedGrid
      </div>
      <div className="rg-lock__prompt">Entrez votre code</div>
      <div
        className="rg-lock__dots"
        data-shake={error}
        onAnimationEnd={shakeEnd}
      >
        {Array.from({ length }, (_, i) => (
          <span key={i} className="rg-lock__dot">
            <span
              className="rg-lock__dot-fill"
              style={{ opacity: i < filled ? 1 : 0, background: dotColor }}
            />
          </span>
        ))}
      </div>
      <div className="rg-lock__pad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} className="rg-lock__key" onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button className="rg-lock__key rg-lock__key--bio" aria-label="Biométrie">
          <span className="rg-lock__bio" />
        </button>
        <button className="rg-lock__key" onClick={() => press("0")}>0</button>
        <button className="rg-lock__key rg-lock__key--del" onClick={del} aria-label="Effacer">
          ⌫
        </button>
      </div>
    </div>
  );
}
