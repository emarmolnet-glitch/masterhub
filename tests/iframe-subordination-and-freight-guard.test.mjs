import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const utilitySource = await readFile(new URL('../contract-reference.js', import.meta.url), 'utf8');
const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function loadContractRefUtility({
  href = 'https://example.test/',
  sessionReference = '',
  isIframe = false,
} = {}) {
  const session = new Map(sessionReference ? [['active_contract_ref', sessionReference]] : []);
  const local = new Map();
  const broadcastMessages = [];
  const location = new URL(href);
  const listeners = new Map();
  const dispatchedEvents = [];

  class MockBroadcastChannel {
    constructor(channelName) {
      this.name = channelName;
    }
    postMessage(data) {
      broadcastMessages.push({ channel: this.name, data });
    }
    close() {}
  }

  const mockWindow = {
    BroadcastChannel: MockBroadcastChannel,
    CustomEvent: class CustomEvent {
      constructor(type, options) {
        this.type = type;
        this.detail = options?.detail;
      }
    },
    crypto: {
      getRandomValues(values) {
        values.fill(42);
        return values;
      },
    },
    addEventListener(event, handler) {
      listeners.set(event, handler);
    },
    dispatchEvent(event) {
      dispatchedEvents.push(event);
    },
    history: {
      state: null,
      replaceState(_state, _title, nextUrl) {
        const updated = new URL(nextUrl, location.href);
        location.href = updated.href;
      },
    },
    location,
    sessionStorage: {
      getItem: (key) => (session.has(key) ? session.get(key) : null),
      setItem: (key, value) => session.set(key, value),
      removeItem: (key) => session.delete(key),
    },
    localStorage: {
      getItem: (key) => (local.has(key) ? local.get(key) : null),
      setItem: (key, value) => local.set(key, value),
      removeItem: (key) => local.delete(key),
    },
  };

  if (isIframe) {
    mockWindow.parent = { postMessage() {} };
  } else {
    mockWindow.parent = mockWindow;
  }

  vm.runInNewContext(utilitySource, {
    window: mockWindow,
    globalObject: mockWindow,
    URL,
    URLSearchParams,
    Uint32Array,
    Date,
    Math,
    CustomEvent: mockWindow.CustomEvent,
  });

  return {
    api: mockWindow.ContractReference,
    window: mockWindow,
    listeners,
    dispatchedEvents,
    broadcastMessages,
  };
}

test('1. useAlgorithmicFreight in index.html is guarded against null inputs and does not throw TypeError', () => {
  assert.match(indexSource, /const rateEl = document\.getElementById\('freight-rate'\);[\s\S]*if \(!rateEl\) return;/);
  assert.match(indexSource, /const sellEl = document\.getElementById\('freight-sell'\);[\s\S]*if \(!sellEl\) return;/);

  // Extract useAlgorithmicFreight function and execute in sandbox with missing DOM
  const fnStart = indexSource.indexOf('function useAlgorithmicFreight(role, options = {})');
  assert.ok(fnStart > 0, 'useAlgorithmicFreight function must be found in index.html');
  const fnEnd = indexSource.indexOf('function buildMatchingRequest', fnStart);
  const fnSource = indexSource.slice(fnStart, fnEnd);

  const sandbox = {
    document: {
      getElementById: (_id) => null, // Simulate unmounted DOM
    },
    State: { sugOwner: 45.2, sugCharterer: 50.8 },
    runEngine: () => {},
    Math,
  };

  vm.runInNewContext(`${fnSource}\nuseAlgorithmicFreight('owner');\nuseAlgorithmicFreight('charterer');`, sandbox);
  // Reached here with no TypeError: Cannot set properties of null (setting 'value')
  assert.ok(true, 'Executed without crashing on null DOM elements');
});

test('2. Child iframes (window.parent !== window) do NOT auto-generate references and return null', () => {
  const { api, broadcastMessages } = loadContractRefUtility({ isIframe: true });

  const ref = api.getActiveContractRef();
  assert.equal(ref, null, 'getActiveContractRef in subordinated iframe without pre-existing ref must return null');

  const newRef = api.createNewReference();
  assert.equal(newRef, null, 'createNewReference in subordinated iframe without pre-existing ref must return null');

  // Verify iframe stayed passive and did not broadcast random sessions
  assert.equal(broadcastMessages.length, 0, 'Subordinated iframe must not emit broadcast messages on mount');
});

test('3. Standalone mode (window.parent === window) generates reference on demand', () => {
  const { api } = loadContractRefUtility({ isIframe: false });

  const ref = api.getActiveContractRef();
  assert.ok(ref, 'Standalone mode must generate reference');
  assert.match(ref, /^RDM\/\d{4}-\d{4}$/, 'Generated reference follows maritime business format');
});

test('4. Child iframes listen for MASTER_FORCE_REFERENCE and update their active reference passively', () => {
  const { api, listeners, dispatchedEvents } = loadContractRefUtility({ isIframe: true });

  assert.equal(api.getActiveContractRef(), null, 'Initially null before master orders');

  const messageHandler = listeners.get('message');
  assert.ok(typeof messageHandler === 'function', 'Must register window message event listener');

  // Simulate MasterHub broadcasting master reference to the iframe
  messageHandler({
    data: {
      type: 'MASTER_FORCE_REFERENCE',
      reference: 'REF: RDM/2026-7987',
    },
  });

  // Reference is now set to master reference
  assert.equal(api.getActiveContractRef(), 'REF: RDM/2026-7987');

  // Dispatched contract-reference:changed event so UI updates
  const changeEvent = dispatchedEvents.find((e) => e.type === 'contract-reference:changed');
  assert.ok(changeEvent, 'Must dispatch contract-reference:changed event');
  assert.equal(changeEvent.detail?.reference, 'REF: RDM/2026-7987');
});

test('5. Subordination condition checks window.parent !== window in contract-reference.js and index.html', () => {
  assert.match(utilitySource, /window\.parent !== window/);
  assert.match(indexSource, /window\.parent !== window/);
  assert.match(utilitySource, /MASTER_FORCE_REFERENCE/);
  assert.match(indexSource, /MASTER_FORCE_REFERENCE/);
});
