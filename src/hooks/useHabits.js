import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import { createHabit, toggleHabitCompletion } from '../domain/habit';
import { useAuth } from '../auth/AuthContext';
import { saveHabit, deleteHabitInCloud } from '../storage/supabaseRepository';

const STORAGE_KEY = 'identity-habits-v1';

export function useHabits() {
  const [habits, setHabits, { loaded, saveError }] = usePersistedState(STORAGE_KEY, []);
  const { user } = useAuth();

  const addHabit = useCallback((formData) => {
    const newHabit = createHabit(formData);
    setHabits((prev) => [...prev, newHabit]);
    if (user) saveHabit(user.id, newHabit).catch(e => alert('Error saving habit: ' + e.message));
  }, [setHabits, user]);

  const updateHabit = useCallback((id, formData) => {
    setHabits((prev) => prev.map((h) => {
      if (h.id === id) {
        const updated = { ...h, ...formData };
        if (user) saveHabit(user.id, updated).catch(e => alert('Error updating habit: ' + e.message));
        return updated;
      }
      return h;
    }));
  }, [setHabits, user]);

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (user) deleteHabitInCloud(user.id, id).catch(e => alert('Error deleting habit: ' + e.message));
  }, [setHabits, user]);

  const toggleCompletion = useCallback((id, dateKey) => {
    setHabits((prev) => prev.map((h) => {
      if (h.id === id) {
        const updated = toggleHabitCompletion(h, dateKey);
        if (user) saveHabit(user.id, updated).catch(e => alert('Error saving completion: ' + e.message));
        return updated;
      }
      return h;
    }));
  }, [setHabits, user]);

  return { habits, setHabits, loaded, saveError, addHabit, updateHabit, deleteHabit, toggleCompletion };
}
