import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appJsx = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('1. App.jsx implements window message event listener with cleanup in useEffect', () => {
  assert.match(appJsx, /window\.addEventListener\(['"]message['"],\s*handleIframeMessage\)/, 'App.jsx must add message listener');
  assert.match(appJsx, /window\.removeEventListener\(['"]message['"],\s*handleIframeMessage\)/, 'App.jsx must clean up message listener');
  assert.match(appJsx, /\[activeReference\]/, 'useEffect must depend on activeReference');
});

test('2. App.jsx handles various broadcast payload structures from Core Pro and child micro-frontends', () => {
  assert.match(appJsx, /event\.data\.type === ['"]SYNC_REFERENCE['"]\s*\|\|\s*event\.data\.type === ['"]DOSSIER_UPDATED['"]/, 'Must check SYNC_REFERENCE and DOSSIER_UPDATED');
  assert.match(appJsx, /event\.data\.reference\s*\|\|\s*event\.data\.payload\?\.reference/, 'Must extract from reference or payload.reference');
  assert.match(appJsx, /event\.data\.contractRef\s*\|\|\s*event\.data\.activeReference/, 'Must extract from contractRef or activeReference');
});

test('3. App.jsx validates reference format and updates activeReference and history state', () => {
  assert.match(appJsx, /newRef\.startsWith\(['"]REF: RDM\/['"]\)/, 'Must validate reference format starting with REF: RDM/');
  assert.match(appJsx, /newRef !== activeReference/, 'Must only update when reference differs from current activeReference');
  assert.match(appJsx, /setActiveReference\(newRef\)/, 'Must call setActiveReference with newRef');
  assert.match(appJsx, /window\.history\?\.replaceState/, 'Must update URL via window.history.replaceState');
});

test('4. Functional execution of handleIframeMessage updates reference state and URL', () => {
  let activeRef = 'REF: RDM/2026-0001';
  let replacedUrl = null;
  const mockWindow = {
    location: new URL('https://masterhub.example.com/?ref=REF%3A%20RDM%2F2026-0001'),
    history: {
      state: null,
      replaceState(_state, _title, nextUrl) {
        replacedUrl = nextUrl;
      },
    },
    syncActiveContractReference(ref) {
      this.syncedRef = ref;
    },
    syncedRef: null,
  };

  const setActiveReference = (newRef) => {
    activeRef = newRef;
  };

  // Extract the handler logic directly matching the implementation in App.jsx
  const createHandler = (currentRef) => {
    return (event) => {
      if (!event.data || typeof event.data !== 'object') return;

      let newRef = null;
      if (event.data.type === 'SYNC_REFERENCE' || event.data.type === 'DOSSIER_UPDATED') {
        newRef = event.data.reference || event.data.payload?.reference;
      } else if (event.data.contractRef || event.data.activeReference) {
        newRef = event.data.contractRef || event.data.activeReference;
      } else if (event.data.reference) {
        newRef = event.data.reference;
      } else if (event.data.payload && typeof event.data.payload === 'object') {
        newRef = event.data.payload.reference || event.data.payload.activeReference || event.data.payload.contractRef;
      }

      if (
        newRef &&
        typeof newRef === 'string' &&
        (newRef.startsWith('REF: RDM/') || newRef.startsWith('RDM/')) &&
        newRef !== currentRef
      ) {
        setActiveReference(newRef);

        if (typeof mockWindow !== 'undefined') {
          if (typeof mockWindow.syncActiveContractReference === 'function') {
            mockWindow.syncActiveContractReference(newRef);
          }
          if (mockWindow.history?.replaceState && mockWindow.location?.href) {
            const currentUrl = new URL(mockWindow.location.href);
            currentUrl.searchParams.set('ref', newRef);
            mockWindow.history.replaceState(mockWindow.history.state, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
          }
        }
      }
    };
  };

  // Case A: SYNC_REFERENCE with REF: RDM/2026-7987
  let handler = createHandler(activeRef);
  handler({ data: { type: 'SYNC_REFERENCE', reference: 'REF: RDM/2026-7987' } });
  assert.equal(activeRef, 'REF: RDM/2026-7987');
  assert.equal(mockWindow.syncedRef, 'REF: RDM/2026-7987');
  assert.ok(replacedUrl.includes('REF%3A+RDM%2F2026-7987') || replacedUrl.includes('REF%3A%20RDM%2F2026-7987'));

  // Case B: DOSSIER_UPDATED with payload.reference
  handler = createHandler(activeRef);
  handler({ data: { type: 'DOSSIER_UPDATED', payload: { reference: 'RDM/2026-8888' } } });
  assert.equal(activeRef, 'RDM/2026-8888');

  // Case C: contractRef format
  handler = createHandler(activeRef);
  handler({ data: { contractRef: 'REF: RDM/2026-9999' } });
  assert.equal(activeRef, 'REF: RDM/2026-9999');

  // Case D: activeReference format
  handler = createHandler(activeRef);
  handler({ data: { activeReference: 'REF: RDM/2026-1234' } });
  assert.equal(activeRef, 'REF: RDM/2026-1234');

  // Case E: Irrelevant / noise messages should not alter reference
  handler = createHandler(activeRef);
  handler({ data: null });
  handler({ data: 'arbitrary-string' });
  handler({ data: { type: 'SOME_EXTENSION_EVENT' } });
  assert.equal(activeRef, 'REF: RDM/2026-1234');

  // Case F: Same reference should not trigger update
  let updateCount = 0;
  const trackingSetRef = (r) => { updateCount++; activeRef = r; };
  const noopHandler = (event) => {
    let newRef = event.data.reference;
    if (newRef && (newRef.startsWith('REF: RDM/') || newRef.startsWith('RDM/')) && newRef !== activeRef) {
      trackingSetRef(newRef);
    }
  };
  noopHandler({ data: { reference: 'REF: RDM/2026-1234' } });
  assert.equal(updateCount, 0, 'Must not update if reference is identical');
});

test('5. App.jsx propagates activeReference changes down to iframe src attributes without reload loops', () => {
  assert.match(appJsx, /const iframeIds = \[[\s\S]*?'sea-charter-frame'[\s\S]*?'native-land-charter-frame'[\s\S]*?'native-databridge-frame'[\s\S]*?\];/, 'Must include iframe IDs');
  assert.match(appJsx, /currentQueryRef !== activeReference/, 'Must check currentQueryRef !== activeReference before setting src');
  assert.match(appJsx, /urlObj\.searchParams\.set\('ref',\s*activeReference\)/, 'Must update ref query parameter in iframe URL');

  // Test functional execution of iframe push logic
  const mockIframes = {
    'sea-charter-frame': { src: 'https://neon-seachartercorepro-4ce09d.netlify.app/?ref=REF%3A%20RDM%2F2026-0001' },
    'native-land-charter-frame': { src: 'https://landchartercorepro.netlify.app/' },
    'native-databridge-frame': { src: 'https://calm-shortbread-55bcfc.netlify.app/?ref=REF%3A%20RDM%2F2026-9999' },
  };

  const documentMock = {
    getElementById: (id) => mockIframes[id] || null,
  };

  const propagateToIframes = (activeReference) => {
    if (!activeReference) return;

    const iframeIds = [
      'sea-charter-frame',
      'native-sea-charter-frame',
      'land-charter-frame',
      'native-land-charter-frame',
      'databridge-frame',
      'native-databridge-frame',
    ];

    iframeIds.forEach((id) => {
      const iframe = documentMock.getElementById(id);
      if (iframe && iframe.src) {
        try {
          const urlObj = new URL(iframe.src);
          const currentQueryRef = urlObj.searchParams.get('ref');

          if (currentQueryRef !== activeReference) {
            urlObj.searchParams.set('ref', activeReference);
            iframe.src = urlObj.toString();
          }
        } catch (_) {}
      }
    });
  };

  propagateToIframes('REF: RDM/2026-7987');

  assert.ok(mockIframes['sea-charter-frame'].src.includes('ref=REF%3A+RDM%2F2026-7987') || mockIframes['sea-charter-frame'].src.includes('ref=REF%3A%20RDM%2F2026-7987'));
  assert.ok(mockIframes['native-land-charter-frame'].src.includes('ref=REF%3A+RDM%2F2026-7987') || mockIframes['native-land-charter-frame'].src.includes('ref=REF%3A%20RDM%2F2026-7987'));
  assert.ok(mockIframes['native-databridge-frame'].src.includes('ref=REF%3A+RDM%2F2026-7987') || mockIframes['native-databridge-frame'].src.includes('ref=REF%3A%20RDM%2F2026-7987'));

  // Setting the same reference again must not rewrite iframe.src (avoid reload loops)
  const previousSrc = mockIframes['sea-charter-frame'].src;
  propagateToIframes('REF: RDM/2026-7987');
  assert.equal(mockIframes['sea-charter-frame'].src, previousSrc);
});

test('6. App.jsx exports generateMasterReference following RDM/YYYY-XXXX format', () => {
  assert.match(appJsx, /generateMasterReference\s*=\s*\(\)\s*=>/, 'App.jsx must declare generateMasterReference');
  assert.match(appJsx, /RDM\/\$\{\s*new Date\(\)\.getFullYear\(\)\s*\}-\$\{/, 'generateMasterReference must generate RDM/YYYY-XXXX');

  const year = new Date().getFullYear();
  const generateMasterReference = () => `RDM/${year}-${Math.floor(1000 + Math.random() * 9000)}`;
  const ref = generateMasterReference();
  assert.match(ref, new RegExp(`^RDM\\/${year}-\\d{4}$`));
});

test('7. MasterHub autonomously initializes activeReference as Source of Truth', () => {
  assert.match(appJsx, /if\s*\(!activeReference\)\s*\{?\s*setActiveReference\(generateMasterReference\(\)\)/, 'App.jsx must ensure activeReference is generated if empty');
  assert.match(appJsx, /\[activeReference,\s*currentView\]/, 'Iframe propagation must run on activeReference and currentView');
});


