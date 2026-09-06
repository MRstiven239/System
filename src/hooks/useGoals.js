import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import { createGoal, toggleChecklistItemInGoal } from '../domain/goal';

export function useGoals() {
  const [goals, setGoals, { loaded, saveError }] = usePersistedState('goals-v2', []);

  const addGoal = useCallback((data) => {
    setGoals(prev => [...prev, createGoal(data)]);
  }, [setGoals]);

  const updateGoal = useCallback((id, updates) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, [setGoals]);

  const deleteGoal = useCallback((id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, [setGoals]);

  const toggleChecklistItem = useCallback((goalId, itemId) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId ? toggleChecklistItemInGoal(g, itemId) : g
    ));
  }, [setGoals]);

  const markCompleted = useCallback((id) => {
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, completedAt: Date.now() } : g
    ));
  }, [setGoals]);

  return { goals, loaded, saveError, addGoal, updateGoal, deleteGoal, toggleChecklistItem, markCompleted };
}
