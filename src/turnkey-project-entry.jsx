import React from 'react';
import { createRoot } from 'react-dom/client';
import TurnkeyProjectBuilder from './components/TurnkeyProjectBuilder.jsx';

let turnkeyRoot = null;

export function mountTurnkeyProjectBuilder(container) {
  const mountPoint = container?.querySelector?.('#turnkey-project-builder-root')
    || document.getElementById('turnkey-project-builder-root')
    || container;

  if (!mountPoint) return null;

  if (!turnkeyRoot) {
    turnkeyRoot = createRoot(mountPoint);
  }
  turnkeyRoot.render(<TurnkeyProjectBuilder />);
  return turnkeyRoot;
}

if (typeof window !== 'undefined') {
  window.mountTurnkeyProjectBuilder = mountTurnkeyProjectBuilder;
}

const initialContainer = document.getElementById('turnkey-project-builder-root');
if (initialContainer) {
  mountTurnkeyProjectBuilder(initialContainer);
}
