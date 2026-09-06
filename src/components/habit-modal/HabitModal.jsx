import { useTheme } from '../../theme/ThemeContext';
import { DANGER } from '../../theme/semanticColors';
import { Modal } from '../common/Modal';
import { HabitForm } from '../habit-form/HabitForm';
import { HabitDetail } from './HabitDetail';
import { DeleteConfirmation } from './DeleteConfirmation';
import { X } from 'lucide-react';

export function HabitModal({
  habit,
  today,
  pulseKey,
  isEditing,
  isConfirmingDelete,
  onClose,
  onStartEditing,
  onCancelEditing,
  onAskDeleteConfirmation,
  onCancelDeleteConfirmation,
  onUpdate,
  onDelete,
}) {
  const theme = useTheme();

  if (isEditing) {
    return (
      <Modal onClose={onClose}>
        <h3 style={{ fontFamily: 'Fraunces, serif', color: theme.ink }} className="text-lg font-semibold mb-4">
          Editar hábito
        </h3>
        <HabitForm
          initial={habit}
          defaultColor={habit.color}
          onCancel={onCancelEditing}
          onSubmit={(data) => onUpdate(habit.id, data)}
          submitLabel="Guardar cambios"
        />
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{habit.icon}</span>
          <div>
            <h3 style={{ fontFamily: 'Fraunces, serif', color: habit.color }} className="text-xl font-semibold">
              {habit.name}
            </h3>
            {habit.identity && (
              <p className="text-sm italic mt-0.5" style={{ color: theme.inkMuted }}>"{habit.identity}"</p>
            )}
          </div>
        </div>
        <button onClick={onClose} style={{ color: theme.inkMuted }}>
          <X size={18} />
        </button>
      </div>

      <HabitDetail habit={habit} today={today} pulseKey={pulseKey} />

      <div className="mt-6 flex gap-2">
        <button
          onClick={onStartEditing}
          className="flex-1 rounded-full py-2 text-sm font-medium"
          style={{ border: `1px solid ${theme.border}`, color: theme.ink }}
        >
          Editar
        </button>
        <button onClick={onAskDeleteConfirmation} className="rounded-full px-4 py-2 text-sm" style={{ color: DANGER }}>
          Eliminar
        </button>
      </div>

      {isConfirmingDelete && (
        <DeleteConfirmation onConfirm={() => onDelete(habit.id)} onCancel={onCancelDeleteConfirmation} />
      )}
    </Modal>
  );
}
