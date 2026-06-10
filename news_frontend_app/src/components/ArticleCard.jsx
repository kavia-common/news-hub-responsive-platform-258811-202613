import React from "react";
import { Link } from "react-router-dom";
import { formatDate, truncate, getArticleId } from "../utils/article.js";

// PUBLIC_INTERFACE
export default function ArticleCard({ article, isFavorite, onToggleFavorite }) {
  /** Card for an article in the feed. */
  const id = getArticleId(article);
  const img = article?.urlToImage || article?.imageUrl;

  return (
    <article className="card">
      <Link className="cardLink" to={`/article/${encodeURIComponent(id)}`}>
        <div className="cardMedia">
          {img ? <img className="cardImg" src={img} alt="" loading="lazy" /> : <div className="cardImgFallback" />}
        </div>
        <div className="cardBody">
          <h2 className="cardTitle">{article?.title || "Untitled"}</h2>
          <div className="cardMeta">
            <span>{article?.source?.name || article?.source || ""}</span>
            <span className="dot">•</span>
            <span>{formatDate(article?.publishedAt)}</span>
          </div>
          {article?.description ? <p className="cardDesc">{truncate(article.description, 180)}</p> : null}
        </div>
      </Link>

      <div className="cardActions">
        <button
          className={`btn ${isFavorite ? "btnSecondary" : "btnGhost"}`}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite?.(article);
          }}
          aria-pressed={isFavorite}
        >
          {isFavorite ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}
