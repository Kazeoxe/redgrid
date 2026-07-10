/** Media kinds RedGrid knows how to render in a feed. */
export type FeedMedia =
  | { kind: "image"; url: string; width?: number; height?: number }
  | { kind: "video"; url: string; poster?: string; hls?: string }
  | { kind: "text" };

/** A single normalized post, decoupled from Reddit's raw API shape. */
export interface FeedPost {
  id: string;
  subreddit: string;
  title: string;
  author: string;
  score: number;
  numComments: number;
  createdUtc: number;
  permalink: string;
  media: FeedMedia;
}
