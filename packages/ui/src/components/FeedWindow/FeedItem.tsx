import { forwardRef } from "react";
import type { FeedPost } from "../../types";

interface FeedItemProps {
  post: FeedPost;
  active: boolean;
  eager: boolean;
  muted: boolean;
  onTapMedia: () => void;
}

/** One full-viewport slide. Media only — window-level chrome sits outside. */
export const FeedItem = forwardRef<HTMLElement, FeedItemProps>(function FeedItem(
  { post, active, eager, muted, onTapMedia },
  ref,
) {
  const { media } = post;
  return (
    <article ref={ref} className="rg-slide" data-active={active}>
      <div className="rg-slide__media" onClick={onTapMedia}>
        {eager && media.kind === "image" && (
          <img src={media.url} alt="" loading="lazy" draggable={false} />
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
          />
        )}
        {media.kind === "text" && <div className="rg-slide__text-bg" />}
      </div>
    </article>
  );
});
