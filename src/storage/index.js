import { indexedDBAdapter } from './indexedDBAdapter';
import { localStorageAdapter } from './localStorageAdapter';
import { claudeArtifactStorageAdapter, isClaudeArtifactEnvironment } from './claudeArtifactStorageAdapter';

// This is the one place in the app that knows *which* storage
// implementation is active. Priority:
//   1. Claude artifact environment → claudeArtifactStorageAdapter
//   2. IndexedDB available         → indexedDBAdapter (with auto-migration from localStorage)
//   3. Fallback                    → localStorageAdapter
function pickAdapter() {
  if (isClaudeArtifactEnvironment()) return claudeArtifactStorageAdapter;
  if (typeof indexedDB !== 'undefined') return indexedDBAdapter;
  return localStorageAdapter;
}

export const storageAdapter = pickAdapter();
