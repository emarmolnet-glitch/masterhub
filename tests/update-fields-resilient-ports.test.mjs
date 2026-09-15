import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const assistantSource = await readFile(new URL('../src/sea-assistant-entry.js', import.meta.url), 'utf8');

test('update_fields wraps port validation in try-catch and falls back to raw AI strings', () => {
  // Checks that port resolution is wrapped in try-catch and falls back to raw string
  assert.match(assistantSource, /try\s*\{\s*selectedRoutePorts\s*=\s*await\s*selectActionableAiWpiRoute\(polQuery,\s*podQuery\);\s*\}\s*catch/);
  assert.match(assistantSource, /source:\s*['"]RAW['"]/);
  assert.match(assistantSource, /officialLabel:\s*polQuery/);
  assert.match(assistantSource, /officialLabel:\s*podQuery/);
});

test('selectActionableAiWpiRoute supports raw fallback when port is not found in catalog', () => {
  // Checks that selectPort handles missing autocomplete matches without throwing when fallback is allowed
  assert.match(assistantSource, /if\s*\(!result\)\s*\{\s*if\s*\(allowRawFallback\)/);
  assert.match(assistantSource, /source:\s*['"]RAW['"],\s*officialLabel:\s*query/);
});

test('update_fields injects raw port strings into form inputs and state', () => {
  assert.match(assistantSource, /updateInputs\(\["port-pol",\s*"map-port-pol"\],\s*p\.pol\)/);
  assert.match(assistantSource, /updateInputs\(\["port-pod",\s*"map-port-pod"\],\s*p\.pod\)/);
  assert.match(assistantSource, /window\.syncSelectedRoutePort\('POL',\s*p\.pol\)/);
  assert.match(assistantSource, /window\.syncSelectedRoutePort\('POD',\s*p\.pod\)/);
});

test('update_fields safely handles voyage injection errors and navigates to RESULTADO view', () => {
  assert.match(assistantSource, /try\s*\{\s*const injectionResult = window\.injectVoyageScenario\(validatedScenario/);
  assert.match(assistantSource, /window\.switchTab\('resultado'\)/);
  assert.match(assistantSource, /window\.setAppView\('RESULTADO'\)/);
});

test('executeActionableAiUpdateFields runs resiliently in a simulated browser context without throwing for unvalidated ports', async () => {
  const inputs = {};
  const mockDocument = {
    getElementById: (id) => inputs[id] || null,
    querySelectorAll: (sel) => {
      const found = [];
      Object.keys(inputs).forEach((id) => {
        if (sel.includes(id)) found.push(inputs[id]);
      });
      return found;
    },
    querySelector: () => null,
  };

  const createInput = (id) => {
    const el = {
      id,
      value: '',
      dataset: {},
      click: () => {},
      textContent: '',
      dispatchEvent: () => {},
      removeAttribute: () => {},
      setAttribute: () => {},
      classList: { toggle: () => {} },
      closest: () => null,
    };
    inputs[id] = el;
    return el;
  };

  ['port-pol', 'port-pod', 'map-port-pol', 'map-port-pod', 'cargo-qty', 'rate-load', 'rate-disch'].forEach(createInput);

  let navigatedTo = null;
  const mockState = {};

  const sandbox = {
    console,
    window: {
      State: mockState,
      SeaCharterStore: { set: (data) => Object.assign(mockState, data) },
      updateGlobalVoyageParams: (data) => Object.assign(mockState, data),
      useVoyageStore: { getState: () => ({ applyNlpScenario: (data) => Object.assign(mockState, data) }) },
      VoyageDraftStore: { getState: () => ({ applyNlpScenario: (data) => Object.assign(mockState, data) }) },
      selectFirstWpiAutocompleteMatch: async (inputId, query) => {
        // Valencia is in catalog, Bejaia is not
        if (query.toLowerCase() === 'valencia') {
          return { label: 'Valencia, ES', placeName: 'Valencia', countryCode: 'ES', lat: 39.46, lon: -0.37 };
        }
        return null; // Bejaia not found!
      },
      injectVoyageScenario: (scenario) => ({ hasIncomingRoute: true, ...scenario }),
      finalizeAssistantVoyageInjection: async () => {},
      switchTab: (tab) => { navigatedTo = tab; },
      setAppView: (view) => { mockState.currentView = view; },
      dispatchEvent: () => {},
      CustomEvent: class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } },
      Event: class Event { constructor(type) { this.type = type; } },
    },
    document: mockDocument,
    Event: class Event { constructor(type) { this.type = type; } },
    CustomEvent: class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } },
    getActiveModuleDescriptor: () => ({ id: 'estimator' }),
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = mockDocument;

  // Extract selectActionableAiWpiRoute and executeActionableAiUpdateFields
  const scriptToRun = `
    ${assistantSource.slice(assistantSource.indexOf('async function selectActionableAiWpiRoute'), assistantSource.indexOf('function executeActionableAiUpdate('))}
    ${assistantSource.slice(assistantSource.indexOf('async function executeActionableAiUpdateFields'), assistantSource.indexOf('async function executeActionableAiRoute('))}
  `;

  vm.createContext(sandbox);
  vm.runInContext(scriptToRun, sandbox);

  const payload = {
    pol: 'Valencia',
    pod: 'Bejaia',
    tonnage: 12000,
    loadingRate: 2000,
    dischargeRate: 1500,
    cargo_type: 'Trigo a granel',
    view: 'RESULTADO',
  };

  // Must not throw even though 'Bejaia' is not found in autocomplete dictionary
  let result;
  let thrownError = null;
  try {
    result = await sandbox.executeActionableAiUpdateFields({ action: 'update_fields', payload });
  } catch (err) {
    thrownError = err;
  }

  assert.equal(thrownError, null, 'executeActionableAiUpdateFields must not throw when port validation fails');
  assert.equal(result, true, 'executeActionableAiUpdateFields must return true');

  // Verify raw fallback for Bejaia and validated label for Valencia
  assert.equal(mockState.pol, 'Valencia, ES');
  assert.equal(mockState.pod, 'Bejaia');
  assert.equal(mockState.tonnage, 12000);
  assert.equal(inputs['port-pod'].value, 'Bejaia');
  assert.equal(inputs['port-pol'].value, 'Valencia, ES');
  assert.equal(inputs['cargo-qty'].value, '12000');
  assert.equal(navigatedTo, 'resultado', 'Must navigate to resultado tab');
  assert.equal(mockState.currentView, 'RESULTADO', 'Must set current view to RESULTADO');
});

test('executeActionableAiUpdateFields succeeds and applies raw strings when both ports fail autocomplete validation', async () => {
  const inputs = {};
  const mockDocument = {
    getElementById: (id) => inputs[id] || null,
    querySelectorAll: (sel) => {
      const found = [];
      Object.keys(inputs).forEach((id) => {
        if (sel.includes(id)) found.push(inputs[id]);
      });
      return found;
    },
    querySelector: () => null,
  };

  const createInput = (id) => {
    const el = {
      id,
      value: '',
      dataset: {},
      click: () => {},
      textContent: '',
      dispatchEvent: () => {},
      removeAttribute: () => {},
      setAttribute: () => {},
      classList: { toggle: () => {} },
      closest: () => null,
    };
    inputs[id] = el;
    return el;
  };

  ['port-pol', 'port-pod', 'map-port-pol', 'map-port-pod', 'cargo-qty', 'rate-load', 'rate-disch'].forEach(createInput);

  let navigatedTo = null;
  const mockState = {};

  const sandbox = {
    console,
    window: {
      State: mockState,
      SeaCharterStore: { set: (data) => Object.assign(mockState, data) },
      updateGlobalVoyageParams: (data) => Object.assign(mockState, data),
      useVoyageStore: { getState: () => ({ applyNlpScenario: (data) => Object.assign(mockState, data) }) },
      VoyageDraftStore: { getState: () => ({ applyNlpScenario: (data) => Object.assign(mockState, data) }) },
      selectFirstWpiAutocompleteMatch: async () => null, // Neither port is found
      injectVoyageScenario: (scenario) => ({ hasIncomingRoute: true, ...scenario }),
      finalizeAssistantVoyageInjection: async () => {},
      switchTab: (tab) => { navigatedTo = tab; },
      setAppView: (view) => { mockState.currentView = view; },
      dispatchEvent: () => {},
      CustomEvent: class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } },
      Event: class Event { constructor(type) { this.type = type; } },
    },
    document: mockDocument,
    Event: class Event { constructor(type) { this.type = type; } },
    CustomEvent: class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } },
    getActiveModuleDescriptor: () => ({ id: 'estimator' }),
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = mockDocument;

  const scriptToRun = `
    ${assistantSource.slice(assistantSource.indexOf('async function selectActionableAiWpiRoute'), assistantSource.indexOf('function executeActionableAiUpdate('))}
    ${assistantSource.slice(assistantSource.indexOf('async function executeActionableAiUpdateFields'), assistantSource.indexOf('async function executeActionableAiRoute('))}
  `;

  vm.createContext(sandbox);
  vm.runInContext(scriptToRun, sandbox);

  const payload = {
    pol: 'Custom Origin Port',
    pod: 'Custom Destination Port',
    tonnage: 50000,
    loadingRate: 5000,
    dischargeRate: 4000,
    cargo_type: 'Carbon',
  };

  const result = await sandbox.executeActionableAiUpdateFields({ action: 'update_fields', payload });
  assert.equal(result, true);
  assert.equal(mockState.pol, 'Custom Origin Port');
  assert.equal(mockState.pod, 'Custom Destination Port');
  assert.equal(mockState.tonnage, 50000);
  assert.equal(inputs['port-pol'].value, 'Custom Origin Port');
  assert.equal(inputs['port-pod'].value, 'Custom Destination Port');
  assert.equal(inputs['cargo-qty'].value, '50000');
});
