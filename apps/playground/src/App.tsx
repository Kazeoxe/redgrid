import { useCallback, useRef, useState } from "react";
import { FeedWindow, type FeedPost } from "@redgrid/ui";
import { makeMockPosts } from "./mockPosts";

const SUBREDDIT = "aww";

export function App() {
  const [posts, setPosts] = useState<FeedPost[]>(() => makeMockPosts(SUBREDDIT, 0));
  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const [soundOn, setSoundOn] = useState(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    pageRef.current += 1;
    // Simulate a paginated Reddit `after` fetch.
    setTimeout(() => {
      setPosts((prev) => [...prev, ...makeMockPosts(SUBREDDIT, pageRef.current)]);
      loadingRef.current = false;
    }, 200);
  }, []);

  return (
    <div className="playground">
      <FeedWindow
        posts={posts}
        onLoadMore={loadMore}
        soundEnabled={soundOn}
        onRequestSound={() => setSoundOn((s) => !s)}
      />
    </div>
  );
}
