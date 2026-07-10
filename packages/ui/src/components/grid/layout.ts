import type { CSSProperties } from "react";

export type LayoutN = 1 | 2 | 4 | 6;

/** Pastille palette from the design brief. */
export const PASTILLE_COLORS = [
  "oklch(0.72 0.17 155)",
  "oklch(0.7 0.16 250)",
  "oklch(0.72 0.16 320)",
  "oklch(0.78 0.15 90)",
  "oklch(0.68 0.15 200)",
  "oklch(0.72 0.15 30)",
] as const;

export function layoutGridStyle(n: LayoutN): CSSProperties {
  switch (n) {
    case 1: return { gridTemplateColumns: "1fr", gridTemplateRows: "1fr" };
    case 2: return { gridTemplateColumns: "1fr", gridTemplateRows: "1fr 1fr" };
    case 4: return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" };
    case 6: return { gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr" };
  }
}
