import { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { periodFinancials } from '../../domain/budget';

export function FinancialInsights({ transactions }) {
  const theme = useTheme();

  const insights = useMemo(() => {
    if (transactions.length < 5) return null;

    const now = new Date();
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime();

    const thisMonth = periodFinancials(transactions, thisMonthStart, thisMonthEnd);
    const lastMonth = periodFinancials(transactions, lastMonthStart, lastMonthEnd);

    if (thisMonth.totalExpenses === 0 && lastMonth.totalExpenses === 0) return null;

    const messages = [];

    if (lastMonth.totalExpenses > 0) {
      const expenseChange = ((thisMonth.totalExpenses - lastMonth.totalExpenses) / lastMonth.totalExpenses) * 100;
      if (expenseChange < -5) {
        messages.push(`Tus gastos este mes son un ${Math.abs(expenseChange).toFixed(1)}% menores que el mes pasado. ¡Buen trabajo!`);
      } else if (expenseChange > 5) {
        messages.push(`Tus gastos han aumentado un ${expenseChange.toFixed(1)}% respecto al mes pasado.`);
      }
    }

    if (thisMonth.savingsRate > 0.2) {
      messages.push(`Estás ahorrando el ${(thisMonth.savingsRate * 100).toFixed(0)}% de tus ingresos este mes. Excelente capacidad de ahorro.`);
    } else if (thisMonth.savingsRate < 0 && thisMonth.totalExpenses > 0) {
      messages.push(`Cuidado, tus gastos superan a tus ingresos este mes.`);
    }

    return messages;
  }, [transactions]);

  if (!insights || insights.length === 0) return null;

  return (
    <div className="mt-8 p-4 rounded-2xl animate-fade-in-up" style={{ animationDelay: '300ms', background: theme.accentMuted, border: `1px solid ${theme.border}` }}>
      <h3 style={{ color: theme.accent }} className="font-semibold text-sm mb-2 flex items-center gap-2">
        <span>💡</span> Insights Financieros
      </h3>
      <ul className="text-sm space-y-2" style={{ color: theme.ink }}>
        {insights.map((msg, i) => (
          <li key={i}>• {msg}</li>
        ))}
      </ul>
    </div>
  );
}
