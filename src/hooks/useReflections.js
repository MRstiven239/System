import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import { createReflection } from '../domain/reflection';

export function useReflections() {
  const [reflections, setReflections, { loaded, saveError }] = usePersistedState('reflections-v1', []);

  const addReflection = useCallback((data) => {
    // Add to the beginning of the list
    setReflections(prev => [createReflection(data), ...prev]);
  }, [setReflections]);

  const updateReflection = useCallback((id, updates) => {
    setReflections(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [setReflections]);

  const deleteReflection = useCallback((id) => {
    setReflections(prev => prev.filter(r => r.id !== id));
  }, [setReflections]);

  return { reflections, loaded, saveError, addReflection, updateReflection, deleteReflection };
}
