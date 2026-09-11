import { useTheme } from '../../theme/ThemeContext';
import { formatCOP, computeBalances } from '../../domain/budget';
import { Trash2, Edit2 } from 'lucide-react';

export function AccountCards({ accounts, transactions, onAddAccount, onDeleteAccount, onEditAccount }) {
  const theme = useTheme();
  const balances = computeBalances(accounts, transactions || []);

  return (
    <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ color: theme.ink }} className="text-lg font-semibold">Cuentas</h3>
        <button 
          onClick={onAddAccount}
          style={{ background: theme.surfaceAlt, color: theme.ink }}
          className="text-xs px-3 py-1.5 rounded-full hover:bg-opacity-80 transition-colors"
        >
          + Agregar
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {accounts.map(acc => {
          const effectiveBalance = balances.get(acc.id) ?? acc.initialBalance;
          return (
            <div
              key={acc.id}
              className="relative p-4 rounded-2xl group transition-transform hover:-translate-y-1 snap-start flex-none w-[160px] sm:w-[200px]"
              style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
            >
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEditAccount(acc); }}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  title="Editar"
                >
                  <Edit2 size={14} style={{ color: theme.inkMuted }} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (confirm('¿Eliminar esta cuenta?')) onDeleteAccount(acc.id); 
                  }}
                  className="p-1 rounded hover:bg-red-500/10"
                  title="Eliminar"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
              
              <div className="text-2xl mb-3">{acc.emoji}</div>
              <div style={{ color: theme.inkMuted }} className="text-xs mb-1 truncate">{acc.name}</div>
              <div style={{ color: theme.ink, fontFamily: 'Fraunces, serif' }} className="font-semibold text-lg truncate">
                {formatCOP(effectiveBalance)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

