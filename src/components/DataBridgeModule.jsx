import React from 'react';

/**
 * DataBridgeModule
 *
 * Micro-frontend completo e independiente de Data Bridge.
 * Renderiza el iframe a pantalla completa ocupando el 100% del alto y ancho disponible
 * dentro del layout SPA de MasterHub, pasando la referencia activa como parámetro (?ref=...).
 * Cero redirecciones o target="_blank".
 */
export default function DataBridgeModule({ activeReference }) {
  const baseUrl = 'https://calm-shortbread-55bcfc.netlify.app/';
  const targetUrl = activeReference
    ? `${baseUrl}?ref=${encodeURIComponent(activeReference)}`
    : baseUrl;

  return (
    <div className="databridge-wrapper w-full h-full relative bg-slate-900 flex flex-col overflow-hidden">
      <iframe
        id="databridge-frame"
        title="SeaCharter Data Bridge"
        src={targetUrl}
        className="w-full h-full flex-1 border-none bg-slate-900"
      />
    </div>
  );
}

export { DataBridgeModule };
