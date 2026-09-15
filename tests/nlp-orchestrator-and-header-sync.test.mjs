import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const headerJsx = await readFile(new URL('../src/components/Header.jsx', import.meta.url), 'utf8');
const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const appJsx = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const assistantEntry = await readFile(new URL('../src/sea-assistant-entry.js', import.meta.url), 'utf8');
const assistantCss = await readFile(new URL('../assets/css/sea-assistant.css', import.meta.url), 'utf8');

test('1. Header.jsx integrates minimalist Actualizar button next to active reference with exact Tailwind classes', () => {
  const expectedClasses = 'flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-md transition-all cursor-pointer';
  assert.ok(headerJsx.includes(expectedClasses), 'Header.jsx must include exact requested Tailwind classes');
  assert.match(headerJsx, /fa-solid fa-arrows-rotate/, 'Header.jsx must include reload icon');
  assert.match(headerJsx, /Actualizar/, 'Header.jsx must include Actualizar text');
  assert.match(headerJsx, /onSyncDossier/, 'Header.jsx must call onSyncDossier');
  assert.match(headerJsx, /handleSyncDossier/, 'Header.jsx must fallback to handleSyncDossier');
});

test('2. Floating Assistant FAB is positioned on the left bottom (left-6 bottom-6) with indigo colors', () => {
  assert.match(indexHtml, /id="sea-assistant-toggle"[\s\S]*?left-6\s+bottom-6/, 'index.html FAB must use left-6 bottom-6');
  assert.match(indexHtml, /id="sea-assistant-toggle"[\s\S]*?bg-indigo-600\s+hover:bg-indigo-500/, 'index.html FAB must use bg-indigo-600 hover:bg-indigo-500');
  assert.match(assistantCss, /\.sea-assistant-fab\s*\{[\s\S]*?left:\s*max\(24px,\s*env\(safe-area-inset-left\)\);/, 'CSS FAB must be positioned on the left');
});

test('3. Floating Assistant panel expands from the left with origin-bottom-left', () => {
  assert.match(assistantEntry, /sca-panel[\s\S]*?left-6\s+bottom-24\s+origin-bottom-left/, 'sea-assistant-entry panel must use origin-bottom-left and left-6');
  assert.match(assistantCss, /\.sca-panel\s*\{[\s\S]*?left:\s*max\(24px,\s*env\(safe-area-inset-left\)\);/, 'CSS panel must align to the left');
  assert.match(assistantCss, /\.sca-panel\s*\{[\s\S]*?transform-origin:\s*bottom left;/, 'CSS panel must have transform-origin: bottom left');
});

test('4. App.jsx dispatchToSubAgents executes fetch POST to Data Bridge cerebro-ia endpoint with correct payload', () => {
  const dispatchStart = appJsx.indexOf('const dispatchToSubAgents = async');
  assert.ok(dispatchStart !== -1, 'dispatchToSubAgents must be defined');
  const dispatchEnd = appJsx.indexOf('\n  useEffect(() => {\n    if (typeof window !== \'undefined\') {\n      window.handleSyncDossier = handleSyncDossier;\n      window.dispatchToSubAgents = dispatchToSubAgents;\n    }\n  }, [activeReference]);', dispatchStart);
  const dispatchSource = dispatchEnd !== -1 ? appJsx.slice(dispatchStart, dispatchEnd) : appJsx.slice(dispatchStart);

  // Check state update to "Calculando..."
  assert.match(dispatchSource, /setOrchestratorStatus\(['"]Calculando\.\.\.['"]\)/, 'dispatchToSubAgents must set status to Calculando...');

  // Check endpoint fetch
  assert.match(dispatchSource, /https:\/\/calm-shortbread-55bcfc\.netlify\.app\/api\/cerebro-ia/, 'dispatchToSubAgents must target Data Bridge API endpoint');

  // Check JSON payload structure
  assert.match(dispatchSource, /mensaje:\s*promptPayload/, 'Payload must contain mensaje');
  assert.match(dispatchSource, /ref:/, 'Payload must contain ref');
  assert.match(dispatchSource, /modulo:\s*['"]masterhub['"]/, 'Payload must contain modulo: masterhub');

  // Check sync with server
  assert.match(dispatchSource, /window\.ContractRefManager\?\.syncWithServer/, 'dispatchToSubAgents must sync with server');

  // Check automatic switch to RESULTADO and handleSyncDossier
  assert.match(dispatchSource, /setCurrentView\(['"]RESULTADO['"]\)/, 'dispatchToSubAgents must switch view to RESULTADO');
  assert.match(dispatchSource, /handleSyncDossier\(\)/, 'dispatchToSubAgents must execute handleSyncDossier()');
});
