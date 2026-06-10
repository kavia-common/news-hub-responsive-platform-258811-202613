import React, { useMemo, useState } from "react";
import FavoritesList from "./FavoritesList.jsx";
import SettingsForm from "./SettingsForm.jsx";

// PUBLIC_INTERFACE
export default function Drawer({
  open,
  onClose,
  favorites,
  favoritesLoading,
  favoritesError,
  settings,
  settingsLoading,
  settingsError,
  settingsSaving,
  onRefreshFavorites,
  onSaveSettings
}) {
  /** Side drawer for favorites + settings. */
  const [tab, setTab] = useState("favorites");
  const visible = !!open;

  const title = useMemo(() => (tab === "favorites" ? "Favorites" : "Settings"), [tab]);

  return (
    <>
      <div className={`backdrop ${visible ? "backdropOpen" : ""}`} onClick={onClose} aria-hidden={!visible} />
      <aside className={`drawer ${visible ? "drawerOpen" : ""}`} aria-hidden={!visible} aria-label="Favorites and settings">
        <div className="drawerHeader">
          <div className="drawerTitle">{title}</div>
          <button className="btn btnGhost" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="drawerTabs" role="tablist" aria-label="Drawer tabs">
          <button
            role="tab"
            aria-selected={tab === "favorites"}
            className={`drawerTab ${tab === "favorites" ? "drawerTabActive" : ""}`}
            type="button"
            onClick={() => setTab("favorites")}
          >
            Favorites
          </button>
          <button
            role="tab"
            aria-selected={tab === "settings"}
            className={`drawerTab ${tab === "settings" ? "drawerTabActive" : ""}`}
            type="button"
            onClick={() => setTab("settings")}
          >
            Settings
          </button>
        </div>

        <div className="drawerBody">
          {tab === "favorites" ? (
            <FavoritesList
              favorites={favorites}
              loading={favoritesLoading}
              error={favoritesError}
              onRefresh={onRefreshFavorites}
            />
          ) : (
            <SettingsForm
              settings={settings}
              loading={settingsLoading}
              error={settingsError}
              saving={settingsSaving}
              onSave={onSaveSettings}
            />
          )}
        </div>
      </aside>
    </>
  );
}
