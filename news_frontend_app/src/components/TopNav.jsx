import React, { useEffect, useMemo, useState } from "react";

// PUBLIC_INTERFACE
export default function TopNav({
  brand,
  categories,
  activeCategory,
  query,
  onSearchSubmit,
  onSelectCategory,
  onOpenDrawer
}) {
  /** Top navigation with category chips and search input. */
  const [draft, setDraft] = useState(query || "");

  useEffect(() => setDraft(query || ""), [query]);

  const catItems = useMemo(() => categories || [], [categories]);

  return (
    <header className="topNav">
      <div className="topNavRow">
        <div className="brand" onClick={() => onSelectCategory?.(activeCategory)} role="button" tabIndex={0}>
          {brand}
        </div>

        <form
          className="searchForm"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit?.(draft.trim());
          }}
        >
          <label className="srOnly" htmlFor="searchInput">
            Search articles
          </label>
          <input
            id="searchInput"
            className="searchInput"
            value={draft}
            placeholder="Search headlines, topics…"
            onChange={(e) => setDraft(e.target.value)}
          />
          <button className="btn btnPrimary" type="submit">
            Search
          </button>
        </form>

        <button className="btn btnGhost" type="button" onClick={onOpenDrawer}>
          Favorites & Settings
        </button>
      </div>

      <nav className="categoryNav" aria-label="Categories">
        {catItems.map((c) => {
          const active = c.key === activeCategory;
          return (
            <button
              key={c.key}
              className={`chip ${active ? "chipActive" : ""}`}
              type="button"
              onClick={() => onSelectCategory?.(c.key)}
              aria-current={active ? "page" : undefined}
            >
              {c.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
