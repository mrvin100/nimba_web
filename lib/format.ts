/**
 * Shared formatting helpers (fr-FR). Centralised here so every module renders
 * dates and amounts identically — never re-create an `Intl` formatter in a module.
 */

const dateMedium = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
const dateLong = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });
const dateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" });
const amount = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

/** Formats an ISO date (yyyy-MM-dd or full ISO); returns a dash when absent. */
export function formatDate(value: string | null | undefined, style: "medium" | "long" = "medium"): string {
  if (!value) return "—";
  return (style === "long" ? dateLong : dateMedium).format(new Date(value));
}

/** Formats an ISO instant as a date and time (e.g. 01/07/26 08:42:10). */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return dateTime.format(new Date(value));
}

/** Formats a decimal amount with French grouping (e.g. 539 571 123); returns a dash when absent. */
export function formatAmount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return amount.format(value);
}

/** Formats an amount followed by its currency code (e.g. 539 571 123 GNF). */
export function formatMoney(value: number, currency: string): string {
  return `${formatAmount(value)} ${currency}`;
}

/** Formats a byte count in the largest unit that keeps it readable (e.g. 3.2 Mo). */
export function formatBytes(bytes: number): string {
  const units = ["o", "Ko", "Mo", "Go"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${unitIndex === 0 ? value : value.toFixed(1)} ${units[unitIndex]}`;
}

/** Initials for an avatar fallback (first letters of the first two words). */
export function initials(name: string | undefined): string {
  if (!name) return "–";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
