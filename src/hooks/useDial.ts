// hooks/useAutoDial.ts
"use client";
import { useEffect, useState } from "react";
import { getUserISOFromIP } from "../utils/ip";
import { getDialCode } from "../utils/dial";

export function useAutoDialCode({ enabled = true } = {}) {
  const [dialCode, setDialCode] = useState<string>(""); // "+91" or ""
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const iso = await getUserISOFromIP(controller.signal);
        if (!mounted) return;
        const dial = getDialCode(iso);
        console.log("Dial code >>>>", dial)
        // if (dial) setDialCode(dial);
        if (dial) setDialCode(`(${dial})`);
      } catch (e) {
        if (mounted) setError("Failed to detect dial code");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [enabled]);

  return { dialCode, loading, error };
}
