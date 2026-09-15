import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const headerJsxSource = await readFile(new URL('../src/components/Header.jsx', import.meta.url), 'utf8');
const appJsxSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const turnkeyJsxSource = await readFile(new URL('../src/components/TurnkeyProjectBuilder.jsx', import.meta.url), 'utf8');
const indexHtmlSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('1. Header.jsx defines and exports PRIMARY_NAV_ITEMS with EXACTLY the 5 fixed options in order: MAPA, RESULTADO, SEA CHARTER, LAND CHARTER, DATA BRIDGE', () => {
  assert.match(headerJsxSource, /export\s+const\s+PRIMARY_NAV_ITEMS\s*=/);
  const primaryMatch = headerJsxSource.match(/PRIMARY_NAV_ITEMS\s*=\s*\[([\s\S]*?)\];/);
  assert.ok(primaryMatch, 'PRIMARY_NAV_ITEMS array must be defined');

  const items = primaryMatch[1];
  const mapaIdx = items.indexOf("'MAPA'");
  const resultadoIdx = items.indexOf("'RESULTADO'");
  const seaCharterIdx = items.indexOf("'SEA CHARTER'");
  const landCharterIdx = items.indexOf("'LAND CHARTER'");
  const dataBridgeIdx = items.indexOf("'DATA BRIDGE'");

  assert.ok(mapaIdx !== -1, 'MAPA must be in PRIMARY_NAV_ITEMS');
  assert.ok(resultadoIdx !== -1, 'RESULTADO must be in PRIMARY_NAV_ITEMS');
  assert.ok(seaCharterIdx !== -1, 'SEA CHARTER must be in PRIMARY_NAV_ITEMS');
  assert.ok(landCharterIdx !== -1, 'LAND CHARTER must be in PRIMARY_NAV_ITEMS');
  assert.ok(dataBridgeIdx !== -1, 'DATA BRIDGE must be in PRIMARY_NAV_ITEMS');

  assert.ok(mapaIdx < resultadoIdx, 'MAPA must come before RESULTADO');
  assert.ok(resultadoIdx < seaCharterIdx, 'RESULTADO must come before SEA CHARTER');
  assert.ok(seaCharterIdx < landCharterIdx, 'SEA CHARTER must come before LAND CHARTER');
  assert.ok(landCharterIdx < dataBridgeIdx, 'LAND CHARTER must come before DATA BRIDGE');
});

test('2. Header.jsx does not display old buttons (DOSSIERS, DECISIONES, TRACKING) in the main navigation menu', () => {
  // Navigation menu only iterates over PRIMARY_NAV_ITEMS (the 5 fixed buttons)
  assert.match(headerJsxSource, /PRIMARY_NAV_ITEMS\.map/);
  assert.doesNotMatch(headerJsxSource, /ADVANCED_MODULE_ITEMS\.map/);
  assert.doesNotMatch(headerJsxSource, /showAdvancedModules/);
});

