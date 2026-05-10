import { useCallback, useEffect, useState } from "react";

export interface RecentlyViewedItem {
  handle: string;
  title: string;
  image: string | null;
  viewedAt: number;
}

const KEY = "western-recently-viewed";
const MAX = 6;
const EVENT = "western:recently-viewed-changed";

function read(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: RecentlyViewedItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* ignore quota */
  }
}

export function trackRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  if (!item.handle) return;
  const existing = read().filter((i) => i.handle !== item.handle);
  const next = [{ ...item, viewedAt: Date.now() }, ...existing].slice(0, MAX);
  write(next);
}

export function useRecentlyViewed(excludeHandles: string[] = []) {
  const [items, setItems] = useState<RecentlyViewedItem[]>(() => read());

  useEffect(() => {
    const refresh = () => setItems(read());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = items.filter((i) => !excludeHandles.includes(i.handle));

  const clear = useCallback(() => write([]), []);

  return { items: filtered, clear };
}
