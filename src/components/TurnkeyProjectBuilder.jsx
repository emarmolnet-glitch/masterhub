import React, { useState, useMemo } from 'react';

/**
 * TurnkeyProjectBuilder component
 * Renders the turnkey project commercial offer and financial summary
 * for multimodal Land + Port + Sea logistics.
 */
export function TurnkeyProjectBuilder() {
  // 1. Especificación de la carga y valor del cliente
  const [tipoMercancia, setTipoMercancia] = useState('Maquinaria Industrial / Piezas Sueltas');
  const [pesoTotal, setPesoTotal] = useState(5000);
  const [volumenCbm, setVolumenCbm] = useState(1250);
  const [valorMercancia, setValorMercancia] = useState(450.0);

  // Tramo Terrestre
  const [origenTerrestre] = useState('Sétif (Almacén fábrica)');
  const [destinoTerrestre] = useState('Puerto de Béjaia (POL)');
  const [distanciaTerrestre] = useState('120 km');
  const [vehiculosTerrestres] = useState('Camiones Cama-Baja');
  const [costeTerrestre] = useState(12.5);

  // Tramo Marítimo
  const [rutaMaritima] = useState('Béjaia (DZ) ➔ Praia (CV)');
  const [distanciaNautica] = useState('2,112 NM');
  const [tipoBuque] = useState('Breakbulk');
  const [ritmoCarga] = useState('1,500 MT/d');
  const [ritmoDescarga] = useState('2,000 MT/d');
  const [costeMaritimo] = useState(42.0);

  // Gestión Portuaria & Manipulación (Béjaia)
  const [tasasMuelle] = useState(3.5);
  const [tramitesAduaneros] = useState(0.25);
  const [izadoTrincaje] = useState(4.0);

  // Margen de Agencia / Beneficio
  const [porcentajeMargen] = useState(0.10); // 10%

  // Cálculos reactivos
  const subtotalPortuario = useMemo(() => {
    return Number((tasasMuelle + tramitesAduaneros + izadoTrincaje).toFixed(2));
  }, [tasasMuelle, tramitesAduaneros, izadoTrincaje]);

  const subtotalLogistico = useMemo(() => {
    return Number((costeTerrestre + subtotalPortuario + costeMaritimo).toFixed(2));
  }, [costeTerrestre, subtotalPortuario, costeMaritimo]);

  const margenAgencia = useMemo(() => {
    return Number((subtotalLogistico * porcentajeMargen).toFixed(2));
  }, [subtotalLogistico, porcentajeMargen]);

  const precioLogisticoVenta = useMemo(() => {
    return Number((subtotalLogistico + margenAgencia).toFixed(2));
  }, [subtotalLogistico, margenAgencia]);

  const precioFinalCif = useMemo(() => {
    return Number((precioLogisticoVenta + Number(valorMercancia || 0)).toFixed(2));
  }, [precioLogisticoVenta, valorMercancia]);

  const totalDossier = useMemo(() => {
    return Number((precioFinalCif * Number(pesoTotal || 0)).toFixed(2));
  }, [precioFinalCif, pesoTotal]);

  const [savedNotification, setSavedNotification] = useState(false);

  const handleGuardarOferta = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleImprimirPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat('en-US').format(val || 0);
  };

  return (
    <div className="turnkey-project-builder w-full max-w-5xl mx-auto p-4 md:p-6 space-y-5 text-slate-800">
      {/* Botones de acción superiores */}
      <div className="flex items-center justify-end gap-3 pb-1">
        {savedNotification && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-fade-in">
            ✓ Oferta guardada correctamente
          </span>
        )}
        <button
          type="button"
          onClick={handleGuardarOferta}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          title="Guardar Oferta"
        >
          <span>💾</span> Guardar Oferta
        </button>
        <button
          type="button"
          onClick={handleImprimirPdf}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs md:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          title="Imprimir PDF"
        >
          <span>🖨️</span> Imprimir PDF
        </button>
      </div>

      {/* 📦 1. ESPECIFICACIÓN DE LA CARGA Y VALOR DEL CLIENTE */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-3">
        <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
          <span>📦</span> 1. ESPECIFICACIÓN DE LA CARGA Y VALOR DEL CLIENTE
        </h2>

        <div className="space-y-3 text-xs md:text-sm">
          {/* Tipo de Mercancía */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="tipo-mercancia" className="font-medium text-slate-600 shrink-0">
              Tipo de Mercancía:
            </label>
            <div className="relative inline-block flex-1 max-w-md">
              <select
                id="tipo-mercancia"
                value={tipoMercancia}
                onChange={(e) => setTipoMercancia(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none pr-8 cursor-pointer"
              >
                <option value="Maquinaria Industrial / Piezas Sueltas">
                  Maquinaria Industrial / Piezas Sueltas
                </option>
                <option value="Carga Proyecto / Sobredimensionada">
                  Carga Proyecto / Sobredimensionada
                </option>
                <option value="Granel Sólido / Minerales">Granel Sólido / Minerales</option>
                <option value="Carga General / Big Bags">Carga General / Big Bags</option>
                <option value="Acero / Bobinas y Perfiles">Acero / Bobinas y Perfiles</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Volumen / Peso Total y Volumen en CBM */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-600">Volumen / Peso Total:</span>
              <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pesoTotal}
                  onChange={(e) => setPesoTotal(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-transparent text-right font-mono font-bold text-slate-800 focus:outline-none text-xs md:text-sm"
                />
                <span className="font-bold text-slate-500 text-xs">MT</span>
              </div>
            </div>

            <div className="hidden sm:block text-slate-300">|</div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-600">Volumen en CBM:</span>
              <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={volumenCbm}
                  onChange={(e) => setVolumenCbm(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-transparent text-right font-mono font-bold text-slate-800 focus:outline-none text-xs md:text-sm"
                />
                <span className="font-bold text-slate-500 text-xs">m³</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-2 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>💰</span> VALOR DE LA MERCANCÍA (Aportado por el Proveedor / Cliente):
              </span>
              <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorMercancia}
                  onChange={(e) => setValorMercancia(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-transparent text-right font-mono font-bold text-blue-600 focus:outline-none text-xs md:text-sm"
                />
                <span className="font-bold text-slate-600 text-xs">USD / MT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 🚛 TRAMO TERRESTRE y 🚢 TRAMO MARÍTIMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 🚛 TRAMO TERRESTRE (Motor Land Charter) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-3">
          <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span>🚛</span> TRAMO TERRESTRE (Motor Land Charter)
          </h2>
          <div className="space-y-2 text-xs md:text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-700">Origen:</span> {origenTerrestre}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Destino:</span> {destinoTerrestre}
            </div>
            <div className="border-t border-slate-100 pt-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-700">Distancia:</span> {distanciaTerrestre}
              </div>
              <div className="text-slate-300">|</div>
              <div>
                <span className="font-semibold text-slate-700">Vehículos:</span> {vehiculosTerrestres}
              </div>
            </div>
            <div className="pt-1 flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2.5">
              <span className="font-bold text-slate-800">Coste Terrestre Calculado:</span>
              <span className="font-mono font-bold text-blue-600">
                ${formatCurrency(costeTerrestre)} / MT
              </span>
            </div>
          </div>
        </div>

        {/* 🚢 TRAMO MARÍTIMO (Motor Sea Charter) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-3">
          <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span>🚢</span> TRAMO MARÍTIMO (Motor Sea Charter)
          </h2>
          <div className="space-y-2 text-xs md:text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-700">Ruta:</span> {rutaMaritima}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-700">Distancia Náutica:</span> {distanciaNautica}
              </div>
              <div className="text-slate-300">|</div>
              <div>
                <span className="font-semibold text-slate-700">Buque:</span> {tipoBuque}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-700">Ritmo Carga:</span> {ritmoCarga}
              </div>
              <div className="text-slate-300">|</div>
              <div>
                <span className="font-semibold text-slate-700">Ritmo Desc.:</span> {ritmoDescarga}
              </div>
            </div>
            <div className="pt-1 flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2.5">
              <span className="font-bold text-slate-800">Coste Marítimo (Flete):</span>
              <span className="font-mono font-bold text-blue-600">
                ${formatCurrency(costeMaritimo)} / MT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ⚓ GESTIÓN PORTUARIA & MANIPULACIÓN (Béjaia) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-3">
        <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
          <span>⚓</span> GESTIÓN PORTUARIA & MANIPULACIÓN (Béjaia)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
          <div className="space-y-2 text-slate-600">
            <div className="flex items-center justify-between">
              <span>• Tasas de Muelle y Manipulación:</span>
              <span className="font-mono font-bold text-slate-800">${formatCurrency(tasasMuelle)} / MT</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• Izado Pesado / Trincaje (Lashing):</span>
              <span className="font-mono font-bold text-slate-800">${formatCurrency(izadoTrincaje)} / MT</span>
            </div>
          </div>
          <div className="space-y-2 text-slate-600">
            <div className="flex items-center justify-between">
              <span>• Trámites Aduaneros / SGS:</span>
              <span className="font-mono font-bold text-slate-800">${formatCurrency(tramitesAduaneros)} / MT</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2">
              <span className="font-bold text-slate-700 uppercase text-[11px]">SUBTOTAL LOGÍSTICA PORTUARIA:</span>
              <span className="font-mono font-bold text-blue-600">${formatCurrency(subtotalPortuario)} / MT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 RESUMEN FINANCIERO Y OFERTA COMERCIAL (TURNKEY / CIF) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm space-y-3">
        <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
          <span>📊</span> RESUMEN FINANCIERO Y OFERTA COMERCIAL (TURNKEY / CIF)
        </h2>
        <div className="space-y-2.5 text-xs md:text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">A. Subtotal Coste Logístico (Tierra + Puerto + Mar):</span>
            <span className="font-mono font-bold text-slate-800">${formatCurrency(subtotalLogistico)} USD / MT</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">B. Margen de Agencia / Beneficio Logístico Deseado (ej. 10%):</span>
            <span className="font-mono font-bold text-slate-800">${formatCurrency(margenAgencia)} USD / MT</span>
          </div>

          <div className="border-t border-slate-100 my-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">C. NUESTRO PRECIO LOGÍSTICO VENTA:</span>
              <span className="font-mono font-bold text-slate-900">${formatCurrency(precioLogisticoVenta)} USD / MT</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">D. Valor de la Mercancía (del Cliente):</span>
            <span className="font-mono font-bold text-slate-800">${formatCurrency(valorMercancia)} USD / MT</span>
          </div>

          <div className="border-t-2 border-slate-200 my-2 pt-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 -mx-4 md:-mx-6 px-4 md:px-6 py-3 rounded-b-xl border-b border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-bold text-sm md:text-base text-slate-900 flex items-center gap-1.5">
                <span>🌟</span> PRECIO FINAL CIF / TURNKEY PARA EL CLIENTE:
              </span>
              <span className="font-mono font-extrabold text-base md:text-lg text-blue-700 flex items-center gap-1">
                <span>✨</span> {formatCurrency(precioFinalCif)} USD / MT
              </span>
            </div>
            <div className="text-right text-xs md:text-sm font-semibold text-slate-500 pt-1 font-mono">
              (Total Dossier: ${formatCurrency(totalDossier)} USD)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TurnkeyProjectBuilder;
