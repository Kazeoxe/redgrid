import { NextResponse } from "next/server";

const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const UA = "web:redgrid:0.1 (personal use)";

export async function POST(req: Request) {
  const { clientId, refreshToken } = await req.json();
  if (!clientId || !refreshToken) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": UA,
      authorization: `Basic ${Buffer.from(`${clientId}:`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  const data = await r.json();
  if (!r.ok) return NextResponse.json({ error: data }, { status: r.status });
  return NextResponse.json(data);
}
