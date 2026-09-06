import { useTheme } from '../../theme/ThemeContext';
import { DANGER } from '../../theme/semanticColors';

export function DeleteConfirmation({ onConfirm, onCancel }) {
  const theme = useTheme();

  return (
    <div className="mt-3 p-3 rounded-xl text-sm" style={{ background: theme.surfaceAlt }}>
      <p style={{ color: theme.ink }} className="mb-2">¿Eliminar este hábito? No podrás deshacerlo.</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="rounded-full px-3 py-1.5 text-xs font-medium"
          style={{ background: DANGER, color: '#fff' }}
        >
          Sí, eliminar
        </button>
        <button
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-xs"
          style={{ border: `1px solid ${theme.border}`, color: theme.ink }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
