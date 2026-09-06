import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import { createHabit, toggleHabitCompletion } from '../domain/habit';

const STORAGE_KEY = 'identity-habits-v1';

/**
 * Owns the list of habits and every mutation on it (create, update,
 * delete, toggle a day). Components never mutate the habits array
 * themselves — they call these functions, keeping "how a habit
 * changes" in one place.
 */
export function useHabits() {
  const [habits, setHabits, { loaded, saveError }] = usePersistedState(STORAGE_KEY, []);

  const addHabit = useCallback((formData) => {
    setHabits((prev) => [...prev, createHabit(formData)]);
  }, [setHabits]);

  const updateHabit = useCallback((id, formData) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...formData } : h)));
  }, [setHabits]);

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, [setHabits]);

  const toggleCompletion = useCallback((id, dateKey) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? toggleHabitCompletion(h, dateKey) : h)));
  }, [setHabits]);

  return { habits, loaded, saveError, addHabit, updateHabit, deleteHabit, toggleCompletion };
}
