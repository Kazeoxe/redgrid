"use client";
import { useState } from "react";
import { FeedWindow, type FeedPost, type RedditSettings } from "@redgrid/ui";
import { makeMockPosts } from "./mockPosts";
import { flattenPages, useSubredditFeed } from "./hooks/useSubredditFeed";

interface Props {
  subreddit: string;
  pastilleColor: string;
  soundOn: boolean;
  onRequestSound: () => void;
  settings: RedditSettings;
  connected: boolean;
  onPastilleClick?: () => void;
}

export function SlotFeed(props: Props) {
  return props.connected ? <RealFeed {...props} /> : <MockFeed {...props} />;
}

function RealFeed({ subreddit, pastilleColor, soundOn, onRequestSound, settings, onPastilleClick }: Props) {
  const q = useSubredditFeed({ subreddit, settings, enabled: true });
  const posts = flattenPages(q.data?.pages);
  return (
    <FeedWindow
      posts={posts}
      onLoadMore={() => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()}
      pastilleColor={pastilleColor}
      soundEnabled={soundOn}
      onRequestSound={onRequestSound}
      onPastilleClick={onPastilleClick}
    />
  );
}

function MockFeed({ subreddit, pastilleColor, soundOn, onRequestSound, onPastilleClick }: Props) {
  const [posts, setPosts] = useState<FeedPost[]>(() => makeMockPosts(subreddit, 0));
  const loadMore = () => setPosts((p) => [...p, ...makeMockPosts(subreddit, Math.floor(p.length / 8))]);
  return (
    <FeedWindow
      posts={posts}
      onLoadMore={loadMore}
      pastilleColor={pastilleColor}
      soundEnabled={soundOn}
      onRequestSound={onRequestSound}
      onPastilleClick={onPastilleClick}
    />
  );
}
