import { useInfiniteQuery } from "@tanstack/react-query";
import type { FeedPost, RedditSettings } from "@redgrid/ui";
import { fetchSubreddit, UnauthorizedError, type Page } from "../lib/reddit";
import { getValidAccessToken } from "../lib/refresh";

interface Args {
  subreddit: string;
  settings: RedditSettings;
  /** True once the user completed OAuth. */
  enabled: boolean;
}

/** One infinite listing per subreddit (authenticated). */
export function useSubredditFeed({ subreddit, settings, enabled }: Args) {
  return useInfiniteQuery<Page, Error, { pages: Page[]; pageParams: (string | undefined)[] }, readonly string[], string | undefined>({
    queryKey: ["reddit", subreddit] as const,
    enabled,
    initialPageParam: undefined,
    getNextPageParam: (last) => last.after ?? undefined,
    queryFn: async ({ pageParam, signal }) => {
      const token = await getValidAccessToken(settings.clientId);
      if (!token) throw new UnauthorizedError();
      return fetchSubreddit({ subreddit, after: pageParam, accessToken: token, settings, signal });
    },
    staleTime: 60_000,
  });
}

/** Flatten pages into the FeedPost[] the FeedWindow wants. */
export const flattenPages = (pages: { posts: FeedPost[] }[] | undefined): FeedPost[] =>
  pages?.flatMap((p) => p.posts) ?? [];
