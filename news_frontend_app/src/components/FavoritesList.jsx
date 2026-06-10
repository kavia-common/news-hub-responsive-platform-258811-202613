import React from "react";
import { Link } from "react-router-dom";
import { formatDate, truncate, getArticleId } from "../utils/article.js";

// PUBLIC_INTERFACE
export default function FavoritesList({ favorites, loading, error, onRefresh }) {
  /** Render favorites list inside drawer. */
  return (
    <section>
      <div className="sectionRow">
        <div className="sectionTitle">Saved articles</div>
        <button className="btn btnGhost" type="button" onClick={onRefresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading ? <div className="muted">Loading favorites…</div> : null}
      {error ? <div className="errorBox">{error}</div> : null}

      {!loading && !error && (!favorites || favorites.length === 0) ? (
        <div className="muted">No favorites yet. Save articles from the feed or detail view.</div>
      ) : null}

      <ul className="list">
        {(favorites || []).map((a) => {
          const id = getArticleId(a);
          return (
            <li key={id} className="listItem">
              <Link className="listItemLink" to={`/article/${encodeURIComponent(id)}`}>
                <div className="listItemTitle">{a.title || "Untitled"}</div>
                <div className="listItemMeta">
                  <span>{a.source?.name || a.source || ""}</span>
                  <span className="dot">•</span>
                  <span>{formatDate(a.publishedAt)}</span>
                </div>
                {a.description ? <div className="listItemDesc">{truncate(a.description, 120)}</div> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
