import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import { createReflection } from '../domain/reflection';
import { useAuth } from '../auth/AuthContext';
import { saveReflection, deleteReflectionInCloud } from '../storage/supabaseRepository';

export function useReflections() {
  const [reflections, setReflections, { loaded, saveError }] = usePersistedState('reflections-v1', []);
  const { user } = useAuth();

  const addReflection = useCallback(
    (data) => {
      const newRef = createReflection(data);
      setReflections((prev) => [newRef, ...prev]);
      if (user) saveReflection(user.id, newRef).catch(e => alert('Error saving reflection: ' + e.message));
    },
    [setReflections, user]
  );

  const updateReflection = useCallback(
    (id, updates) => {
      setReflections((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            const updated = { ...r, ...updates };
            if (user) saveReflection(user.id, updated).catch(e => alert('Error updating reflection: ' + e.message));
            return updated;
          }
          return r;
        })
      );
    },
    [setReflections, user]
  );

  const deleteReflection = useCallback(
    (id) => {
      setReflections((prev) => prev.filter((r) => r.id !== id));
      if (user) deleteReflectionInCloud(user.id, id).catch(e => alert('Error deleting reflection: ' + e.message));
    },
    [setReflections, user]
  );

  return {
    reflections,
    setReflections,
    loaded,
    saveError,
    addReflection,
    updateReflection,
    deleteReflection,
  };
}
