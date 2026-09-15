import React from 'react';

export const PRIMARY_NAV_ITEMS = [
  { id: 'map', label: 'MAPA', viewKey: 'MAPA' },
  { id: 'resultado', label: 'RESULTADO', viewKey: 'RESULTADO' },
  { id: 'sea-charter', label: 'SEA CHARTER', viewKey: 'SEA_CHARTER' },
  { id: 'land-charter', label: 'LAND CHARTER', viewKey: 'LAND_CHARTER' },
  { id: 'databridge', label: 'DATA BRIDGE', viewKey: 'DATA_BRIDGE' },
];

export function Header({
  currentView = 'MAPA',
  setCurrentView,
  onViewChange,
  activeReference,
  onSyncDossier,
  isSyncing = false,
}) {
  const handleSelectView = (viewKey) => {
    if (typeof setCurrentView === 'function') {
      setCurrentView(viewKey);
    }
    if (typeof onViewChange === 'function') {
      onViewChange(viewKey);
    }
    if (typeof window !== 'undefined') {
      if (typeof window.setAppView === 'function') {
        window.setAppView(viewKey);
      }
      if (viewKey === 'SEA_CHARTER') {
        if (typeof window.switchTab === 'function') {
          window.switchTab('sea-charter');
        }
      } else if (viewKey === 'MAPA') {
        if (typeof window.switchTab === 'function') {
          window.switchTab('map');
        }
      } else if (viewKey === 'RESULTADO') {
        if (typeof window.switchTab === 'function') {
          window.switchTab('resultado');
        }
      }
    }
  };

  const isItemActive = (item) => {
    if (item.viewKey === 'MAPA' && (currentView === 'MAPA' || currentView === 'MAP')) return true;
    if (item.viewKey === 'RESULTADO' && currentView === 'RESULTADO') return true;
    if (item.viewKey === 'SEA_CHARTER' && (currentView === 'SEA_CHARTER' || currentView === 'SEA-CHARTER')) return true;
    if (item.viewKey === 'LAND_CHARTER' && currentView === 'LAND_CHARTER') return true;
    if (item.viewKey === 'DATA_BRIDGE' && currentView === 'DATA_BRIDGE') return true;
    return false;
  };

  return (
    <header className="app-header-react w-full bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-white z-40">
      {/* Brand & Reference badge + Botón [ 🔄 Actualizar ] */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow">
          <i className="fa-solid fa-ship text-sm" aria-hidden="true"></i>
        </div>
        <div>
          <span className="font-bold text-xs md:text-sm tracking-tight text-white block">
            MasterHub Core PRO
          </span>
          {activeReference && (
            <span className="text-[10px] font-mono text-blue-300 block">
              {activeReference}
            </span>
          )}
        </div>

        {/* Botón de Sincronización Manual entre Micro-frontends */}
        <button
          type="button"
          id="btn-sync-dossier"
          onClick={() => {
            if (typeof onSyncDossier === 'function') {
              onSyncDossier();
            } else if (typeof window !== 'undefined' && typeof window.handleSyncDossier === 'function') {
              window.handleSyncDossier();
            }
          }}
          disabled={isSyncing}
          title="Re-leer datos actualizados de Sea Charter y Land Charter bajo esta referencia"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-md transition-all cursor-pointer"
          aria-label="Actualizar datos del dossier"
        >
          <i className="fa-solid fa-arrows-rotate"></i>
          <span>Actualizar</span>
        </button>
      </div>

      {/* Navegación estricta de 5 botones de MasterHub */}
      <nav
        className="main-navigation-menu flex items-center flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 max-w-full overflow-x-auto scrollbar-none"
        aria-label="Navegación principal de MasterHub Core PRO"
      >
        {PRIMARY_NAV_ITEMS.map((item) => {
          const active = isItemActive(item);
          return (
            <button
              key={item.id}
              type="button"
              id={`tab-btn-${item.id}`}
              onClick={() => handleSelectView(item.viewKey)}
              className={`tab-btn px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

export default Header;
