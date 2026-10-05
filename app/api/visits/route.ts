const TABLE_URL = "/rest/v1/page_visits";
const VISIT_COOKIE = "jelly-visit";
const VISIT_WINDOW_SECONDS = 24 * 60 * 60;

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY;
  return url && key ? { url, key } : null;
}

function unavailable() {
  return Response.json({ error: "Visit count unavailable" }, {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}

async function countVisits(url: string, key: string) {
  const response = await fetch(`${url}${TABLE_URL}?select=id&limit=0`, {
    method: "HEAD",
    headers: { apikey: key, Prefer: "count=exact" },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const match = response.headers.get("content-range")?.match(/\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

export async function POST(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (origin && origin !== requestOrigin) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const config = supabaseConfig();
  if (!config) return unavailable();

  try {
    const alreadyVisited = request.headers.get("cookie")?.split(";").some((cookie) =>
      cookie.trim().startsWith(`${VISIT_COOKIE}=`)) ?? false;
    const headers = new Headers({ "Cache-Control": "no-store" });

    if (!alreadyVisited) {
      const insert = await fetch(`${config.url}${TABLE_URL}`, {
        method: "POST",
        headers: {
          apikey: config.key,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ page_path: "/" }),
        cache: "no-store",
      });
      if (!insert.ok) return unavailable();
      headers.set("Set-Cookie", `${VISIT_COOKIE}=1; Path=/; Max-Age=${VISIT_WINDOW_SECONDS}; HttpOnly; SameSite=Lax${requestOrigin.startsWith("https:") ? "; Secure" : ""}`);
    }

    const count = await countVisits(config.url, config.key);
    if (count === null) return Response.json({ error: "Visit count unavailable" }, { status: 503, headers });

    return Response.json({ count }, { headers });
  } catch {
    return unavailable();
  }
}
