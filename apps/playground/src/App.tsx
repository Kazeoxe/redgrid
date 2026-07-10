import { useEffect, useState } from "react";
import {
  FeedWindow,
  LayoutGrid,
  PinLock,
  Settings,
  hashPin,
  type FeedPost,
  type LayoutN,
  type RedditSettings,
} from "@redgrid/ui";
import { makeMockPosts } from "./mockPosts";

const DEFAULT_SUBS = ["aww", "spacevideos", "EarthPorn", "oddlysatisfying", "interestingasfuck", "nature"];
const isMobile = () => window.matchMedia("(pointer: coarse)").matches;

const SETTINGS_KEY = "redgrid:settings";
const DEFAULT_SETTINGS: RedditSettings = {
  clientId: "",
  redirectUri: "http://localhost:5180/oauth/callback",
  username: "",
};
const loadSettings = (): RedditSettings => {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") }; }
  catch { return DEFAULT_SETTINGS; }
};

export function App() {
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [layout, setLayout] = useState<LayoutN>(4);
  const [soundOwner, setSoundOwner] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<RedditSettings>(loadSettings);

  useEffect(() => { hashPin("1234").then(setPinHash); }, []);
  if (!pinHash) return null;

  if (!unlocked) return <PinLock expectedHash={pinHash} onUnlock={() => setUnlocked(true)} />;

  return (
    <>
      <LayoutGrid
        layout={layout}
        onLayoutChange={setLayout}
        allow6={!isMobile()}
        onOpenSettings={() => setSettingsOpen(true)}
        renderSlot={(i, color) => (
          <SlotFeed
            subreddit={DEFAULT_SUBS[i] ?? "aww"}
            pastilleColor={color}
            soundOn={soundOwner === i}
            onRequestSound={() => setSoundOwner((cur) => (cur === i ? null : i))}
          />
        )}
      />
      {settingsOpen && (
        <Settings
          initial={settings}
          onClose={() => setSettingsOpen(false)}
          onSave={(s) => {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
            setSettings(s);
            setSettingsOpen(false);
          }}
        />
      )}
    </>
  );
}

interface SlotFeedProps {
  subreddit: string;
  pastilleColor: string;
  soundOn: boolean;
  onRequestSound: () => void;
}
function SlotFeed({ subreddit, pastilleColor, soundOn, onRequestSound }: SlotFeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>(() => makeMockPosts(subreddit, 0));
  const loadMore = () => setPosts((p) => [...p, ...makeMockPosts(subreddit, Math.floor(p.length / 8))]);
  return (
    <FeedWindow
      posts={posts}
      onLoadMore={loadMore}
      pastilleColor={pastilleColor}
      soundEnabled={soundOn}
      onRequestSound={onRequestSound}
    />
  );
}
