// src/app/providers/Providers.tsx
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/src/context/AuthContext";
import type { Session } from "next-auth";

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  // session prop is optional — App Router layout can pass this in (see option 2)
  return (
    <SessionProvider session={session}>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
