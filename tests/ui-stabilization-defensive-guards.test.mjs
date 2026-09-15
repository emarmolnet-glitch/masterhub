import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const forwarderWorkspaceSource = readFileSync(
  new URL('../src/components/ForwarderWorkspace.jsx', import.meta.url),
  'utf8'
);
const seaAssistantSource = readFileSync(
  new URL('../src/sea-assistant-entry.js', import.meta.url),
  'utf8'
);

test('1. autoScaleVesselAndCosts has strict null guard before accessing cargo-qty or vessel-name', () => {
  assert.match(indexHtml, /function autoScaleVesselAndCosts\(\)\s*\{[\s\S]*?const cargoInput = document\.getElementById\('cargo-qty'\);\s*if \(!cargoInput\) return;/);
  assert.match(indexHtml, /const vesselNameEl = document\.getElementById\('vessel-name'\);/);
});

test('2. handleDWTChange guards against null vessel-dwt, cons-sea, and vessel-badge', () => {
  assert.match(indexHtml, /function handleDWTChange\(isManual = false, triggerEngine = true\)\s*\{[\s\S]*?const vesselDwtEl = document\.getElementById\('vessel-dwt'\);\s*if \(!vesselDwtEl\) return;/);
  assert.match(indexHtml, /const consSeaEl = document\.getElementById\('cons-sea'\);\s*if \(consSeaEl\) consSeaEl\.value =/);
  assert.match(indexHtml, /const badgeEl = document\.getElementById\('vessel-badge'\);\s*if \(badgeEl\) badgeEl\.innerText =/);
});

test('3. autoAdjustSFLegacy and autoAdjustSF guard against null cargo-type', () => {
  assert.match(indexHtml, /function autoAdjustSFLegacy\(\)\s*\{[\s\S]*?const cargoTypeEl = document\.getElementById\('cargo-type'\);\s*if \(!cargoTypeEl\) return;/);
  assert.match(indexHtml, /const category = document\.getElementById\('cargo-type'\)\?\.value \|\| '';/);
});

test('4. autoClassifySpecialtyFromInputs and autoCalculateSeasonalMargin have null guards', () => {
  assert.match(indexHtml, /function autoClassifySpecialtyFromInputs\(\)\s*\{[\s\S]*?const vesselNameEl = document\.getElementById\('vessel-name'\);/);
  assert.match(indexHtml, /const vesselDwtEl = document\.getElementById\('vessel-dwt'\);/);
  assert.match(indexHtml, /const laycanEl = document\.getElementById\('gc-laycan-date'\);\s*const laycanDateStr = laycanEl \? laycanEl\.value : '';/);
  assert.match(indexHtml, /const marginOwnerEl = document\.getElementById\('margin-owner'\);\s*if \(marginOwnerEl\) marginOwnerEl\.value = margin;/);
});

test('5. updateCargoUnit and updateCargoUnitManual guard gc-add-packing, cargo-qty, and dimensions', () => {
  assert.match(indexHtml, /function updateCargoUnit\(forceDefault = false\)\s*\{[\s\S]*?const packingEl = document\.getElementById\('gc-add-packing'\);/);
  assert.match(indexHtml, /const cargoEl = document\.getElementById\('cargo-qty'\);/);
  assert.match(indexHtml, /const dimW = document\.getElementById\('dim-w'\);/);
  assert.match(indexHtml, /function updateCargoUnitManual\(\)\s*\{[\s\S]*?const packingEl = document\.getElementById\('gc-add-packing'\);/);
});

test('6. ForwarderWorkspace handleCreateProject blocks untrusted events, AI injection, and page loading', () => {
  assert.match(forwarderWorkspaceSource, /if \(e && e\.isTrusted === false\) return;/);
  assert.match(forwarderWorkspaceSource, /window\.__AI_UPDATE_FIELDS_IN_PROGRESS__ \|\| window\.__IS_PAGE_LOADING__/);
});

test('7. ForwarderWorkspace handleCreateProject wraps prompt in try-catch and aborts silently on empty/cancel without calling endpoint', () => {
  assert.match(forwarderWorkspaceSource, /try\s*\{\s*input = window\.prompt\('Introduce el nombre del cliente para el nuevo proyecto:'\);\s*\}\s*catch/);
  assert.match(forwarderWorkspaceSource, /if \(!input \|\| !String\(input\)\.trim\(\)\) return;/);
});

test('8. sea-assistant-entry tracks window.__AI_UPDATE_FIELDS_IN_PROGRESS__ during update_fields', () => {
  assert.match(seaAssistantSource, /window\.__AI_UPDATE_FIELDS_IN_PROGRESS__ = true;/);
  assert.match(seaAssistantSource, /window\.__AI_UPDATE_FIELDS_IN_PROGRESS__ = false;/);
});

test('9. index.html tracks window.__IS_PAGE_LOADING__ during page load', () => {
  assert.match(indexHtml, /global\.__IS_PAGE_LOADING__ = true;/);
  assert.match(indexHtml, /global\.__IS_PAGE_LOADING__ = false;/);
});
