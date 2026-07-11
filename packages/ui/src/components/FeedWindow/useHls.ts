import { useEffect } from "react";

/**
 * Attach an HLS stream to a <video>. Uses native playback on Safari; loads
 * hls.js lazily on Chromium/Firefox. Falls back to the mp4 `fallbackUrl`
 * (silent) if hls.js can't be reached (offline install, blocked, etc.).
 */
export function useHls(
  ref: React.RefObject<HTMLVideoElement | null>,
  hlsUrl: string | undefined,
  fallbackUrl: string,
  active: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!active) return;

    if (!hlsUrl) { el.src = fallbackUrl; return; }
    if (el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = hlsUrl;
      return;
    }

    let hls: { destroy(): void } | null = null;
    let cancelled = false;
    import("hls.js").then((mod) => {
      if (cancelled) return;
      const Hls = mod.default;
      if (!Hls.isSupported()) { el.src = fallbackUrl; return; }
      const inst = new Hls({ enableWorker: true, lowLatencyMode: false });
      inst.loadSource(hlsUrl);
      inst.attachMedia(el);
      hls = inst;
    }).catch(() => { el.src = fallbackUrl; });

    return () => { cancelled = true; hls?.destroy(); };
  }, [ref, hlsUrl, fallbackUrl, active]);
}
