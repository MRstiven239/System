import { useTheme } from '../../theme/ThemeContext';
import { formatCOP } from '../../domain/budget';
import { AnimatedNumber } from '../common/AnimatedNumber';

export function FinancialSummary({ currentBalance, previousBalance, totalIncome, totalExpenses, savingsRate }) {
  const theme = useTheme();

  const balanceChange = previousBalance ? ((currentBalance - previousBalance) / previousBalance) * 100 : 0;
  const isPositive = balanceChange >= 0;

  return (
    <div 
      className="p-6 rounded-3xl animate-fade-in-up"
      style={{
        background: `linear-gradient(135deg, ${theme.surface} 0%, ${theme.surfaceAlt} 100%)`,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 style={{ color: theme.inkMuted }} className="text-sm mb-1">Balance Actual</h3>
          <div style={{ color: theme.ink, fontFamily: 'Fraunces, serif' }} className="text-4xl font-bold">
            <AnimatedNumber value={currentBalance} formatFn={formatCOP} />
          </div>
        </div>
        {previousBalance > 0 && (
          <div 
            style={{ 
              background: isPositive ? theme.accentMuted : 'rgba(248,113,113,0.15)',
              color: isPositive ? theme.accent : theme.expense,
            }}
            className="px-3 py-1 rounded-full text-xs font-semibold"
          >
            {isPositive ? '↑' : '↓'} {Math.abs(balanceChange).toFixed(1)}% este mes
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}` }} className="p-4 rounded-2xl">
          <div style={{ color: theme.inkMuted }} className="text-xs mb-1">Ingresos</div>
          <div style={{ color: theme.income }} className="font-semibold truncate">
            <AnimatedNumber value={totalIncome} formatFn={formatCOP} />
          </div>
        </div>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}` }} className="p-4 rounded-2xl">
          <div style={{ color: theme.inkMuted }} className="text-xs mb-1">Gastos</div>
          <div style={{ color: theme.expense }} className="font-semibold truncate">
            <AnimatedNumber value={totalExpenses} formatFn={formatCOP} />
          </div>
        </div>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}` }} className="p-4 rounded-2xl">
          <div style={{ color: theme.inkMuted }} className="text-xs mb-1">Ahorro</div>
          <div style={{ color: theme.ink }} className="font-semibold truncate">
            <AnimatedNumber value={savingsRate * 100} formatFn={(v) => `${Math.round(v)}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}
