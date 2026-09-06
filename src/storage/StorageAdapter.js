/**
 * @typedef {Object} StorageAdapter
 * @property {(key: string) => Promise<string|null>} getItem
 *   Resolves to the stored string, or null if the key doesn't exist.
 *   Must never throw for a missing key.
 * @property {(key: string, value: string) => Promise<void>} setItem
 *
 * Any object satisfying this shape can be handed to `usePersistedState`
 * and the app behaves identically (Liskov substitution).
 *
 * Implementations:
 *  - `indexedDBAdapter.js`              — primary (IndexedDB, large capacity)
 *  - `localStorageAdapter.js`           — fallback (localStorage, ~5 MB)
 *  - `claudeArtifactStorageAdapter.js`  — Claude artifact sandbox
 */
export const StorageAdapter = undefined; // type-documentation only, no runtime export
