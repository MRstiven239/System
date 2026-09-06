import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { findDuplicateInPeriod } from '../../domain/budget';

export function RegisterTemplateModal({ template, transactions, accounts, onConfirm, onCancel }) {
  const theme = useTheme();

  const [amount, setAmount] = useState(template.amount);
  const [accountId, setAccountId] = useState(template.accountId || (accounts[0]?.id || ''));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Calculate period boundaries based on selected date
  const selectedDate = new Date(date + 'T00:00:00');
  const periodStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getTime();
  const periodEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59).getTime();

  const duplicate = findDuplicateInPeriod(transactions, template, periodStart, periodEnd);
  
  const getStyle = () => ({
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    color: theme.ink,
  });

  return (
    <div>
      <h3 style={{ fontFamily: 'Fraunces, serif', color: theme.ink }} className="text-xl font-bold mb-4">
        Registrar: {template.name}
      </h3>

      {duplicate && (
        <div 
          className="mb-4 p-4 rounded-xl text-sm"
          style={{ background: 'rgba(251,191,36,0.1)', color: theme.warning, border: `1px solid rgba(251,191,36,0.2)` }}
        >
          <strong>⚠️ Advertencia:</strong> Ya registraste un movimiento similar a "{template.name}" este mes.
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Monto</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 rounded-xl" style={getStyle()} />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 rounded-xl" style={getStyle()} />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Cuenta</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full p-3 rounded-xl" style={getStyle()}>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm" style={{ color: theme.inkMuted }}>Cancelar</button>
        <button 
          onClick={() => onConfirm({ 
            amount, 
            accountId, 
            date: new Date(date + 'T00:00:00').getTime(), 
            name: template.name, 
            type: template.type,
            category: template.category 
          })} 
          className="px-4 py-2 rounded-xl text-sm font-semibold" 
          style={{ background: theme.ink, color: theme.pageBg }}
        >
          {duplicate ? 'Registrar de todos modos' : 'Registrar'}
        </button>
      </div>
    </div>
  );
}
