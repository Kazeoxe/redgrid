import { useEffect } from "react";
import type { FeedPost } from "../../types";
import { FeedItem } from "./FeedItem";
import { useActiveIndex } from "./useActiveIndex";

export interface FeedWindowProps {
  posts: FeedPost[];
  /** Called when the user nears the end, to fetch the next page. */
  onLoadMore?: () => void;
  /** How many slides from the end triggers onLoadMore. */
  loadMoreThreshold?: number;
  /** Whether this window currently owns the single active audio channel. */
  soundEnabled?: boolean;
  onRequestSound?: () => void;
}

/**
 * A single autonomous vertical "TikTok" feed.
 * Native scroll-snap drives the swipe (60fps, momentum handled by the OS);
 * IntersectionObserver tracks the active slide for autoplay + prefetch.
 */
export function FeedWindow({
  posts,
  onLoadMore,
  loadMoreThreshold = 3,
  soundEnabled = false,
  onRequestSound,
}: FeedWindowProps) {
  const { containerRef, setItemRef, activeIndex } = useActiveIndex(posts.length);

  // Infinite pagination: ask for more as the active slide approaches the tail.
  useEffect(() => {
    if (!onLoadMore) return;
    if (activeIndex >= posts.length - loadMoreThreshold) onLoadMore();
  }, [activeIndex, posts.length, loadMoreThreshold, onLoadMore]);

  return (
    <div ref={containerRef} className="rg-feed" tabIndex={0}>
      {posts.map((post, i) => (
        <FeedItem
          key={post.id}
          ref={setItemRef(i)}
          post={post}
          active={i === activeIndex}
          // Mount media for the active slide and its neighbours only.
          eager={Math.abs(i - activeIndex) <= 1}
          muted={!(soundEnabled && i === activeIndex)}
          onToggleSound={() => onRequestSound?.()}
        />
      ))}
    </div>
  );
}
