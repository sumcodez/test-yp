// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND}/api/mobile/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // Propagate status and body
    return new NextResponse(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "ERROR", message: err?.message || "Proxy error" },
      { status: 500 }
    );
  }
}
