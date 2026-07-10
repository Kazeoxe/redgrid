import { useEffect } from "react";
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
}

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
}: FeedWindowProps) {
  const { containerRef, setItemRef, activeIndex } = useActiveIndex(posts.length);
  const activePost = posts[activeIndex];
  const activeHasVideo = activePost?.media.kind === "video";

  useEffect(() => {
    if (!onLoadMore) return;
    if (activeIndex >= posts.length - loadMoreThreshold) onLoadMore();
  }, [activeIndex, posts.length, loadMoreThreshold, onLoadMore]);

  return (
    <div className="rg-window">
      <div ref={containerRef} className="rg-feed" tabIndex={0}>
        {posts.map((post, i) => (
          <FeedItem
            key={post.id}
            ref={setItemRef(i)}
            post={post}
            active={i === activeIndex}
            eager={Math.abs(i - activeIndex) <= 1}
            muted={!(soundEnabled && i === activeIndex)}
            onTapMedia={() => activeHasVideo && onRequestSound?.()}
          />
        ))}
      </div>
      {pastilleColor && (
        <span
          className="rg-window__pastille"
          style={{ background: pastilleColor }}
          aria-label={activePost ? `r/${activePost.subreddit}` : undefined}
        />
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