test('3. App.jsx configures navigation to render TurnkeyProjectBuilder when view is RESULTADO', () => {
  assert.match(appJsxSource, /import\s*\{\s*Header,\s*TurnkeyProjectBuilder\s*\}|import\s*\{\s*TurnkeyProjectBuilder\s*\}\s*from\s*['"]\.\/components\/TurnkeyProjectBuilder\.jsx['"]/);
  assert.match(appJsxSource, /currentView\s*===\s*['"]RESULTADO['"]\s*\?\s*\(\s*<TurnkeyProjectBuilder\s*\/>/);
  assert.match(appJsxSource, /hash\s*===\s*['"]RESULTADO['"]/);
});

test('4. TurnkeyProjectBuilder.jsx implements top actions bar with Guardar Oferta and Imprimir PDF buttons', () => {
  assert.match(turnkeyJsxSource, /Guardar Oferta/);
  assert.match(turnkeyJsxSource, /Imprimir PDF/);
  assert.match(turnkeyJsxSource, /window\.print\(\)/);
});

test('5. TurnkeyProjectBuilder.jsx implements Section 1: ESPECIFICACIÓN DE LA CARGA Y VALOR DEL CLIENTE with required inputs and clean styling', () => {
  assert.match(turnkeyJsxSource, /1\.\s*ESPECIFICACIÓN DE LA CARGA Y VALOR DEL CLIENTE/);
  assert.match(turnkeyJsxSource, /Tipo de Mercancía:/);
  assert.match(turnkeyJsxSource, /<select[^>]*id="tipo-mercancia"/);
  assert.match(turnkeyJsxSource, /Maquinaria Industrial \/ Piezas Sueltas/);
  assert.match(turnkeyJsxSource, /Volumen \/ Peso Total:/);
  assert.match(turnkeyJsxSource, /Volumen en CBM:/);
  assert.match(turnkeyJsxSource, /VALOR DE LA MERCANCÍA \(Aportado por el Proveedor \/ Cliente\):/);
  assert.match(turnkeyJsxSource, /USD \/ MT/);
});

test('6. TurnkeyProjectBuilder.jsx implements 2-column grid for TRAMO TERRESTRE and TRAMO MARÍTIMO with grid-cols-2', () => {
  assert.match(turnkeyJsxSource, /grid-cols-1\s+md:grid-cols-2|grid-cols-2/);
  assert.match(turnkeyJsxSource, /TRAMO TERRESTRE \(Motor Land Charter\)/);
  assert.match(turnkeyJsxSource, /Sétif \(Almacén fábrica\)/);
  assert.match(turnkeyJsxSource, /Puerto de Béjaia \(POL\)/);
  assert.match(turnkeyJsxSource, /120 km/);
  assert.match(turnkeyJsxSource, /Camiones Cama-Baja/);
  assert.match(turnkeyJsxSource, /Coste Terrestre Calculado:/);

  assert.match(turnkeyJsxSource, /TRAMO MARÍTIMO \(Motor Sea Charter\)/);
  assert.match(turnkeyJsxSource, /Béjaia \(DZ\)\s*➔\s*Praia \(CV\)/);
  assert.match(turnkeyJsxSource, /2,112 NM/);
  assert.match(turnkeyJsxSource, /Breakbulk/);
  assert.match(turnkeyJsxSource, /Ritmo Carga/);
  assert.match(turnkeyJsxSource, /1,500 MT\/d/);
  assert.match(turnkeyJsxSource, /Ritmo Desc/);
  assert.match(turnkeyJsxSource, /2,000 MT\/d/);
  assert.match(turnkeyJsxSource, /Coste Marítimo \(Flete\):/);
});

test('7. TurnkeyProjectBuilder.jsx implements GESTIÓN PORTUARIA & MANIPULACIÓN (Béjaia)', () => {
  assert.match(turnkeyJsxSource, /GESTIÓN PORTUARIA & MANIPULACIÓN \(Béjaia\)/);
  assert.match(turnkeyJsxSource, /Tasas de Muelle y Manipulación:/);
  assert.match(turnkeyJsxSource, /Trámites Aduaneros \/ SGS:/);
  assert.match(turnkeyJsxSource, /Izado Pesado \/ Trincaje \(Lashing\):/);
  assert.match(turnkeyJsxSource, /SUBTOTAL LOGÍSTICA PORTUARIA:/);
});

test('8. TurnkeyProjectBuilder.jsx implements RESUMEN FINANCIERO Y OFERTA COMERCIAL (TURNKEY / CIF) matching expected structure and calculations', () => {
  assert.match(turnkeyJsxSource, /RESUMEN FINANCIERO Y OFERTA COMERCIAL \(TURNKEY \/ CIF\)/);
  assert.match(turnkeyJsxSource, /A\.\s*Subtotal Coste Logístico \(Tierra \+ Puerto \+ Mar\):/);
  assert.match(turnkeyJsxSource, /B\.\s*Margen de Agencia \/ Beneficio Logístico Deseado/);
  assert.match(turnkeyJsxSource, /C\.\s*NUESTRO PRECIO LOGÍSTICO VENTA:/);
  assert.match(turnkeyJsxSource, /D\.\s*Valor de la Mercancía \(del Cliente\):/);
  assert.match(turnkeyJsxSource, /PRECIO FINAL CIF \/ TURNKEY PARA EL CLIENTE:/);
  assert.match(turnkeyJsxSource, /Total Dossier:/);
});

test('9. index.html defines exactly the 5 options in renderPrimaryNavigation and handles view-resultado in switchTab', () => {
  assert.match(indexHtmlSource, /tab-btn-map/);
  assert.match(indexHtmlSource, /tab-btn-resultado/);
  assert.match(indexHtmlSource, /tab-btn-sea-charter/);
  assert.match(indexHtmlSource, /tab-btn-land-charter/);
  assert.match(indexHtmlSource, /tab-btn-databridge/);
  assert.match(indexHtmlSource, /view-resultado/);
  assert.match(indexHtmlSource, /switchTab\('resultado'\)/);
});
