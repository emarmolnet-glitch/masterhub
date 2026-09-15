import React from 'react';

export default function SeaCharterModule({ activeReference }) {
  // URL base de la aplicación Sea Charter original
  const baseUrl = 'https://neon-seachartercorepro-4ce09d.netlify.app/';
  const targetUrl = activeReference
    ? `${baseUrl}?ref=${encodeURIComponent(activeReference)}`
    : baseUrl;

  return (
    <div className="sea-charter-wrapper w-full h-full relative bg-slate-900 flex flex-col">
      <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white uppercase tracking-wider">⚓ Sea Charter Core PRO</span>
          <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700 font-mono">
            {activeReference || 'REF: PENDIENTE'}
          </span>
        </div>
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px]"
        >
          <span>Abrir en ventana independiente</span>
          <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" aria-hidden="true"></i>
        </a>
      </div>
      <iframe
        id="sea-charter-frame"
        title="Sea Charter Core PRO"
        src={targetUrl}
        className="w-full flex-1 border-none bg-slate-900"
      />
    </div>
  );
}

export { SeaCharterModule };
