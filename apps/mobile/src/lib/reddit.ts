import type { FeedPost, FeedMedia } from "@redgrid/ui";
import type { RedditSettings } from "@redgrid/ui";

const OAUTH_BASE = "https://oauth.reddit.com";

interface RedditListing {
  data: { after: string | null; children: { kind: string; data: RedditPost }[] };
}
interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  is_video: boolean;
  is_self: boolean;
  post_hint?: string;
  url: string;
  url_overridden_by_dest?: string;
  media?: { reddit_video?: { fallback_url: string; hls_url?: string; scrubber_media_url?: string } };
  preview?: { images: { source: { url: string; width: number; height: number } }[] };
}

const ua = (username: string) => `web:redgrid:0.1 (by /u/${username || "anon"})`;
const decode = (s: string) => s.replace(/&amp;/g, "&");

/** Turn a Reddit t3 into our FeedPost, or null if we can't render it. */
function normalize(p: RedditPost): FeedPost | null {
  let media: FeedMedia;
  const video = p.media?.reddit_video;
  if (p.is_video && video) {
    media = { kind: "video", url: video.fallback_url, hls: video.hls_url };
  } else if (p.post_hint === "image" || /\.(jpg|jpeg|png|gif|webp)$/i.test(p.url)) {
    const src = p.preview?.images?.[0]?.source?.url;
    media = { kind: "image", url: decode(src ?? p.url_overridden_by_dest ?? p.url) };
  } else if (p.is_self) {
    media = { kind: "text" };
  } else {
    return null; // link post, gallery, unsupported — skip for now
  }
  return {
    id: p.id,
    subreddit: p.subreddit,
    title: p.title,
    author: p.author,
    score: p.score,
    numComments: p.num_comments,
    createdUtc: p.created_utc,
    permalink: p.permalink,
    media,
  };
}

export interface FetchArgs {
  subreddit: string;
  after?: string;
  accessToken: string;
  settings: RedditSettings;
  signal?: AbortSignal;
}

export async function fetchSubreddit({ subreddit, after, accessToken, settings, signal }: FetchArgs): Promise<{ posts: FeedPost[]; after: string | null }> {
  const url = new URL(`${OAUTH_BASE}/r/${subreddit}/hot`);
  url.searchParams.set("limit", "25");
  url.searchParams.set("raw_json", "1");
  if (after) url.searchParams.set("after", after);
  const r = await fetch(url, {
    signal,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "user-agent": ua(settings.username),
    },
  });
  if (r.status === 401) throw new UnauthorizedError();
  if (!r.ok) throw new Error(`Reddit ${r.status}`);
  const j = (await r.json()) as RedditListing;
  const posts = j.data.children
    .filter((c) => c.kind === "t3")
    .map((c) => normalize(c.data))
    .filter((p): p is FeedPost => p !== null);
  return { posts, after: j.data.after };
}

export class UnauthorizedError extends Error {
  constructor() { super("Reddit token invalide."); this.name = "UnauthorizedError"; }
}
