"use client";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid,
  PinLock,
  Settings,
  SubPicker,
  hashPin,
  type LayoutN,
  type RedditSettings,
} from "@redgrid/ui";
import { loadSettings, saveSettings } from "./storage";
import { beginOAuth, clearTokens, loadTokens, type RedditTokens } from "./lib/oauth";
import { loadSlots, saveSlots, type Slot } from "./slots";
import { SlotFeed } from "./SlotFeed";

const FALLBACK_SUB = "aww";
const isMobile = () => window.matchMedia("(pointer: coarse)").matches;

export function App() {
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [layout, setLayout] = useState<LayoutN>(4);
  const [soundOwner, setSoundOwner] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<RedditSettings | null>(null);
  const [tokens, setTokens] = useState<RedditTokens | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  useEffect(() => {
    hashPin("1234").then(setPinHash);
    loadSettings(window.location.origin).then(setSettings);
    loadTokens().then((t) => setTokens(t ?? null));
    loadSlots().then(setSlots);
  }, []);

  const recentSubs = useMemo(() => {
    if (!slots) return [];
    return Array.from(new Set(slots.flatMap((s) => s.subs)));
  }, [slots]);

  if (!pinHash || !settings || !slots) return null;
  if (!unlocked) return <PinLock expectedHash={pinHash} onUnlock={() => setUnlocked(true)} />;

  const connected = !!tokens;
  const slotAt = (i: number): Slot => slots[i] ?? { subs: [FALLBACK_SUB] };
  const subUrlFor = (i: number) => slotAt(i).subs.join("+") || FALLBACK_SUB;

  return (
    <>
      <LayoutGrid
        layout={layout}
        onLayoutChange={setLayout}
        allow6={!isMobile()}
        onOpenSettings={() => setSettingsOpen(true)}
        renderSlot={(i, color) => (
          <SlotFeed
            subreddit={subUrlFor(i)}
            pastilleColor={color}
            soundOn={soundOwner === i}
            onRequestSound={() => setSoundOwner((cur) => (cur === i ? null : i))}
            settings={settings}
            connected={connected}
            onPastilleClick={() => setEditingSlot(i)}
          />
        )}
      />
      {editingSlot !== null && (
        <SubPicker
          title={`Fenêtre ${editingSlot + 1}`}
          pastilleColor={pastilleColorFor(editingSlot)}
          subs={slotAt(editingSlot).subs}
          suggestions={recentSubs}
          onClose={() => setEditingSlot(null)}
          onSave={async (subs) => {
            const next = slots.map((s, idx) => (idx === editingSlot ? { subs } : s));
            // pad if user asked for a slot index beyond current length
            while (next.length <= editingSlot) next.push({ subs: [FALLBACK_SUB] });
            await saveSlots(next);
            setSlots(next);
            setEditingSlot(null);
          }}
        />
      )}
      {settingsOpen && (
        <Settings
          initial={settings}
          onClose={() => setSettingsOpen(false)}
          onSave={async (s) => { await saveSettings(s); setSettings(s); }}
          connected={connected}
          onConnect={async () => {
            const url = await beginOAuth(settings);
            window.location.href = url;
          }}
          onDisconnect={async () => { await clearTokens(); setTokens(null); }}
        />
      )}
    </>
  );
}

// Mirror the palette in @redgrid/ui/PASTILLE_COLORS so the picker header
// shows the same dot as the grid pastille.
const PALETTE = [
  "oklch(0.72 0.17 155)",
  "oklch(0.7 0.16 250)",
  "oklch(0.72 0.16 320)",
  "oklch(0.78 0.15 90)",
  "oklch(0.68 0.15 200)",
  "oklch(0.72 0.15 30)",
];
const pastilleColorFor = (i: number) => PALETTE[i % PALETTE.length]!;
