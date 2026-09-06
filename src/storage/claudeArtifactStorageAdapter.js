// Adapts Claude's artifact `window.storage` API (get/set returning
// {key, value, shared} objects, and throwing on a missing key) to the
// same plain getItem/setItem contract as localStorageAdapter. Only
// usable when the app runs inside a Claude.ai artifact sandbox.

/** @implements {import('./StorageAdapter').StorageAdapter} */
export const claudeArtifactStorageAdapter = {
  async getItem(key) {
    try {
      const result = await window.storage.get(key, false);
      return result ? result.value : null;
    } catch {
      return null; // missing key throws in this API — treat as "not found"
    }
  },
  async setItem(key, value) {
    await window.storage.set(key, value, false);
  },
};

export function isClaudeArtifactEnvironment() {
  return typeof window !== 'undefined' && typeof window.storage !== 'undefined';
}
