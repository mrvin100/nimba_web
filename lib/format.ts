/**
 * Shared formatting helpers (fr-FR). Centralised here so every module renders
 * dates and amounts identically — never re-create an `Intl` formatter in a module.
 */

const dateMedium = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
const dateLong = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });
const amount = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

/** Formats an ISO date (yyyy-MM-dd or full ISO); returns a dash when absent. */
export function formatDate(value: string | null | undefined, style: "medium" | "long" = "medium"): string {
  if (!value) return "—";
  return (style === "long" ? dateLong : dateMedium).format(new Date(value));
}

/** Formats a decimal amount with French grouping (e.g. 539 571 123). */
export function formatAmount(value: number): string {
  return amount.format(value);
}

/** Formats an amount followed by its currency code (e.g. 539 571 123 GNF). */
export function formatMoney(value: number, currency: string): string {
  return `${formatAmount(value)} ${currency}`;
}
