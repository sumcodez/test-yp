// src/app/api/auth/social-login/route.ts

import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND}/api/mobile/social-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // data.access and data.refresh expected as in your example
    const accessToken: string | undefined = data?.access;
    const refreshToken: string | undefined = data?.refresh;

    const nextRes = NextResponse.json(data, { status: res.status });

    if (accessToken) {
      nextRes.cookies.set("access", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
    }

    if (refreshToken) {
      nextRes.cookies.set("refresh", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return nextRes;
    
  } catch (err: any) {
    return NextResponse.json(
      { status: "ERROR", message: err?.message || "Proxy error" },
      { status: 500 }
    );
  }
}