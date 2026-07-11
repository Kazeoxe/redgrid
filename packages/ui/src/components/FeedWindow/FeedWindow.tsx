import { useEffect, useRef } from "react";
import type { FeedPost } from "../../types";
import { FeedItem } from "./FeedItem";
import { useActiveIndex } from "./useActiveIndex";

export interface FeedWindowProps {
  posts: FeedPost[];
  onLoadMore?: () => void;
  loadMoreThreshold?: number;
  soundEnabled?: boolean;
  onRequestSound?: () => void;
  pastilleColor?: string;
  /** If set, the pastille becomes a button that opens a slot editor. */
  onPastilleClick?: () => void;
  /** Source modes for a group window, e.g. ["Mix", "r/a", "r/b"]. A
   *  horizontal swipe pages through them; omit/≤1 disables paging. */
  modes?: string[];
  modeIndex?: number;
  onModeChange?: (index: number) => void;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * One autonomous vertical feed.
 * Pastille and sound button live at the WINDOW level (fixed above the
 * scrolling media), never inside a slide — they identify the window, not
 * the post, and must not scroll with it.
 */
export function FeedWindow({
  posts,
  onLoadMore,
  loadMoreThreshold = 3,
  soundEnabled = false,
  onRequestSound,
  pastilleColor,
  onPastilleClick,
  modes,
  modeIndex = 0,
  onModeChange,
}: FeedWindowProps) {
  const { containerRef, setItemRef, activeIndex } = useActiveIndex(posts.length);
  const activePost = posts[activeIndex];
  const activeHasVideo = activePost?.media.kind === "video";

  useEffect(() => {
    if (!onLoadMore) return;
    if (activeIndex >= posts.length - loadMoreThreshold) onLoadMore();
  }, [activeIndex, posts.length, loadMoreThreshold, onLoadMore]);

  // Horizontal swipe pages through source modes (group windows only).
  // The mode indicator lives in the parent (SlotFeed) because switching mode
  // remounts this component, which would wipe any local hint state.
  const canPage = !!(modes && modes.length > 1 && onModeChange);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    swipeStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipeStart.current;
    swipeStart.current = null;
    if (!s || !canPage) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    // Horizontal intent: far enough and clearly more sideways than vertical.
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const next = clamp(modeIndex + (dx < 0 ? 1 : -1), 0, modes!.length - 1);
    swiped.current = true;
    if (next !== modeIndex) onModeChange!(next);
  };
  // Suppress the click a swipe leaves behind so it doesn't toggle the overlay.
  const onClickCapture = (e: React.MouseEvent) => {
    if (swiped.current) { e.stopPropagation(); swiped.current = false; }
  };

  return (
    <div
      className="rg-window"
      onPointerDown={canPage ? onPointerDown : undefined}
      onPointerUp={canPage ? onPointerUp : undefined}
      onClickCapture={canPage ? onClickCapture : undefined}
    >
      <div ref={containerRef} className="rg-feed" tabIndex={0}>
        {posts.map((post, i) => (
          <FeedItem
            key={post.id}
            ref={setItemRef(i)}
            post={post}
            active={i === activeIndex}
            eager={Math.abs(i - activeIndex) <= 1}
            muted={!(soundEnabled && i === activeIndex)}
          />
        ))}
      </div>
      {pastilleColor && (
        onPastilleClick ? (
          <button
            type="button"
            className="rg-window__pastille rg-window__pastille--btn"
            style={{ background: pastilleColor }}
            onClick={onPastilleClick}
            aria-label="Éditer la fenêtre"
          />
        ) : (
          <span
            className="rg-window__pastille"
            style={{ background: pastilleColor }}
            aria-label={activePost ? `r/${activePost.subreddit}` : undefined}
          />
        )
      )}
      {activeHasVideo && (
        <button
          className="rg-window__sound"
          onClick={onRequestSound}
          aria-label={soundEnabled ? "Couper le son" : "Activer le son"}
          data-on={soundEnabled}
        >
          <SoundIcon on={soundEnabled} />
        </button>
      )}
    </div>
  );
}

/** Minimal speaker glyph — no emoji, stays discreet. */
function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
      <path d="M3 6h2.5L9 3v10L5.5 10H3z" fill="currentColor" />
      {on ? (
        <path d="M11 5.5c.9.7 1.5 1.6 1.5 2.5s-.6 1.8-1.5 2.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M11 6l3 4M14 6l-3 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      )}
    </svg>
  );
}
