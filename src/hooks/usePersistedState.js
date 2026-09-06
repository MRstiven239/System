import { useEffect, useRef, useState } from 'react';
import { storageAdapter } from '../storage';

/**
 * A useState that loads its initial value from a StorageAdapter and
 * writes every subsequent change back to it. Serialization is pluggable
 * (defaults to JSON) so callers can store plain strings (like a theme
 * key) without double-encoding them.
 *
 * This is the single seam between "React state" and "persistence" —
 * useHabits and useThemeChoice both build on this instead of each
 * talking to storageAdapter directly.
 */
export function usePersistedState(key, initialValue, { serialize = JSON.stringify, deserialize = JSON.parse } = {}) {
  const [value, setValue] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await storageAdapter.getItem(key);
      if (cancelled) return;
      if (raw !== null) {
        try {
          setValue(deserialize(raw));
        } catch {
          // corrupted or unexpected stored value — keep the initial value
        }
      }
      hasLoadedRef.current = true;
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // key/serialize/deserialize are expected to be stable for a given hook usage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hasLoadedRef.current) return; // don't overwrite storage before the initial load resolves
    (async () => {
      try {
        await storageAdapter.setItem(key, serialize(value));
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  return [value, setValue, { loaded, saveError }];
}
