// utils/dial.ts
import metadata from "libphonenumber-js/metadata.full.json";
import { getCountryCallingCode } from "libphonenumber-js/core";

/**
 * Returns '+<code>' or null if unknown.
 * Synchronous and pure.
 */
export function getDialCode(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    const code = getCountryCallingCode(iso.toUpperCase() as any, metadata as any);
    return `+${code}`;
  } catch (err) {
    // unknown region, invalid ISO, or metadata issue
    console.warn("getDialCode failed for", iso, err);
    return null;
  }
}
