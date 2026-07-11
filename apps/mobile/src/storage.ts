import { get, set } from "idb-keyval";
import type { RedditSettings } from "@redgrid/ui";

const KEY = "redgrid:settings";

export const defaultSettings = (origin: string): RedditSettings => ({
  clientId: "",
  redirectUri: `${origin}/oauth/callback`,
  username: "",
});

export const loadSettings = async (origin: string): Promise<RedditSettings> => {
  const stored = await get<RedditSettings>(KEY);
  return { ...defaultSettings(origin), ...(stored ?? {}) };
};

export const saveSettings = (s: RedditSettings) => set(KEY, s);
