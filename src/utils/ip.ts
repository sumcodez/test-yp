// utils/ip.ts
export async function getUserISOFromIP(signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch("https://ipwho.is/", { signal });
    if (!res.ok) return null;
    const data = await res.json();
    return data.country_code || null;
  } catch (e) {
    console.warn("getUserISOFromIP error", e);
    return null;
  }
}



// utils/ip.ts (client)
// export async function getUserISOFromIP(signal?: AbortSignal): Promise<string | null> {
//   try {
//     const res = await fetch("/api/auth/check-ip", { signal, headers: { Accept: "application/json" } });
//     if (!res.ok) return null;
//     const payload = await res.json().catch(() => null);
//     if (!payload || payload?.status !== "OK") return null;
//     return payload.data?.country_code ?? null;
//   } catch (e: any) {
//     if (e?.name === "AbortError") return null;
//     console.warn("getUserISOFromIP error", e);
//     return null;
//   }
// }
