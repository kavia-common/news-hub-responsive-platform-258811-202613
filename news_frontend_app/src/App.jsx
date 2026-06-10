import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import TopNav from "./components/TopNav.jsx";
import Drawer from "./components/Drawer.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import ArticlePage from "./pages/ArticlePage.jsx";
import { fetchFavorites, fetchSettings, updateSettings } from "./api/client.js";

const DEFAULT_CATEGORIES = [
  { key: "general", label: "Top" },
  { key: "business", label: "Business" },
  { key: "technology", label: "Tech" },
  { key: "sports", label: "Sports" },
  { key: "entertainment", label: "Culture" },
  { key: "health", label: "Health" },
  { key: "science", label: "Science" }
];

export default function App() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("general");
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");

  const [settings, setSettings] = useState({ country: "us", defaultCategory: "general" });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  const abortRef = useRef({ fav: null, settings: null });

  const categories = useMemo(() => DEFAULT_CATEGORIES, []);

  const refreshFavorites = useCallback(async () => {
    setFavoritesLoading(true);
    setFavoritesError("");
    abortRef.current.fav?.abort?.();
    const ctrl = new AbortController();
    abortRef.current.fav = ctrl;
    try {
      const res = await fetchFavorites({ signal: ctrl.signal });
      setFavorites(res?.favorites || []);
    } catch (e) {
      setFavoritesError(e?.message || "Failed to load favorites");
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError("");
    abortRef.current.settings?.abort?.();
    const ctrl = new AbortController();
    abortRef.current.settings = ctrl;
    try {
      const res = await fetchSettings({ signal: ctrl.signal });
      const next = res?.settings || settings;
      setSettings(next);
      // Apply default category if no explicit selection yet.
      if (!category && next?.defaultCategory) setCategory(next.defaultCategory);
    } catch (e) {
      setSettingsError(e?.message || "Failed to load settings");
    } finally {
      setSettingsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshFavorites();
    refreshSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchSubmit = useCallback(
    (nextQuery) => {
      setQuery(nextQuery);
      navigate("/");
    },
    [navigate]
  );

  const onCategorySelect = useCallback(
    (catKey) => {
      setCategory(catKey);
      // Keep query but reset to feed page.
      navigate("/");
    },
    [navigate]
  );

  const onOpenDrawer = useCallback(() => setDrawerOpen(true), []);
  const onCloseDrawer = useCallback(() => setDrawerOpen(false), []);

  const onSaveSettings = useCallback(
    async (nextSettings) => {
      setSettingsSaving(true);
      setSettingsError("");
      try {
        const res = await updateSettings({ settings: nextSettings });
        setSettings(res?.settings || nextSettings);
        if (nextSettings?.defaultCategory && !category) {
          setCategory(nextSettings.defaultCategory);
        }
      } catch (e) {
        setSettingsError(e?.message || "Failed to save settings");
      } finally {
        setSettingsSaving(false);
      }
    },
    [category]
  );

  const appContext = useMemo(
    () => ({
      category,
      query,
      settings,
      favorites,
      refreshFavorites,
      setFavorites,
      setQuery,
      setCategory
    }),
    [category, favorites, query, refreshFavorites, settings]
  );

  return (
    <div className="appRoot">
      <TopNav
        brand="News Hub"
        categories={categories}
        activeCategory={category}
        query={query}
        onSearchSubmit={onSearchSubmit}
        onSelectCategory={onCategorySelect}
        onOpenDrawer={onOpenDrawer}
      />

      <main className="appMain">
        <Routes>
          <Route path="/" element={<FeedPage ctx={appContext} />} />
          <Route path="/article/:id" element={<ArticlePage ctx={appContext} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Drawer
        open={drawerOpen}
        onClose={onCloseDrawer}
        favorites={favorites}
        favoritesLoading={favoritesLoading}
        favoritesError={favoritesError}
        settings={settings}
        settingsLoading={settingsLoading}
        settingsError={settingsError}
        settingsSaving={settingsSaving}
        onRefreshFavorites={refreshFavorites}
        onSaveSettings={onSaveSettings}
      />
    </div>
  );
}
