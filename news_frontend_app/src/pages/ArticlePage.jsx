import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addFavorite, fetchArticleById, removeFavorite } from "../api/client.js";
import { formatDate, getArticleId } from "../utils/article.js";

// PUBLIC_INTERFACE
export default function ArticlePage({ ctx }) {
  /** Article detail view. */
  const { id: routeId } = useParams();
  const { favorites, refreshFavorites } = ctx;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const abortRef = useRef(null);

  const favoriteIds = useMemo(() => new Set((favorites || []).map(getArticleId)), [favorites]);
  const isFavorite = useMemo(() => favoriteIds.has(routeId), [favoriteIds, routeId]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    setArticle(null);

    abortRef.current?.abort?.();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        const res = await fetchArticleById({ id: routeId, signal: ctrl.signal });
        if (!mounted) return;
        setArticle(res?.article || null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load article");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      ctrl.abort();
    };
  }, [routeId]);

  const toggleFavorite = useCallback(async () => {
    try {
      if (isFavorite) {
        await removeFavorite({ id: routeId });
      } else {
        // Ensure article has id for persistence.
        const stableId = getArticleId(article) || routeId;
        await addFavorite({ article: { ...article, id: stableId } });
      }
      await refreshFavorites();
    } catch (e) {
      setError(e?.message || "Failed to update favorite");
    }
  }, [article, isFavorite, refreshFavorites, routeId]);

  if (loading) {
    return (
      <div className="page">
        <div className="muted">Loading article…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="errorBox">{error}</div>
        <div style={{ marginTop: 12 }}>
          <Link className="link" to="/">
            ← Back to feed
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page">
        <div className="muted">Article not found.</div>
        <div style={{ marginTop: 12 }}>
          <Link className="link" to="/">
            ← Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const img = article?.urlToImage || article?.imageUrl;

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <Link className="link" to="/">
            ← Back
          </Link>
          <h1 className="pageTitle" style={{ marginTop: 10 }}>
            {article.title || "Untitled"}
          </h1>
          <div className="pageSubtitle">
            {article.source?.name || article.source || ""} • {formatDate(article.publishedAt)}
          </div>
        </div>

        <button className={`btn ${isFavorite ? "btnSecondary" : "btnPrimary"}`} type="button" onClick={toggleFavorite}>
          {isFavorite ? "Saved" : "Save"}
        </button>
      </div>

      {img ? (
        <div className="hero">
          <img className="heroImg" src={img} alt="" />
        </div>
      ) : null}

      {article.description ? <p className="prose lead">{article.description}</p> : null}
      {article.content ? <p className="prose">{article.content}</p> : null}

      {article.url ? (
        <a className="btn btnGhost" href={article.url} target="_blank" rel="noreferrer">
          Read original source
        </a>
      ) : null}
    </div>
  );
}
