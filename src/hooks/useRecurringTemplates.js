import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import { createRecurringTemplate } from '../domain/recurringTemplate';
import { useAuth } from '../auth/AuthContext';
import { saveRecurringTemplate, deleteRecurringTemplateInCloud } from '../storage/supabaseRepository';

export function useRecurringTemplates() {
  const [templates, setTemplates, { loaded, saveError }] = usePersistedState('recurring-templates-v1', []);
  const { user } = useAuth();

  const addTemplate = useCallback((data) => {
    const newTemplate = createRecurringTemplate(data);
    setTemplates((prev) => [...prev, newTemplate]);
    if (user) saveRecurringTemplate(user.id, newTemplate).catch(e => alert('Error saving template: ' + e.message));
  }, [setTemplates, user]);

  const updateTemplate = useCallback((id, updates) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        if (user) saveRecurringTemplate(user.id, updated).catch(e => alert('Error updating template: ' + e.message));
        return updated;
      }
      return t;
    }));
  }, [setTemplates, user]);

  const deleteTemplate = useCallback((id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (user) deleteRecurringTemplateInCloud(user.id, id).catch(e => alert('Error deleting template: ' + e.message));
  }, [setTemplates, user]);

  return { templates, setTemplates, loaded, saveError, addTemplate, updateTemplate, deleteTemplate };
}
