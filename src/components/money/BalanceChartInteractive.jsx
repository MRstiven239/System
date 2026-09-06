import { useMemo, useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { balanceHistoryEnriched, formatCOP, dateLabel } from '../../domain/budget';
import { dateKey } from '../../domain/dates';

export function BalanceChartInteractive({ accounts, transactions, range }) {
  const theme = useTheme();
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const data = useMemo(() => balanceHistoryEnriched(accounts, transactions, range, dateKey(new Date())), [accounts, transactions, range]);

  if (data.length === 0) return null;

  const minBalance = Math.min(...data.map(d => d.balance));
  const maxBalance = Math.max(...data.map(d => d.balance));
  const rangeY = Math.max(maxBalance - minBalance, 1000); // Evitar división por 0

  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 40;

  const getX = (i) => paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
  const getY = (val) => height - paddingY - ((val - minBalance) / rangeY) * (height - 2 * paddingY);

  const points = data.map((d, i) => `${getX(i)},${getY(d.balance)}`).join(' ');
  const areaPoints = `${getX(0)},${height} ${points} ${getX(data.length - 1)},${height}`;

  return (
    <div className="relative w-full overflow-hidden mt-6 animate-fade-in-up" style={{ height: '300px' }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.accent} stopOpacity="0.4" />
            <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map(r => (
          <line
            key={r}
            x1={paddingX}
            y1={paddingY + r * (height - 2 * paddingY)}
            x2={width - paddingX}
            y2={paddingY + r * (height - 2 * paddingY)}
            stroke={theme.border}
            strokeDasharray="4 4"
          />
        ))}

        <polygon points={areaPoints} fill="url(#chartGradient)" />
        
        <polyline
          points={points}
          fill="none"
          stroke={theme.accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'all 0.5s ease-in-out' }}
        />

        {data.map((d, i) => (
          <g key={d.date} onMouseEnter={() => setHoveredPoint(d)} onMouseLeave={() => setHoveredPoint(null)}>
            <circle
              cx={getX(i)}
              cy={getY(d.balance)}
              r="6"
              fill={theme.surface}
              stroke={hoveredPoint === d ? theme.accent : 'transparent'}
              strokeWidth="2"
              className="cursor-pointer transition-all"
              style={{ opacity: hoveredPoint === d ? 1 : 0 }}
            />
            {/* Invisble larger circle for easier hover */}
            <circle
              cx={getX(i)}
              cy={getY(d.balance)}
              r="16"
              fill="transparent"
              className="cursor-pointer"
            />
          </g>
        ))}

        {/* X Axis Labels */}
        {data.map((d, i) => {
          if (data.length > 7 && i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={d.date}
              x={getX(i)}
              y={height - 10}
              fill={theme.inkMuted}
              fontSize="12"
              textAnchor="middle"
            >
              {dateLabel(d.date, range)}
            </text>
          );
        })}
      </svg>

      {hoveredPoint && (
        <div 
          className="absolute top-0 right-0 p-4 rounded-xl shadow-xl animate-fade-in pointer-events-none"
          style={{ 
            background: theme.surfaceAlt, 
            border: `1px solid ${theme.borderHover}`,
            zIndex: 10 
          }}
        >
          <div style={{ color: theme.inkMuted }} className="text-xs mb-2">
            {new Date(hoveredPoint.date + 'T00:00:00').toLocaleDateString('es-CO')}
          </div>
          <div style={{ color: theme.ink, fontFamily: 'Fraunces, serif' }} className="text-lg font-bold mb-3">
            {formatCOP(hoveredPoint.balance)}
          </div>
          <div className="flex gap-4 text-xs">
            {hoveredPoint.income > 0 && <span style={{ color: theme.income }}>+{formatCOP(hoveredPoint.income)}</span>}
            {hoveredPoint.expense > 0 && <span style={{ color: theme.expense }}>-{formatCOP(hoveredPoint.expense)}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
