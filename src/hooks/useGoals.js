import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import { createGoal, toggleChecklistItemInGoal } from '../domain/goal';
import { useAuth } from '../auth/AuthContext';
import { saveGoal, deleteGoalInCloud } from '../storage/supabaseRepository';

export function useGoals() {
  const [goals, setGoals, { loaded, saveError }] = usePersistedState('goals-v2', []);
  const { user } = useAuth();

  const addGoal = useCallback(
    (data) => {
      const newGoal = createGoal(data);
      setGoals((prev) => [...prev, newGoal]);
      if (user) saveGoal(user.id, newGoal).catch(console.error);
    },
    [setGoals, user]
  );

  const updateGoal = useCallback(
    (id, updates) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            const updated = { ...g, ...updates };
            if (user) saveGoal(user.id, updated).catch(console.error);
            return updated;
          }
          return g;
        })
      );
    },
    [setGoals, user]
  );

  const deleteGoal = useCallback(
    (id) => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      if (user) deleteGoalInCloud(user.id, id).catch(console.error);
    },
    [setGoals, user]
  );

  const toggleChecklistItem = useCallback(
    (goalId, itemId) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === goalId) {
            const updated = toggleChecklistItemInGoal(g, itemId);
            if (user) saveGoal(user.id, updated).catch(console.error);
            return updated;
          }
          return g;
        })
      );
    },
    [setGoals, user]
  );

  const markCompleted = useCallback(
    (id) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            const updated = { ...g, completedAt: Date.now() };
            if (user) saveGoal(user.id, updated).catch(console.error);
            return updated;
          }
          return g;
        })
      );
    },
    [setGoals, user]
  );

  return {
    goals,
    setGoals,
    loaded,
    saveError,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleChecklistItem,
    markCompleted,
  };
}
