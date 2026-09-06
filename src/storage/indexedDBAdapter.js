/**
 * IndexedDB-backed StorageAdapter.
 *
 * Uses the browser's native IndexedDB API (no external dependencies).
 * Provides the same getItem/setItem contract as localStorageAdapter
 * so the rest of the app is completely unaware of the switch.
 *
 * On first use it:
 *  1. Opens (or creates) a database called "habit-garden-db".
 *  2. Migrates any existing localStorage keys into IndexedDB.
 *  3. Requests persistent storage so the browser won't evict data.
 *
 * @implements {import('./StorageAdapter').StorageAdapter}
 */

const DB_NAME = 'habit-garden-db';
const DB_VERSION = 1;
const STORE_NAME = 'kv';
const MIGRATION_FLAG = '__idb_migration_done__';

// ─── Known keys to migrate from localStorage ────────────────────────────────
const KNOWN_KEYS = [
  'identity-habits-v1',
  'budget-accounts-v1',
  'budget-transactions-v1',
  'goals-v1',
  'recurring-templates-v1',
  'reflections-v1',
  'identity-habits-theme-v1',
  'habit-garden-theme',
];

// ─── Internal helpers ────────────────────────────────────────────────────────

/** Open (or create) the database. Returns a Promise<IDBDatabase>. */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Cache the DB connection so we don't reopen it on every call. */
let _dbPromise = null;
function getDB() {
  if (!_dbPromise) {
    _dbPromise = openDB().then((db) => {
      // If the connection closes unexpectedly, reset so we reconnect.
      db.onclose = () => { _dbPromise = null; };
      return db;
    });
  }
  return _dbPromise;
}

/** Run a single read/write operation inside a transaction. */
function txOperation(mode, callback) {
  return getDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const result = callback(store);

        tx.oncomplete = () => resolve(result._value);
        tx.onerror = () => reject(tx.error);

        // For get operations we need to wait for the request.
        if (result._request) {
          result._request.onsuccess = () => {
            result._value = result._request.result;
          };
        }
      })
  );
}

// ─── Migration (localStorage → IndexedDB) ───────────────────────────────────

let _migrationPromise = null;

function migrateFromLocalStorage() {
  if (_migrationPromise) return _migrationPromise;

  _migrationPromise = (async () => {
    // Skip if already migrated.
    if (window.localStorage.getItem(MIGRATION_FLAG)) return;

    const db = await getDB();

    // Collect all values first so the transaction is fast.
    const entries = [];
    for (const key of KNOWN_KEYS) {
      const value = window.localStorage.getItem(key);
      if (value !== null) {
        entries.push([key, value]);
      }
    }

    if (entries.length === 0) {
      window.localStorage.setItem(MIGRATION_FLAG, 'true');
      return;
    }

    // Write all entries in a single transaction.
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      for (const [key, value] of entries) {
        store.put(value, key);
      }

      tx.oncomplete = () => {
        // Mark migration done so we never repeat it.
        window.localStorage.setItem(MIGRATION_FLAG, 'true');
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  })();

  return _migrationPromise;
}

// ─── Persistent storage request ──────────────────────────────────────────────

let _persistRequested = false;

async function requestPersistentStorage() {
  if (_persistRequested) return;
  _persistRequested = true;

  try {
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist();
    }
  } catch {
    // Not all browsers support this — fail silently.
  }
}

// ─── Public adapter ──────────────────────────────────────────────────────────

export const indexedDBAdapter = {
  async getItem(key) {
    await migrateFromLocalStorage();
    requestPersistentStorage(); // fire-and-forget

    const value = await txOperation('readonly', (store) => {
      const req = store.get(key);
      return { _request: req, _value: undefined };
    });

    return value !== undefined ? value : null;
  },

  async setItem(key, value) {
    await migrateFromLocalStorage();

    await txOperation('readwrite', (store) => {
      store.put(value, key);
      return { _value: undefined };
    });
  },
};

// ─── Backup & Restore utilities ──────────────────────────────────────────────

/**
 * Export every stored key-value pair as a plain JS object.
 * @returns {Promise<Object>} e.g. { "identity-habits-v1": "[…]", … }
 */
export async function exportAllData() {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.openCursor();
    const data = {};

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        data[cursor.key] = cursor.value;
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve(data);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Import a previously exported object, overwriting existing data.
 * @param {Object} data - The object from exportAllData().
 */
export async function importAllData(data) {
  const db = await getDB();

  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear existing data first.
    store.clear();

    for (const [key, value] of Object.entries(data)) {
      store.put(value, key);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
