/**
 * Minimal REST client for the News Hub backend.
 *
 * The backend is expected to be available via same-origin `/api/*` (dev proxy in Vite),
 * or behind an ingress that routes `/api` to the backend in production.
 */

const DEFAULT_TIMEOUT_MS = 20000;

function withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
    )
  ]);
}

async function requestJson(path, { method = "GET", body, signal } = {}) {
  const res = await withTimeout(
    fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined,
      signal
    })
  );

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof payload === "object" && payload && payload.error
        ? payload.error
        : `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

/**
 * Backend contract notes (assumed; align with backend implementation):
 * - GET /api/news?category=&q=&page=&pageSize=&country=
 *   -> { articles: Article[], page: number, pageSize: number, totalResults?: number, hasMore?: boolean }
 * - GET /api/news/:id -> { article: Article }
 * - GET /api/favorites -> { favorites: Article[] }
 * - POST /api/favorites { article: Article } -> { favorite: Article }
 * - DELETE /api/favorites/:id -> { ok: true }
 * - GET /api/settings -> { settings: { country: string, defaultCategory: string } }
 * - PUT /api/settings { country, defaultCategory } -> { settings: ... }
 */

// PUBLIC_INTERFACE
export async function fetchNews({ category, q, page, pageSize, country, signal }) {
  /** Fetch paginated news feed items. */
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (page) params.set("page", String(page));
  if (pageSize) params.set("pageSize", String(pageSize));
  if (country) params.set("country", country);

  return requestJson(`/api/news?${params.toString()}`, { signal });
}

// PUBLIC_INTERFACE
export async function fetchArticleById({ id, signal }) {
  /** Fetch a single article (detail view) by its id. */
  return requestJson(`/api/news/${encodeURIComponent(id)}`, { signal });
}

// PUBLIC_INTERFACE
export async function fetchFavorites({ signal } = {}) {
  /** Fetch user's favorite/bookmarked articles. */
  return requestJson(`/api/favorites`, { signal });
}

// PUBLIC_INTERFACE
export async function addFavorite({ article, signal } = {}) {
  /** Add a favorite article (backend persists). */
  return requestJson(`/api/favorites`, { method: "POST", body: { article }, signal });
}

// PUBLIC_INTERFACE
export async function removeFavorite({ id, signal } = {}) {
  /** Remove a favorite by id. */
  return requestJson(`/api/favorites/${encodeURIComponent(id)}`, { method: "DELETE", signal });
}

// PUBLIC_INTERFACE
export async function fetchSettings({ signal } = {}) {
  /** Fetch saved settings from backend. */
  return requestJson(`/api/settings`, { signal });
}

// PUBLIC_INTERFACE
export async function updateSettings({ settings, signal } = {}) {
  /** Update saved settings in backend. */
  return requestJson(`/api/settings`, { method: "PUT", body: settings, signal });
}
