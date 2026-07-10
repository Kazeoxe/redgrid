import { useEffect, useRef, useState } from "react";

/**
 * Tracks which slide is currently centered inside a scroll-snap container.
 * Uses IntersectionObserver (cheap, off the main thread) rather than scroll
 * math, so it stays smooth at 60fps even with several feeds side by side.
 */
export function useActiveIndex(count: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const setItemRef = (index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  };

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = itemRefs.current.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { root, threshold: [0.6] },
    );

    for (const el of itemRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [count]);

  return { containerRef, setItemRef, activeIndex };
}
