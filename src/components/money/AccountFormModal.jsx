import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Modal } from '../common/Modal';

const EMOJIS = ['🏦', '💳', '💵', '📱', '💰', '🐷', '📈', '🏠', '🚗', '🎓'];

export function AccountFormModal({ onClose, onSubmit, initialData }) {
  const theme = useTheme();
  const [name, setName] = useState(initialData ? initialData.name : '');
  const [balance, setBalance] = useState(initialData ? initialData.initialBalance : '');
  const [emoji, setEmoji] = useState(initialData ? initialData.emoji : '🏦');

  const isEditing = !!initialData;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, emoji, balance: Number(balance) || 0 });
  };

  const getStyle = () => ({
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    color: theme.ink,
  });

  return (
    <Modal onClose={onClose}>
      <h3 style={{ fontFamily: 'Fraunces, serif', color: theme.ink }} className="text-xl font-bold mb-6">
        {isEditing ? 'Editar cuenta' : 'Nueva cuenta'}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Nombre de la cuenta</label>
          <input 
            required 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Ej: Nequi, Tarjeta de crédito"
            className="w-full p-3 rounded-xl" 
            style={getStyle()} 
          />
        </div>
        
        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Balance inicial ($)</label>
          <input 
            required 
            type="number" 
            value={balance} 
            onChange={e => setBalance(e.target.value)} 
            placeholder="0"
            className="w-full p-3 rounded-xl" 
            style={getStyle()} 
          />
        </div>

        <div>
          <label className="text-xs mb-2 block" style={{ color: theme.inkMuted }}>Icono</label>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map(em => (
              <button
                key={em}
                type="button"
                onClick={() => setEmoji(em)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-110"
                style={{
                  background: emoji === em ? theme.accent : theme.surfaceAlt,
                  border: `1px solid ${emoji === em ? theme.accent : theme.border}`,
                  color: emoji === em ? '#fff' : theme.ink
                }}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm" style={{ color: theme.inkMuted }}>Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: theme.ink, color: theme.pageBg }}>
            {isEditing ? 'Guardar cambios' : 'Crear cuenta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
