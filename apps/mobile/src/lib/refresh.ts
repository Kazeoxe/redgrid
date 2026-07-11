import { set } from "idb-keyval";
import { loadTokens, type RedditTokens } from "./oauth";

const KEY = "redgrid:reddit:tokens";
const SKEW_MS = 60_000;

/** Return a valid access token, refreshing if expired within SKEW_MS. Null if not connected. */
export async function getValidAccessToken(clientId: string): Promise<string | null> {
  const t = await loadTokens();
  if (!t) return null;
  if (t.expiresAt > Date.now() + SKEW_MS) return t.accessToken;
  if (!t.refreshToken) return null;
  const r = await fetch("/api/oauth/refresh", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ clientId, refreshToken: t.refreshToken }),
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { access_token: string; expires_in: number; refresh_token?: string };
  const next: RedditTokens = {
    accessToken: j.access_token,
    refreshToken: j.refresh_token ?? t.refreshToken,
    expiresAt: Date.now() + j.expires_in * 1000,
  };
  await set(KEY, next);
  return next.accessToken;
}
