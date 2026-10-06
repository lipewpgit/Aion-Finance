/**
 * Converts a BRL value to integer cents.
 *
 * Accepts numbers as well as common Brazilian and international strings:
 * `10,50`, `1.234,56`, `10.50` and `1,234.56`.
 */
export function parseMoneyToCents(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;
    return Math.round(value * 100);
  }

  const raw = String(value ?? "").trim();
  if (!raw || raw.includes("-")) return null;

  const cleaned = raw.replace(/\s/g, "").replace(/[^0-9,.]/g, "");
  if (!cleaned || !/\d/.test(cleaned)) return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let decimalIndex = Math.max(lastComma, lastDot);

  // In pt-BR a lone dot followed by three digits is a thousands separator.
  if (lastComma === -1 && lastDot !== -1 && cleaned.length - lastDot - 1 === 3) {
    decimalIndex = -1;
  }

  const integerDigits = (decimalIndex === -1 ? cleaned : cleaned.slice(0, decimalIndex)).replace(/\D/g, "") || "0";
  const decimalDigits = decimalIndex === -1 ? "" : cleaned.slice(decimalIndex + 1).replace(/\D/g, "");
  const normalized = decimalDigits ? `${integerDigits}.${decimalDigits}` : integerDigits;
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) return null;
  const cents = Math.round(amount * 100);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}
