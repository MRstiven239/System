import { useTheme } from '../../theme/ThemeContext';
import { HabitProgressBar } from './HabitProgressBar';
import { MiniWeekCalendar } from './MiniWeekCalendar';
import { MonthCalendar } from './MonthCalendar';
import { YearHeatmap } from './YearHeatmap';
import { currentStreak } from '../../domain/streak';
import { monthCompletionRate, periodStats } from '../../domain/progress';
import { dateKey, addDays, startOfWeek } from '../../domain/dates';
import { CheckCircle2, Circle } from 'lucide-react';

export function HabitCard({ habit, today, range, onToggleDay, onClick }) {
  const theme = useTheme();
  
  const streak = currentStreak(habit, today);
  
  // Calculate completion rate based on the selected range
  let completionRate = 0;
  if (range === 'week') {
    const weekStart = startOfWeek(today);
    const weekEnd = addDays(weekStart, 6);
    const cappedEnd = weekEnd > today ? today : weekEnd;
    const stats = periodStats(habit, weekStart, cappedEnd);
    completionRate = stats.expected === 0 ? 0 : Math.min(1, stats.completed / stats.expected);
  } else if (range === 'year') {
    // Yearly: from Jan 1st to today
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const stats = periodStats(habit, yearStart, today);
    completionRate = stats.expected === 0 ? 0 : Math.min(1, stats.completed / stats.expected);
  } else {
    // Month (default)
    completionRate = monthCompletionRate(habit, today.getFullYear(), today.getMonth(), today) || 0;
  }
  
  const dKey = dateKey(today);
  const isDoneToday = habit.completions.includes(dKey);

  const rangeLabels = {
    week: 'esta semana',
    month: 'este mes',
    year: 'este año',
  };

  return (
    <div
      onClick={onClick}
      className="animate-fade-in-up"
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 'var(--radius-card)',
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = theme.borderHover;
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = theme.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div 
        style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
          background: habit.color, opacity: 0.8
        }} 
      />
      
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{habit.icon}</span>
        <h3 style={{ color: theme.ink, fontSize: '16px', fontWeight: 600 }}>{habit.name}</h3>
      </div>

      <HabitProgressBar percent={completionRate} color={habit.color} />

      <div className="flex justify-between items-center mt-3 text-xs">
        <div style={{ color: theme.inkMuted }}>
          {streak !== null && (
            <span className="flex items-center gap-1.5">
              <span style={{ color: habit.color }}>🔥</span> Racha: {streak} d
            </span>
          )}
        </div>
        <div style={{ color: isDoneToday ? habit.color : theme.inkMuted }} className="flex items-center gap-1">
          {isDoneToday ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          <span>Hoy: {isDoneToday ? 'Completado' : 'Pendiente'}</span>
        </div>
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
        {/* Render the right visualization based on range */}
        {range === 'week' && (
          <MiniWeekCalendar habit={habit} today={today} onToggleDay={onToggleDay} />
        )}
        {range === 'month' && (
          <MonthCalendar habit={habit} today={today} onToggleDay={onToggleDay} />
        )}
        {range === 'year' && (
          <YearHeatmap habit={habit} today={today} />
        )}
      </div>
    </div>
  );
}
