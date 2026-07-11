import type { FeedPost, FeedMedia } from "@redgrid/ui";

// Layout-testing data (Reddit's public JSON is 403-blocked to servers; real
// data needs OAuth). Varied aspect ratios + titles stress `cover`, snapping
// and the info overlay. picsum images are not blocked; one sample video.
const SHAPES = [
  [1080, 1920], // portrait
  [1920, 1080], // landscape
  [1080, 1080], // square
  [1080, 1350], // 4:5
] as const;
const TITLES = [
  "Court",
  "Un titre de longueur moyenne qui tient sur deux lignes",
  "Un titre volontairement très long pour vérifier que l'overlay clampe bien à quatre lignes maximum sans casser la mise en page de la fenêtre",
];
const VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export function makeMockPosts(subreddit: string, page: number, count = 8): FeedPost[] {
  // "a+b" (Mix mode) cycles through group members so the mix is visible.
  const group = subreddit.split("+");
  return Array.from({ length: count }, (_, i) => {
    const n = page * count + i;
    const sub = group[n % group.length]!;
    const [w, h] = SHAPES[n % SHAPES.length]!;
    const poster = `https://picsum.photos/seed/${sub}${n}/${w}/${h}`;
    const media: FeedMedia = n % 4 === 0
      ? { kind: "video", url: VIDEO, poster }
      : { kind: "image", url: poster };
    return {
      id: `${subreddit}-${n}`,
      subreddit: sub,
      title: TITLES[n % TITLES.length]!,
      author: `user_${n % 20}`,
      score: Math.floor(Math.random() * 12000),
      numComments: Math.floor(Math.random() * 800),
      createdUtc: Date.now() / 1000 - n * 3600,
      permalink: `/r/${subreddit}/comments/${n}`,
      media,
    };
  });
}
