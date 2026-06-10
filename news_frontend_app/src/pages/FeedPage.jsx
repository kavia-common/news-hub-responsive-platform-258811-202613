import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ArticleCard from "../components/ArticleCard.jsx";
import { addFavorite, fetchNews, removeFavorite } from "../api/client.js";
import { getArticleId } from "../utils/article.js";

const PAGE_SIZE = 10;

// PUBLIC_INTERFACE
export default function FeedPage({ ctx }) {
  /** News feed with category + search + infinite scroll. */
  const { category, query, settings, favorites, refreshFavorites } = ctx;

  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef(null);
  const sentinelRef = useRef(null);

  const favoriteIds = useMemo(() => new Set((favorites || []).map(getArticleId)), [favorites]);

  const load = useCallback(
    async ({ reset }) => {
      if (reset) {
        setLoading(true);
        setError("");
        setArticles([]);
        setPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
        setError("");
      }

      abortRef.current?.abort?.();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const nextPage = reset ? 1 : page + 1;
        const res = await fetchNews({
          category,
          q: query,
          page: nextPage,
          pageSize: PAGE_SIZE,
          country: settings?.country,
          signal: ctrl.signal
        });

        const incoming = res?.articles || [];
        const nextArticles = reset ? incoming : [...articles, ...incoming];

        setArticles(nextArticles);

        const backendHasMore =
          typeof res?.hasMore === "boolean"
            ? res.hasMore
            : incoming.length === PAGE_SIZE; // heuristic

        setHasMore(backendHasMore);
        setPage(nextPage);
      } catch (e) {
        setError(e?.message || "Failed to load news");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [articles, category, page, query, settings?.country]
  );

  // Reset feed when category/query/settings country changes.
  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query, settings?.country]);

  // Infinite scroll observer.
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;

    const obs = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading && !loadingMore && !error) {
          load({ reset: false });
        }
      },
      { rootMargin: "500px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [error, hasMore, load, loading, loadingMore]);

  const toggleFavorite = useCallback(
    async (article) => {
      const id = getArticleId(article);
      try {
        if (favoriteIds.has(id)) {
          await removeFavorite({ id });
        } else {
          await addFavorite({ article: { ...article, id } });
        }
        await refreshFavorites();
      } catch (e) {
        // Keep UX minimal: show a page-level error.
        setError(e?.message || "Failed to update favorite");
      }
    },
    [favoriteIds, refreshFavorites]
  );

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">{query ? `Search: “${query}”` : "Top headlines"}</h1>
          <div className="pageSubtitle">
            {query ? "Results across sources" : `Category: ${category}`} • Country: {settings?.country || "us"}
          </div>
        </div>

        <button className="btn btnGhost" type="button" onClick={() => load({ reset: true })} disabled={loading}>
          Refresh
        </button>
      </div>

      {error ? <div className="errorBox">{error}</div> : null}

      {loading ? <div className="skeletonGrid">Loading…</div> : null}

      {!loading && !error && articles.length === 0 ? (
        <div className="muted">No articles found. Try another category or a different search.</div>
      ) : null}

      <div className="grid">
        {articles.map((a) => {
          const id = getArticleId(a);
          return (
            <ArticleCard
              key={id}
              article={a}
              isFavorite={favoriteIds.has(id)}
              onToggleFavorite={toggleFavorite}
            />
          );
        })}
      </div>

      <div className="paginationRow">
        {loadingMore ? <div className="muted">Loading more…</div> : null}
        {!hasMore && articles.length > 0 ? <div className="muted">You’re all caught up.</div> : null}
        {/* Fallback button for users where IntersectionObserver is blocked. */}
        {hasMore ? (
          <button className="btn btnPrimary" type="button" onClick={() => load({ reset: false })} disabled={loadingMore}>
            Load more
          </button>
        ) : null}
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
}
