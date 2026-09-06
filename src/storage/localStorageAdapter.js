/** @implements {import('./StorageAdapter').StorageAdapter} */
export const localStorageAdapter = {
  async getItem(key) {
    return window.localStorage.getItem(key);
  },
  async setItem(key, value) {
    window.localStorage.setItem(key, value);
  },
};
