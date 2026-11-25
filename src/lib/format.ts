const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("en");
const dateFmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });

export function formatCount(n: number): string {
  return n < 10000 ? full.format(n) : compact.format(n);
}

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatMonth(iso: string): string {
  return monthFmt.format(new Date(iso));
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return n === 1 ? one : many;
}

/** Stable initials for the drawn avatar. */
export function initials(name: string): string {
  const parts = name.replace(/[@_.]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
