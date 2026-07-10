import type { FeedPost } from "@redgrid/ui";

/** Deterministic fake feed so the swipe can be tuned without Reddit auth. */
export function makeMockPosts(subreddit: string, page: number, count = 8): FeedPost[] {
  return Array.from({ length: count }, (_, i) => {
    const n = page * count + i;
    const isVideo = n % 3 === 0;
    return {
      id: `${subreddit}-${n}`,
      subreddit,
      title: `Post #${n} in r/${subreddit} — placeholder title that can run onto a second or third line`,
      author: `user_${n % 20}`,
      score: Math.floor(Math.random() * 12000),
      numComments: Math.floor(Math.random() * 800),
      createdUtc: Date.now() / 1000 - n * 3600,
      permalink: `/r/${subreddit}/comments/${n}`,
      media: isVideo
        ? {
            kind: "video",
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            poster: `https://picsum.photos/seed/${subreddit}${n}/720/1280`,
          }
        : {
            kind: "image",
            url: `https://picsum.photos/seed/${subreddit}${n}/720/1280`,
          },
    };
  });
}
