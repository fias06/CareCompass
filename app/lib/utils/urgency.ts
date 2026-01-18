/**
 * Strict urgency score validation and conversion
 * SAFEGUARD: Never defaults to 5 - always defaults to 1 (lowest)
 */
export function toUrgencyScore(input: unknown, fallback = 1): number {
  // Validate fallback is in range [1..5]
  const safeFallback = Math.min(5, Math.max(1, Math.round(fallback)));

  // Convert input to number
  let n: number;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed === "") return safeFallback;
    n = Number(trimmed);
  } else {
    n = Number(input);
  }

  // Validate: must be finite and in range [1..5]
  if (!Number.isFinite(n)) return safeFallback;
  if (n < 1 || n > 5) return safeFallback;

  // Round to nearest integer (handles floating point)
  return Math.round(n) as 1 | 2 | 3 | 4 | 5;
}
