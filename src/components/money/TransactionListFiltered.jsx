import { useState, useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { formatCOP } from '../../domain/budget';
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';

/** Given a timestamp, return label key for grouping */
function getDayGroupLabel(timestamp) {
  const now = new Date();
  const txDate = new Date(timestamp);
  
  // Normalize to midnight for comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const txDayStart = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()).getTime();
  
  const diffMs = todayStart - txDayStart;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return { label: 'Hoy', order: 0, isToday: true };
  if (diffDays === 1) return { label: 'Ayer', order: 1, isToday: false };
  
  // Within last 7 days: use day name
  if (diffDays < 7) {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return { label: dayNames[txDate.getDay()], order: diffDays, isToday: false };
  }
  
  // Older: use full date
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return { 
    label: `${txDate.getDate()} de ${monthNames[txDate.getMonth()]}`, 
    order: diffDays, 
    isToday: false 
  };
}

export function TransactionListFiltered({ transactions, accounts, onDelete }) {
  const theme = useTheme();
  const [filter, setFilter] = useState('all');
  const [showPrevious, setShowPrevious] = useState(false);

  // Group transactions by day
  const { todayTransactions, previousGroups } = useMemo(() => {
    let sorted = [...transactions].sort((a, b) => b.date - a.date);
    
    // Apply type filter
    if (filter !== 'all') {
      sorted = sorted.filter(t => t.type === filter);
    }

    const todayTx = [];
    const prevMap = new Map(); // label -> { label, order, transactions[] }

    for (const tx of sorted) {
      const group = getDayGroupLabel(tx.date);
      
      if (group.isToday) {
        todayTx.push(tx);
      } else {
        if (!prevMap.has(group.label)) {
          prevMap.set(group.label, { label: group.label, order: group.order, transactions: [] });
        }
        prevMap.get(group.label).transactions.push(tx);
      }
    }

    // Sort groups by order (most recent first) and limit
    const prevGroups = [...prevMap.values()]
      .sort((a, b) => a.order - b.order)
      .slice(0, 30); // limit number of groups

    return { todayTransactions: todayTx, previousGroups: prevGroups };
  }, [transactions, filter]);

  const filterTabs = [
    { id: 'all', label: 'Todos' },
    { id: 'income', label: 'Ingresos' },
    { id: 'expense', label: 'Gastos' },
    { id: 'transfer', label: 'Transferencias' },
  ];

  function renderTransaction(t) {
    const acc = accounts.find(a => a.id === t.accountId);
    const toAcc = t.toAccountId ? accounts.find(a => a.id === t.toAccountId) : null;
    const isIncome = t.type === 'income';
    const isTransfer = t.type === 'transfer';

    return (
      <div
        key={t.id}
        className="flex justify-between items-center p-4 rounded-2xl transition-all"
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-center gap-3" style={{ minWidth: 0, flex: 1 }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isTransfer
                ? 'rgba(96,165,250,0.1)'
                : isIncome
                  ? 'rgba(52,211,153,0.1)'
                  : 'rgba(248,113,113,0.1)',
            }}
          >
            {isTransfer
              ? <ArrowRightLeft size={18} color="#60a5fa" />
              : isIncome
                ? <ArrowUpRight size={18} color={theme.income} />
                : <ArrowDownRight size={18} color={theme.expense} />
            }
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: theme.ink }} className="font-semibold text-sm truncate">
              {isTransfer ? (t.description || 'Transferencia') : t.name}
            </div>
            <div style={{ color: theme.inkMuted }} className="text-xs mt-0.5 truncate">
              {isTransfer
                ? `${acc?.name || '?'} → ${toAcc?.name || '?'}`
                : <>
                    {t.category ? `${t.category} · ` : ''}
                    {acc ? acc.name : ''}
                  </>
              }
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <div
            style={{
              color: isTransfer ? '#ffffff' : isIncome ? '#34d399' : '#f87171',
              fontFamily: 'Fraunces, serif',
            }}
            className="font-semibold text-sm whitespace-nowrap"
          >
            {isTransfer ? '' : isIncome ? '+' : '-'}{formatCOP(t.amount)}
          </div>
          <button
            onClick={() => onDelete(t.id)}
            style={{ color: theme.inkFaint }}
            className="hover:text-red-500 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      {/* Header */}
      <h3 style={{ color: theme.ink }} className="text-lg font-semibold mb-4">Movimientos</h3>

      {/* Type filter tabs */}
      <div
        className="flex rounded-full p-1 mb-5 overflow-x-auto"
        style={{ background: theme.surfaceAlt, gap: '2px' }}
      >
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
            style={{
              background: filter === tab.id ? theme.surface : 'transparent',
              color: filter === tab.id ? theme.ink : theme.inkMuted,
              fontWeight: filter === tab.id ? 600 : 500,
              boxShadow: filter === tab.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toggle buttons — Hoy / Más Movimientos */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setShowPrevious(false)}
          className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all"
          style={{
            background: !showPrevious ? theme.surface : 'transparent',
            color: !showPrevious ? theme.ink : theme.inkMuted,
            border: `1.5px solid ${!showPrevious ? theme.ink : theme.border}`,
          }}
        >
          Hoy
        </button>
        <button
          onClick={() => setShowPrevious(true)}
          className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: showPrevious
              ? 'linear-gradient(135deg, #e91e8c, #c2185b)'
              : 'transparent',
            color: showPrevious ? '#fff' : theme.inkMuted,
            border: `1.5px solid ${showPrevious ? 'transparent' : theme.border}`,
          }}
        >
          Más Movimientos
          {showPrevious ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* ─── Today's transactions ─── */}
      {!showPrevious && (
        <div className="flex flex-col gap-2">
          {todayTransactions.length === 0 ? (
            <div className="text-center py-10">
              <div style={{ fontSize: '36px', marginBottom: '8px', opacity: 0.4 }}>📝</div>
              <p style={{ color: theme.inkMuted }} className="text-sm">
                No hay movimientos hoy.
              </p>
              <p style={{ color: theme.inkFaint }} className="text-xs mt-1">
                Los movimientos que registres aparecerán aquí.
              </p>
            </div>
          ) : (
            todayTransactions.map(renderTransaction)
          )}
        </div>
      )}

      {/* ─── Previous transactions grouped by day ─── */}
      {showPrevious && (
        <div className="flex flex-col gap-1">
          {previousGroups.length === 0 ? (
            <div className="text-center py-10">
              <div style={{ fontSize: '36px', marginBottom: '8px', opacity: 0.4 }}>📂</div>
              <p style={{ color: theme.inkMuted }} className="text-sm">
                No hay movimientos anteriores.
              </p>
            </div>
          ) : (
            previousGroups.map(group => (
              <div key={group.label} className="mb-4">
                {/* Day header */}
                <h4
                  className="text-base font-semibold mb-2 mt-2"
                  style={{ color: theme.ink }}
                >
                  {group.label}
                </h4>

                <div className="flex flex-col gap-2">
                  {group.transactions.map(renderTransaction)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
