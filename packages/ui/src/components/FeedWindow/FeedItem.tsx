import { forwardRef, useRef } from "react";
import type { FeedPost } from "../../types";
import { useHls } from "./useHls";

interface FeedItemProps {
  post: FeedPost;
  active: boolean;
  eager: boolean;
  muted: boolean;
  onTapMedia: () => void;
}

export const FeedItem = forwardRef<HTMLElement, FeedItemProps>(function FeedItem(
  { post, active, eager, muted, onTapMedia },
  ref,
) {
  const { media } = post;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useHls(
    videoRef,
    media.kind === "video" ? media.hls : undefined,
    media.kind === "video" ? media.url : "",
    media.kind === "video" && eager,
  );

  return (
    <article ref={ref} className="rg-slide" data-active={active}>
      <div className="rg-slide__media" onClick={onTapMedia}>
        {eager && media.kind === "image" && (
          <img src={media.url} alt="" loading="lazy" draggable={false} />
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
    </article>
  );
});
