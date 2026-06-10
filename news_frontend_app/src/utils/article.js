/**
 * Helpers to normalize and render article data.
 */

// PUBLIC_INTERFACE
export function getArticleId(article) {
  /**
   * Derive a stable-ish id. Prefer backend-provided `id`, fall back to url.
   * Backend should ideally enforce stable ids for favorites.
   */
  return article?.id || article?.url || `${article?.title || "article"}:${article?.publishedAt || ""}`;
}

// PUBLIC_INTERFACE
export function formatDate(dateLike) {
  /** Format a date string for display. */
  try {
    if (!dateLike) return "";
    const d = new Date(dateLike);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(dateLike || "");
  }
}

// PUBLIC_INTERFACE
export function truncate(text, maxLen = 160) {
  /** Truncate text for previews. */
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}…`;
}
