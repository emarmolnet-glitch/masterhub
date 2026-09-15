import React from 'react';

/**
 * LandCharterModule
 *
 * Micro-frontend completo e independiente de Land Charter.
 * Renderiza el iframe a pantalla completa ocupando el 100% del alto y ancho disponible
 * dentro del layout SPA de MasterHub, pasando la referencia activa como parámetro (?ref=...).
 * Cero redirecciones o target="_blank".
 */
export default function LandCharterModule({ activeReference }) {
  const baseUrl = 'https://landchartercorepro.netlify.app/';
  const targetUrl = activeReference
    ? `${baseUrl}?ref=${encodeURIComponent(activeReference)}`
    : baseUrl;

  return (
    <div className="land-charter-wrapper w-full h-full relative bg-slate-900 flex flex-col overflow-hidden">
      <iframe
        id="land-charter-frame"
        title="Land Charter Core PRO"
        src={targetUrl}
        className="w-full h-full flex-1 border-none bg-slate-900"
      />
    </div>
  );
}

export { LandCharterModule };
