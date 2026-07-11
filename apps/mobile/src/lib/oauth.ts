import { del, get, set } from "idb-keyval";
import type { RedditSettings } from "@redgrid/ui";

/** OAuth scopes RedGrid actually needs: reading listings. */
export const SCOPES = "read";
const AUTHORIZE_URL = "https://www.reddit.com/api/v1/authorize";
const VERIFIER_KEY = "redgrid:pkce:verifier";
const STATE_KEY = "redgrid:pkce:state";
const TOKENS_KEY = "redgrid:reddit:tokens";

export interface RedditTokens {
  accessToken: string;
  refreshToken: string;
  /** Absolute epoch ms when the access token expires. */
  expiresAt: number;
}

// ---- PKCE primitives ---------------------------------------------------

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const randomB64url = (byteLen = 32) => b64url(crypto.getRandomValues(new Uint8Array(byteLen)));

const sha256b64url = async (s: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return b64url(new Uint8Array(buf));
};

// ---- Public API --------------------------------------------------------

/** Start the OAuth dance: stash verifier+state in IDB, redirect to Reddit. */
export async function beginOAuth(settings: RedditSettings): Promise<string> {
  const verifier = randomB64url(48);
  const state = randomB64url(16);
  const challenge = await sha256b64url(verifier);
  await set(VERIFIER_KEY, verifier);
  await set(STATE_KEY, state);
  const u = new URL(AUTHORIZE_URL);
  u.searchParams.set("client_id", settings.clientId);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("state", state);
  u.searchParams.set("redirect_uri", settings.redirectUri);
  u.searchParams.set("duration", "permanent");
  u.searchParams.set("scope", SCOPES);
  u.searchParams.set("code_challenge", challenge);
  u.searchParams.set("code_challenge_method", "S256");
  return u.toString();
}

/** Callback side: verify state, exchange code for tokens via our proxy. */
export async function completeOAuth(params: URLSearchParams, settings: RedditSettings) {
  const code = params.get("code");
  const state = params.get("state");
  const err = params.get("error");
  if (err) throw new Error(`Reddit refusa la connexion: ${err}`);
  if (!code || !state) throw new Error("Paramètres manquants dans le callback.");
  const [expectedState, verifier] = await Promise.all([get<string>(STATE_KEY), get<string>(VERIFIER_KEY)]);
  if (state !== expectedState) throw new Error("État PKCE invalide (rejeu ou lien tampered).");
  if (!verifier) throw new Error("Verifier PKCE introuvable.");

  const res = await fetch("/api/oauth/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      clientId: settings.clientId,
      redirectUri: settings.redirectUri,
      code,
      codeVerifier: verifier,
    }),
  });
  if (!res.ok) throw new Error(`Échange du code échoué: ${res.status}`);
  const t = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
  const tokens: RedditTokens = {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: Date.now() + t.expires_in * 1000,
  };
  await Promise.all([set(TOKENS_KEY, tokens), del(VERIFIER_KEY), del(STATE_KEY)]);
  return tokens;
}

export const loadTokens = () => get<RedditTokens>(TOKENS_KEY);
export const clearTokens = () => del(TOKENS_KEY);
