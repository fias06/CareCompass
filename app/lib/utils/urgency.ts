/**
 * Strict urgency score validation and conversion
 * SAFEGUARD: Never defaults to 5 - always defaults to 1 (lowest)
 */
export function toUrgencyScore(input: unknown, fallback = 1): number {
  // Validate fallback is in range [1..5]
  console.log("Checking input in urgency.ts:", input);
  console.log("Validating fallback urgency:", fallback);
  const safeFallback = Math.min(5, Math.max(1, Math.round(fallback)));
  console.log("Safe fallback urgency:", safeFallback);

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

  const output = Math.round(n) as 1 | 2 | 3 | 4 | 5;
  console.log("Validated urgency score:", output);
  // Round to nearest integer (handles floating point)
  return output
}
