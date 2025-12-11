// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = [
  "/auth",
  "/auth/login",
  "/auth/signup",
  "/auth/verify",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/me",
  "/api/auth/verify",
  "/api/auth/refresh",
  "/api/auth/logout",
]

// Allow all NextAuth endpoints under /api/auth/*
function isNextAuthPath(pathname: string) {
  return pathname.startsWith("/api/auth")
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // allow next.js assets, images, and favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // allow NextAuth endpoints (callbacks, signin, signout, error, csrf, session, providers, etc.)
  if (isNextAuthPath(pathname)) return NextResponse.next()

  // allow other public pages
  if (publicPaths.some((p) => pathname.startsWith(p))) return NextResponse.next()

  // your auth cookie check
  const hasAccessCookie = !!req.cookies.get("access")?.value

  if (!hasAccessCookie) {
    // const to = new URL("/auth/login", req.url)
    // to.searchParams.set("next", pathname)
    // return NextResponse.redirect(to)
    return NextResponse.redirect(new URL("/auth", req.url))
  }

  return NextResponse.next()
}

export const config = {
  // you can restrict matcher if you like, but keep it broad enough for client+API routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
