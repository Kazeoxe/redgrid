import { forwardRef } from "react";
import type { FeedPost } from "../../types";

interface FeedItemProps {
  post: FeedPost;
  /** True when this slide is the one centered in the viewport. */
  active: boolean;
  /** True when it should mount/preload its media (active or adjacent). */
  eager: boolean;
  muted: boolean;
  onToggleSound: () => void;
}

/** One full-viewport slide inside a FeedWindow. */
export const FeedItem = forwardRef<HTMLElement, FeedItemProps>(function FeedItem(
  { post, active, eager, muted, onToggleSound },
  ref,
) {
  const { media } = post;

  return (
    <article ref={ref} className="rg-slide" data-active={active}>
      <div className="rg-slide__media">
        {eager && media.kind === "image" && (
          <img src={media.url} alt={post.title} loading="lazy" draggable={false} />
        )}
        {eager && media.kind === "video" && (
          <video
            src={media.url}
            poster={media.poster}
            autoPlay={active}
            muted={muted}
            loop
            playsInline
            preload={active ? "auto" : "metadata"}
            onClick={onToggleSound}
          />
        )}
        {media.kind === "text" && <div className="rg-slide__text-bg" />}
      </div>

      <div className="rg-slide__overlay">
        <div className="rg-slide__meta">
          <span className="rg-slide__sub">r/{post.subreddit}</span>
          <span className="rg-slide__author">u/{post.author}</span>
        </div>
        <h2 className="rg-slide__title">{post.title}</h2>
        <div className="rg-slide__stats">
          <span>▲ {formatCount(post.score)}</span>
          <span>💬 {formatCount(post.numComments)}</span>
          {media.kind === "video" && (
            <button className="rg-slide__sound" onClick={onToggleSound}>
              {muted ? "🔇" : "🔊"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
