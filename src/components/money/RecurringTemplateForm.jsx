import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export function RecurringTemplateForm({ template, onSubmit, onCancel }) {
  const theme = useTheme();
  
  const [name, setName] = useState(template?.name || '');
  const [amount, setAmount] = useState(template?.amount || '');
  const [type, setType] = useState(template?.type || 'expense');
  const [category, setCategory] = useState(template?.category || '');
  const [icon, setIcon] = useState(template?.icon || '');
  const [dayOfMonth, setDayOfMonth] = useState(template?.dayOfMonth || '');

  const getStyle = () => ({
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    color: theme.ink,
  });

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, amount, type, category, icon, dayOfMonth });
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Nombre</label>
        <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl" style={getStyle()} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Monto</label>
          <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 rounded-xl" style={getStyle()} />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Tipo</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full p-3 rounded-xl" style={getStyle()}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Icono (Emoji)</label>
          <input value={icon} onChange={e => setIcon(e.target.value)} className="w-full p-3 rounded-xl" style={getStyle()} />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Día del mes (opcional)</label>
          <input type="number" min="1" max="31" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} className="w-full p-3 rounded-xl" style={getStyle()} />
        </div>
      </div>
      
      <div>
        <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Categoría (opcional)</label>
        <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-xl" style={getStyle()} />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm" style={{ color: theme.inkMuted }}>Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: theme.ink, color: theme.pageBg }}>
          {template ? 'Guardar' : 'Crear fijo'}
        </button>
      </div>
    </form>
  );
}
