import { forwardRef, useEffect, useRef, useState } from "react";
import type { FeedPost } from "../../types";
import { useHls } from "./useHls";

interface FeedItemProps {
  post: FeedPost;
  active: boolean;
  eager: boolean;
  muted: boolean;
}

export const FeedItem = forwardRef<HTMLElement, FeedItemProps>(function FeedItem(
  { post, active, eager, muted },
  ref,
) {
  const { media } = post;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useHls(
    videoRef,
    media.kind === "video" ? media.hls : undefined,
    media.kind === "video" ? media.url : "",
    media.kind === "video" && eager,
  );

  // Reset the overlay when the slide scrolls out of view.
  useEffect(() => { if (!active) setShowInfo(false); }, [active]);

  return (
    <article ref={ref} className="rg-slide" data-active={active}>
      <div className="rg-slide__media" onClick={() => setShowInfo((v) => !v)}>
        {eager && media.kind === "image" && (
          <img src={media.url} alt="" loading="eager" decoding="async" draggable={false} />
        )}
        {eager && media.kind === "video" && (
          <video
            ref={videoRef}
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

      {showInfo && (
        <div className="rg-slide__info">
          <h3 className="rg-slide__title">{post.title}</h3>
          <div className="rg-slide__stats">
            <span>▲ {fmt(post.score)}</span>
            <span>💬 {fmt(post.numComments)}</span>
          </div>
        </div>
      )}
    </article>
  );
});

function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}
