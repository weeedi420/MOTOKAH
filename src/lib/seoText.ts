const CALLOUT_PRICE_PATTERNS = [
  /\b(?:no|free)\s+(?:call[\s-]?out|callout)(?:\s+(?:fee|charge|cost|price))?\b/gi,
  /\b(?:call[\s-]?out|callout)\s+(?:fee|charge|cost|price)\s*(?:of\s*)?(?:[A-Z]{2,4}\s*)?[\d,]+(?:\.\d+)?\b/gi,
  /\b(?:call[\s-]?out|callout)\s+(?:fee|charge|cost|price)\b/gi,
  /\b(?:[A-Z]{2,4}\s*)?[\d,]+(?:\.\d+)?\s+(?:call[\s-]?out|callout)\s+(?:fee|charge|cost|price)\b/gi,
];

export function sanitizeCalloutPricingText(text: string): string {
  return CALLOUT_PRICE_PATTERNS.reduce(
    (value, pattern) => value.replace(pattern, ""),
    text,
  )
    .replace(/\s+([,.])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\|\s*\|/g, "|")
    .replace(/^\s*[,.|]\s*|\s*[,.|]\s*$/g, "")
    .trim();
}
