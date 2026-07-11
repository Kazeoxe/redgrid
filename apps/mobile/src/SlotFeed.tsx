"use client";
import { useEffect, useRef, useState } from "react";
import { FeedWindow, type FeedPost, type RedditSettings } from "@redgrid/ui";
import { makeMockPosts } from "./mockPosts";
import { flattenPages, useSubredditFeed } from "./hooks/useSubredditFeed";

interface Props {
  subs: string[];
  pastilleColor: string;
  soundOn: boolean;
  onRequestSound: () => void;
  settings: RedditSettings;
  connected: boolean;
  onPastilleClick?: () => void;
}

/**
 * A window's data source. For a group, a horizontal swipe pages through
 * modes: index 0 = "Mix" (all subs combined), then one sub per page.
 * The mode indicator lives here so it survives the feed's remount-on-switch.
 */
export function SlotFeed({ subs, pastilleColor, soundOn, onRequestSound, settings, connected, onPastilleClick }: Props) {
  const [modeIndex, setModeIndex] = useState(0);
  const [hint, setHint] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(hintTimer.current), []);

  const isGroup = subs.length > 1;
  const modes = isGroup ? ["Mix", ...subs.map((s) => `r/${s}`)] : undefined;
  const effectiveSub = !isGroup
    ? subs[0] ?? "aww"
    : modeIndex === 0
      ? subs.join("+")
      : subs[modeIndex - 1] ?? subs[0]!;

  const changeMode = (i: number) => {
    setModeIndex(i);
    setHint(true);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(false), 1500);
  };

  const shared = {
    pastilleColor,
    soundEnabled: soundOn,
    onRequestSound,
    onPastilleClick,
    modes,
    modeIndex,
    onModeChange: changeMode,
  };

  return (
    <>
      {/* key on the source so switching mode resets the feed to the top. */}
      {connected
        ? <RealFeed key={effectiveSub} subreddit={effectiveSub} settings={settings} shared={shared} />
        : <MockFeed key={effectiveSub} subreddit={effectiveSub} shared={shared} />}
      {modes && hint && (
        <div className="rg-window__mode">
          <span className="rg-window__mode-label">{modes[modeIndex]}</span>
          <span className="rg-window__mode-dots">
            {modes.map((m, i) => <i key={m} data-on={i === modeIndex} />)}
          </span>
        </div>
      )}
    </>
  );
}

type Shared = Omit<Parameters<typeof FeedWindow>[0], "posts" | "onLoadMore">;

function RealFeed({ subreddit, settings, shared }: { subreddit: string; settings: RedditSettings; shared: Shared }) {
  const q = useSubredditFeed({ subreddit, settings, enabled: true });
  return (
    <FeedWindow
      posts={flattenPages(q.data?.pages)}
      onLoadMore={() => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()}
      {...shared}
    />
  );
}

function MockFeed({ subreddit, shared }: { subreddit: string; shared: Shared }) {
  const [posts, setPosts] = useState<FeedPost[]>(() => makeMockPosts(subreddit, 0));
  const loadMore = () => setPosts((p) => [...p, ...makeMockPosts(subreddit, Math.floor(p.length / 8))]);
  return <FeedWindow posts={posts} onLoadMore={loadMore} {...shared} />;
}
