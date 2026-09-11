import { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { balanceHistoryEnriched, formatCOP, dateLabel } from '../../domain/budget';
import { dateKey } from '../../domain/dates';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div 
        className="p-4 rounded-xl shadow-xl animate-fade-in"
        style={{ background: theme.surfaceAlt, border: `1px solid ${theme.borderHover}` }}
      >
        <div style={{ color: theme.inkMuted }} className="text-xs mb-2">
          {new Date(point.date + 'T00:00:00').toLocaleDateString('es-CO')}
        </div>
        <div style={{ color: theme.ink, fontFamily: 'Fraunces, serif' }} className="text-lg font-bold mb-3">
          {formatCOP(point.balance)}
        </div>
        <div className="flex gap-4 text-xs">
          {point.income > 0 && <span style={{ color: theme.income }}>+{formatCOP(point.income)}</span>}
          {point.expense > 0 && <span style={{ color: theme.expense }}>-{formatCOP(point.expense)}</span>}
        </div>
      </div>
    );
  }
  return null;
};

export function BalanceChartInteractive({ accounts, transactions, range }) {
  const theme = useTheme();

  const data = useMemo(() => balanceHistoryEnriched(accounts, transactions, range, dateKey(new Date())), [accounts, transactions, range]);

  if (data.length === 0) return null;

  return (
    <div className="w-full mt-6 animate-fade-in-up" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.accent} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.border} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(val) => dateLabel(val, range)} 
            stroke={theme.inkMuted}
            tick={{ fill: theme.inkMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            minTickGap={20}
          />
          <YAxis 
            domain={[0, dataMax => Math.max(dataMax, 1000)]} 
            tickFormatter={(val) => {
              if (val === 0) return '$0';
              if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
              if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
              return `$${val}`;
            }} 
            stroke={theme.inkMuted}
            tick={{ fill: theme.inkMuted, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip theme={theme} />} />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke={theme.accent} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorBalance)" 
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
