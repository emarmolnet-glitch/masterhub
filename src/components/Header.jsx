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
          onClick={onSyncDossier}
          disabled={isSyncing}
          title="Re-leer datos actualizados de Sea Charter y Land Charter bajo esta referencia"
          className="ml-2 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white border border-blue-500/50 shadow flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          aria-label="Actualizar datos del dossier"
        >
          <span className={isSyncing ? 'animate-spin inline-block' : 'inline-block'}>🔄</span>
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
