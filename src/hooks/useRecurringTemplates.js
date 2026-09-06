import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import { createRecurringTemplate } from '../domain/recurringTemplate';

export function useRecurringTemplates() {
  const [templates, setTemplates, { loaded, saveError }] = usePersistedState('recurring-templates-v1', []);

  const addTemplate = useCallback((data) => {
    setTemplates(prev => [...prev, createRecurringTemplate(data)]);
  }, [setTemplates]);

  const updateTemplate = useCallback((id, updates) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [setTemplates]);

  const deleteTemplate = useCallback((id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, [setTemplates]);

  return { templates, loaded, saveError, addTemplate, updateTemplate, deleteTemplate };
}
