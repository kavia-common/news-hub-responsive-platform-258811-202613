import React, { useEffect, useMemo, useState } from "react";

const COUNTRIES = [
  { key: "us", label: "United States" },
  { key: "gb", label: "United Kingdom" },
  { key: "ca", label: "Canada" },
  { key: "au", label: "Australia" },
  { key: "in", label: "India" }
];

const DEFAULT_CATEGORIES = [
  { key: "general", label: "Top" },
  { key: "business", label: "Business" },
  { key: "technology", label: "Tech" },
  { key: "sports", label: "Sports" },
  { key: "entertainment", label: "Culture" },
  { key: "health", label: "Health" },
  { key: "science", label: "Science" }
];

// PUBLIC_INTERFACE
export default function SettingsForm({ settings, loading, error, saving, onSave }) {
  /** Editable settings persisted in backend. */
  const [country, setCountry] = useState(settings?.country || "us");
  const [defaultCategory, setDefaultCategory] = useState(settings?.defaultCategory || "general");

  useEffect(() => {
    setCountry(settings?.country || "us");
    setDefaultCategory(settings?.defaultCategory || "general");
  }, [settings?.country, settings?.defaultCategory]);

  const dirty = useMemo(
    () => country !== (settings?.country || "us") || defaultCategory !== (settings?.defaultCategory || "general"),
    [country, defaultCategory, settings?.country, settings?.defaultCategory]
  );

  return (
    <section>
      <div className="sectionTitle">Preferences</div>

      {loading ? <div className="muted">Loading settings…</div> : null}
      {error ? <div className="errorBox">{error}</div> : null}

      <div className="formField">
        <label className="label" htmlFor="country">
          Country
        </label>
        <select
          id="country"
          className="select"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          disabled={loading || saving}
        >
          {COUNTRIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <div className="help">Used for top headlines when supported by the backend provider.</div>
      </div>

      <div className="formField">
        <label className="label" htmlFor="defaultCategory">
          Default category
        </label>
        <select
          id="defaultCategory"
          className="select"
          value={defaultCategory}
          onChange={(e) => setDefaultCategory(e.target.value)}
          disabled={loading || saving}
        >
          {DEFAULT_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sectionRow">
        <button
          className="btn btnPrimary"
          type="button"
          disabled={loading || saving || !dirty}
          onClick={() => onSave?.({ country, defaultCategory })}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </section>
  );
}
