import { useTheme } from '../../theme/ThemeContext';
import { SectionHeader } from '../layout/SectionHeader';
import { formatCOP, totalBalance, periodFinancials } from '../../domain/budget';
import { calculateGoalProgress } from '../../domain/goal';
import { monthCompletionRate } from '../../domain/progress';
import { AnimatedNumber } from '../common/AnimatedNumber';

export function HomeView({ 
  habits, 
  accounts, 
  transactions, 
  goals, 
  reflections, 
  today,
  onNavigate
}) {
  const theme = useTheme();

  // Saludo
  const hour = new Date().getHours();
  let greeting = 'Buenos días';
  if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';
  else if (hour >= 19) greeting = 'Buenas noches';

  // Progreso de hoy (hábitos)
  const dKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const completedHabits = habits.filter(h => h.completions.includes(dKey)).length;
  const habitPercent = habits.length > 0 ? completedHabits / habits.length : 0;

  // Tu dinero
  const currentTotalBalance = totalBalance(accounts, transactions);
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
  const thisMonthStats = periodFinancials(transactions, thisMonthStart, thisMonthEnd);
  const previousBalance = currentTotalBalance - thisMonthStats.netBalance;
  const balanceChange = previousBalance ? ((currentTotalBalance - previousBalance) / previousBalance) * 100 : 0;

  // Objetivo principal (el primero)
  const mainGoal = goals[0];
  let goalPercent = 0;
  let goalProgress = 0;
  if (mainGoal && mainGoal.targetAmount > 0) {
    goalProgress = calculateGoalProgress(mainGoal, accounts, transactions);
    goalPercent = Math.min(goalProgress / mainGoal.targetAmount, 1);
  }

  // Última reflexión
  const lastReflection = reflections[0];

  return (
    <div>
      <SectionHeader title={`${greeting},`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progreso Hábitos */}
        <div 
          onClick={() => onNavigate('garden')}
          className="p-5 rounded-3xl cursor-pointer transition-transform hover:-translate-y-1 animate-fade-in-up"
          style={{ background: theme.surface, border: `1px solid ${theme.border}`, animationDelay: '50ms' }}
        >
          <h3 style={{ color: theme.inkMuted }} className="text-sm mb-3">Tu progreso de hoy</h3>
          <div className="flex justify-between items-end mb-2">
            <span style={{ color: theme.ink }} className="font-semibold">{completedHabits}/{habits.length} hábitos</span>
            <span style={{ color: theme.accent, fontFamily: 'Fraunces, serif' }} className="font-bold text-xl">
              <AnimatedNumber value={habitPercent * 100} formatFn={v => `${Math.round(v)}%`} />
            </span>
          </div>
          <div style={{ background: theme.surfaceAlt, borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${habitPercent * 100}%`, background: theme.accent, height: '100%', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Progreso Dinero */}
        <div 
          onClick={() => onNavigate('money')}
          className="p-5 rounded-3xl cursor-pointer transition-transform hover:-translate-y-1 animate-fade-in-up"
          style={{ background: theme.surface, border: `1px solid ${theme.border}`, animationDelay: '100ms' }}
        >
          <h3 style={{ color: theme.inkMuted }} className="text-sm mb-3">Tu dinero</h3>
          <div className="flex justify-between items-start">
            <div style={{ color: theme.ink, fontFamily: 'Fraunces, serif' }} className="font-bold text-2xl">
              <AnimatedNumber value={currentTotalBalance} formatFn={formatCOP} />
            </div>
            {previousBalance > 0 && (
              <div 
                style={{ 
                  color: balanceChange >= 0 ? theme.income : theme.expense,
                  background: balanceChange >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)'
                }}
                className="px-2 py-1 rounded text-xs font-semibold"
              >
                {balanceChange >= 0 ? '↑' : '↓'} {Math.abs(balanceChange).toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        {/* Objetivo principal */}
        {mainGoal && (
          <div 
            onClick={() => onNavigate('goals')}
            className="p-5 rounded-3xl cursor-pointer transition-transform hover:-translate-y-1 animate-fade-in-up md:col-span-2"
            style={{ background: theme.surface, border: `1px solid ${theme.border}`, animationDelay: '150ms' }}
          >
            <h3 style={{ color: theme.inkMuted }} className="text-sm mb-3">Tu objetivo actual</h3>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{mainGoal.icon}</span>
              <span style={{ color: theme.ink }} className="font-semibold">{mainGoal.name}</span>
            </div>
            <div style={{ background: theme.surfaceAlt, borderRadius: '4px', height: '6px', overflow: 'hidden', margin: '12px 0' }}>
              <div style={{ width: `${goalPercent * 100}%`, background: theme.accent, height: '100%', transition: 'width 0.5s ease' }} />
            </div>
            <div className="flex justify-between text-xs" style={{ color: theme.inkMuted }}>
              <span>{formatCOP(goalProgress)} / {formatCOP(mainGoal.targetAmount)}</span>
              <span style={{ color: theme.ink }} className="font-bold">{Math.round(goalPercent * 100)}%</span>
            </div>
          </div>
        )}

        {/* Última reflexión */}
        {lastReflection && (
          <div 
            onClick={() => onNavigate('reflections')}
            className="p-5 rounded-3xl cursor-pointer transition-transform hover:-translate-y-1 animate-fade-in-up md:col-span-2"
            style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`, animationDelay: '200ms' }}
          >
            <h3 style={{ color: theme.inkMuted }} className="text-sm mb-3">Última reflexión</h3>
            <p style={{ color: theme.ink, fontStyle: 'italic', opacity: 0.9 }} className="text-sm line-clamp-2">
              "{lastReflection.content}"
            </p>
            <div style={{ color: theme.inkFaint }} className="text-xs mt-3 uppercase tracking-wider">
              {new Date(lastReflection.createdAt).toLocaleDateString('es-CO')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
