import { NextResponse } from "next/server";

const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const UA = "web:redgrid:0.1 (personal use)";

/** Exchange an authorization code for tokens. Runs server-side so Reddit's
 *  CORS-blocked token endpoint is reachable and Basic auth header stays off
 *  the wire from the browser. */
export async function POST(req: Request) {
  const { clientId, redirectUri, code, codeVerifier } = await req.json();
  if (!clientId || !redirectUri || !code || !codeVerifier) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": UA,
      // Installed apps: Basic auth uses client_id with an empty secret.
      authorization: `Basic ${Buffer.from(`${clientId}:`).toString("base64")}`,
    },
    body,
  });
  const data = await r.json();
  if (!r.ok) return NextResponse.json({ error: data }, { status: r.status });
  return NextResponse.json(data);
}
