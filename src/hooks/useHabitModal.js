import { useCallback, useState } from 'react';

/**
 * Small state machine for the habit detail modal: which habit is open,
 * whether it's in edit mode, and whether a delete is pending
 * confirmation. Kept out of the main App component so that component
 * only has to ask "is a modal open, and for which habit" instead of
 * juggling three separate booleans itself.
 */
export function useHabitModal() {
  const [openHabitId, setOpenHabitId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const open = useCallback((id) => {
    setOpenHabitId(id);
    setIsEditing(false);
    setIsConfirmingDelete(false);
  }, []);

  const close = useCallback(() => {
    setOpenHabitId(null);
    setIsEditing(false);
    setIsConfirmingDelete(false);
  }, []);

  const startEditing = useCallback(() => setIsEditing(true), []);
  const cancelEditing = useCallback(() => setIsEditing(false), []);
  const askDeleteConfirmation = useCallback(() => setIsConfirmingDelete(true), []);
  const cancelDeleteConfirmation = useCallback(() => setIsConfirmingDelete(false), []);

  return {
    openHabitId,
    isEditing,
    isConfirmingDelete,
    open,
    close,
    startEditing,
    cancelEditing,
    askDeleteConfirmation,
    cancelDeleteConfirmation,
  };
}
