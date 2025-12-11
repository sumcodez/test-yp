// src/app/api/ip/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRIMARY = "https://ipapi.co";
const FALLBACK = "https://ipwhois.app/json"; // fallback provider: ipwhois.app/json/<ip> or /json for caller
const FETCH_TIMEOUT_MS = 8000;

// Simple in-memory cache (process-level). Good for dev and single-instance deployments.
// For production/use across instances, replace with Redis.
type CacheEntry = { data: any; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 1000 * 60 * 60; // 1 hour

function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr;
  // On localhost dev, Next may not provide IP - return null
  return null;
}

function makeUrlForProvider(base: string, ip: string | null) {
  // ipapi: /json/ or /<ip>/json/
  if (base.includes("ipapi.co")) {
    return ip ? `${base}/${encodeURIComponent(ip)}/json/` : `${base}/json/`;
  }
  // ipwhois.app: /json or /<ip>
  if (base.includes("ipwhois.app")) {
    return ip ? `${base}/${encodeURIComponent(ip)}` : `${base}/json`;
  }
  // default fallback to base
  return base;
}

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    clearTimeout(t);
    return res;
  } catch (err) {
    clearTimeout(t);
    throw err;
  }
}

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const cacheKey = clientIp || "server"; // cache per-client ip where possible; otherwise server-wide

  // return cached if valid
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ status: "OK", source: "cache", data: cached.data }, { status: 200, headers: { "Cache-Control": `public, max-age=${Math.floor((cached.expiresAt - Date.now())/1000)}` }});
  }

  // Try primary provider (ipapi)
  const primaryUrl = makeUrlForProvider(PRIMARY, clientIp);

  try {
    const res = await fetchWithTimeout(primaryUrl);

    // If rate-limited or other non-OK, inspect and possibly fallback
    if (!res.ok) {
      // 429: read Retry-After header and set short cache to avoid hammering upstream
      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        // If provider gave Retry-After seconds, set local cache TTL shorter of that or 5 minutes
        const retrySeconds = retryAfter ? Math.max(1, parseInt(retryAfter, 10) || 60) : 300;
        const ttl = Math.min(retrySeconds * 1000, 1000 * 60 * 5); // cap 5 minutes

        cache.set(cacheKey, { data: { error: "rate_limited" }, expiresAt: Date.now() + ttl });

        // attempt fallback provider
        const fallbackUrl = makeUrlForProvider(FALLBACK, clientIp);
        try {
          const fRes = await fetchWithTimeout(fallbackUrl);
          if (fRes.ok) {
            const fJson = await fRes.json().catch(() => null);
            const data = normalizeProviderResponse(fJson, FALLBACK);
            cache.set(cacheKey, { data, expiresAt: Date.now() + DEFAULT_TTL_MS });
            return NextResponse.json({ status: "OK", source: "fallback", data }, { status: 200 });
          } else {
            // fallback also failed — return rate-limited info
            const text = await res.text().catch(() => "");
            return NextResponse.json({ status: "ERROR", message: "Primary rate limited and fallback failed", upstreamStatus: res.status, upstreamText: text }, { status: 502 });
          }
        } catch (fallbackErr: any) {
          // fallback threw
          return NextResponse.json({ status: "ERROR", message: "Primary rate limited and fallback errored", error: String(fallbackErr?.message ?? fallbackErr) }, { status: 502 });
        }
      }

      // If other non-ok, try fallback provider
      const fallbackUrl = makeUrlForProvider(FALLBACK, clientIp);
      try {
        const fRes = await fetchWithTimeout(fallbackUrl);
        if (fRes.ok) {
          const fJson = await fRes.json().catch(() => null);
          const data = normalizeProviderResponse(fJson, FALLBACK);
          cache.set(cacheKey, { data, expiresAt: Date.now() + DEFAULT_TTL_MS });
          return NextResponse.json({ status: "OK", source: "fallback", data }, { status: 200 });
        } else {
          const text = await res.text().catch(() => "");
          return NextResponse.json({ status: "ERROR", message: "Upstream failed", upstreamStatus: res.status, upstreamText: text }, { status: 502 });
        }
      } catch (fallbackErr: any) {
        return NextResponse.json({ status: "ERROR", message: "Upstream failed and fallback errored", error: String(fallbackErr?.message ?? fallbackErr) }, { status: 502 });
      }
    }

    // Primary was OK
    const json = await res.json().catch(() => null);
    const data = normalizeProviderResponse(json, PRIMARY);

    // cache and return
    cache.set(cacheKey, { data, expiresAt: Date.now() + DEFAULT_TTL_MS });
    return NextResponse.json({ status: "OK", source: "primary", data }, { status: 200, headers: { "Cache-Control": `public, max-age=${60 * 60}` }});
  } catch (err: any) {
    // network or timeout
    console.error("[/api/ip] error fetching upstream:", err);
    // try fallback provider as last resort
    const fallbackUrl = makeUrlForProvider(FALLBACK, clientIp);
    try {
      const fRes = await fetchWithTimeout(fallbackUrl);
      if (fRes.ok) {
        const fJson = await fRes.json().catch(() => null);
        const data = normalizeProviderResponse(fJson, FALLBACK);
        cache.set(cacheKey, { data, expiresAt: Date.now() + DEFAULT_TTL_MS });
        return NextResponse.json({ status: "OK", source: "fallback", data }, { status: 200 });
      }
    } catch (fallbackErr) {
      console.error("[/api/ip] fallback also failed:", fallbackErr);
    }
    return NextResponse.json({ status: "ERROR", message: "Upstream fetch failed" }, { status: 502 });
  }
}

/**
 * Normalize different provider responses to a small canonical shape.
 * Currently we only need country_code (ISO alpha-2), but keep city, region optionally.
 */
function normalizeProviderResponse(raw: any, provider: string) {
  if (!raw || typeof raw !== "object") return null;

  // ipapi.co returns country_code, city, region, country_name, ip, etc.
  if (provider.includes("ipapi.co")) {
    return {
      ip: raw.ip ?? null,
      country_code: raw.country_code ?? raw.country ?? null,
      country_name: raw.country_name ?? null,
      region: raw.region ?? null,
      city: raw.city ?? null,
      raw,
    };
  }

  // ipwhois.app returns: ip, country_code, country, etc.
  if (provider.includes("ipwhois.app")) {
    return {
      ip: raw.ip ?? null,
      country_code: raw.country_code ?? raw.country ?? null,
      country_name: raw.country ?? null,
      region: raw.region ?? null,
      city: raw.city ?? null,
      raw,
    };
  }

  // generic fallback
  return {
    ip: raw.ip ?? null,
    country_code: raw.country_code ?? raw.country ?? null,
    country_name: raw.country_name ?? null,
    region: raw.region ?? null,
    city: raw.city ?? null,
    raw,
  };
}
