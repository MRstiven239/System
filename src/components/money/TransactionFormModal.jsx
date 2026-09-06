import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Modal } from '../common/Modal';
import { ArrowRightLeft } from 'lucide-react';

export function TransactionFormModal({ onClose, onSubmit, accounts }) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  // Transfer-specific
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [description, setDescription] = useState('');

  const isTransfer = type === 'transfer';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isTransfer) {
      if (accounts.length < 2) {
        alert("Necesitas al menos 2 cuentas para hacer una transferencia.");
        return;
      }
      if (fromAccountId === toAccountId) {
        alert("Las cuentas de origen y destino deben ser diferentes.");
        return;
      }
      onSubmit({
        type: 'transfer',
        amount: Number(amount),
        description,
        fromAccountId,
        toAccountId,
        date: Date.now(),
      });
    } else {
      if (!accountId) {
        alert("Por favor selecciona una cuenta.");
        return;
      }
      onSubmit({
        name,
        type,
        amount: Number(amount),
        category,
        accountId,
      });
    }
  };

  const getStyle = () => ({
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    color: theme.ink,
  });

  const typeButtons = [
    { id: 'expense', label: 'Gasto' },
    { id: 'income', label: 'Ingreso' },
    { id: 'transfer', label: 'Transferencia' },
  ];

  return (
    <Modal onClose={onClose}>
      <h3 style={{ fontFamily: 'Fraunces, serif', color: theme.ink }} className="text-xl font-bold mb-6">
        Nuevo movimiento
      </h3>
      
      {accounts.length === 0 ? (
        <div>
          <p style={{ color: theme.inkMuted }} className="text-sm mb-4">
            Debes crear al menos una cuenta antes de registrar movimientos.
          </p>
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: theme.ink, color: theme.pageBg }}>
              Entendido
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type selector */}
          <div className="flex gap-1 mb-2 p-1 rounded-xl" style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}` }}>
            {typeButtons.map(btn => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setType(btn.id)}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                style={{
                  background: type === btn.id ? theme.surface : 'transparent',
                  color: type === btn.id ? theme.ink : theme.inkMuted,
                  boxShadow: type === btn.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {btn.id === 'transfer' && <ArrowRightLeft size={13} />}
                {btn.label}
              </button>
            ))}
          </div>

          {isTransfer ? (
            /* ── Transfer-specific fields ── */
            <>
              {accounts.length < 2 ? (
                <div className="p-4 rounded-xl text-center" style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}` }}>
                  <ArrowRightLeft size={24} style={{ color: theme.inkMuted, margin: '0 auto 8px' }} />
                  <p style={{ color: theme.inkMuted }} className="text-sm">
                    Necesitas al menos <strong>2 cuentas</strong> para hacer transferencias.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Valor ($)</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full p-3 rounded-xl"
                      style={getStyle()}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Cuenta origen</label>
                      <select
                        required
                        value={fromAccountId}
                        onChange={e => setFromAccountId(e.target.value)}
                        className="w-full p-3 rounded-xl"
                        style={getStyle()}
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Cuenta destino</label>
                      <select
                        required
                        value={toAccountId}
                        onChange={e => setToAccountId(e.target.value)}
                        className="w-full p-3 rounded-xl"
                        style={getStyle()}
                      >
                        {accounts.filter(a => a.id !== fromAccountId).map(a => (
                          <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Descripción (opcional)</label>
                    <input
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Ej: Pago tarjeta, ahorro..."
                      className="w-full p-3 rounded-xl"
                      style={getStyle()}
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            /* ── Expense / Income fields ── */
            <>
              <div>
                <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Concepto / Nombre</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Café, Salario..." className="w-full p-3 rounded-xl" style={getStyle()} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Valor ($)</label>
                  <input required type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full p-3 rounded-xl" style={getStyle()} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Cuenta</label>
                  <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full p-3 rounded-xl" style={getStyle()}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Categoría (opcional)</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej: Comida, Transporte" className="w-full p-3 rounded-xl" style={getStyle()} />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm" style={{ color: theme.inkMuted }}>Cancelar</button>
            <button
              type="submit"
              disabled={isTransfer && accounts.length < 2}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity"
              style={{
                background: theme.ink,
                color: theme.pageBg,
                opacity: (isTransfer && accounts.length < 2) ? 0.5 : 1,
              }}
            >
              {isTransfer ? 'Transferir' : `Registrar ${type === 'expense' ? 'gasto' : 'ingreso'}`}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
