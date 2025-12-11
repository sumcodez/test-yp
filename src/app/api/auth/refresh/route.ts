// src/app/api/auth/refresh/route.ts
import { NextResponse, NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_URL;

function cookieOpts(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
  };
}

// Use NextRequest so `req.cookies` is typed correctly
export async function POST(req: NextRequest) {
  try {
    // Read refresh token from typed NextRequest cookies
    const refresh = req.cookies.get("refresh")?.value;

    if (!refresh) {
      return NextResponse.json({ status: "ERROR", message: "No refresh token" }, { status: 401 });
    }

    // ---------- OPTION A (body) ----------
    // If your backend expects { refresh: "<token>" } in request body:
    const res = await fetch(`${BACKEND}/api/mobile/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // on refresh failure, clear cookies
      const resp = NextResponse.json(data, { status: res.status });
      resp.cookies.delete("access");
      resp.cookies.delete("refresh");
      return resp;
    }

    const newAccess = data.access;
    const newRefresh = data.refresh;

    const response = NextResponse.json({ status: "OK" });

    if (newAccess) response.cookies.set("access", newAccess, cookieOpts(30 * 60));
    if (newRefresh) response.cookies.set("refresh", newRefresh, cookieOpts(24 * 60 * 60));

    return response;
  } catch (err: any) {
    return NextResponse.json({ status: "ERROR", message: err?.message ?? "Proxy error" }, { status: 500 });
  }
}
