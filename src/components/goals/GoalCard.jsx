import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { formatCOP } from '../../domain/budget';
import {
  calculateGoalProgress,
  calculateGoalCurrentValue,
  getCategoryById,
  goalStatus,
  goalTimeRemaining,
  STATUS_COLORS,
} from '../../domain/goal';
import { monthCompletionRate } from '../../domain/progress';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { Trash2, Edit2, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function GoalCard({ goal, accounts, transactions, habits, onUpdate, onDelete, onToggleChecklistItem }) {
  const theme = useTheme();
  const [showChecklist, setShowChecklist] = useState(false);

  const progress = calculateGoalProgress(goal, accounts, transactions, habits);
  const cat = getCategoryById(goal.category);
  const status = goalStatus(goal, progress);
  const timeLeft = goalTimeRemaining(goal);
  const statusColor = STATUS_COLORS[status];
  const percentage = Math.round(progress * 100);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const StatusIcon = status === 'completed' ? CheckCircle2
    : status === 'overdue' ? XCircle
    : status === 'at-risk' ? AlertTriangle
    : Clock;

  return (
    <div
      className="relative p-5 rounded-2xl group transition-all hover:-translate-y-1 animate-fade-in-up"
      style={{
        background: theme.surface,
        border: `1.5px solid ${status === 'completed' ? STATUS_COLORS.completed : theme.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Category color accent bar */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
          background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
        }}
      />

      {/* Actions */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
          title="Editar"
        >
          <Edit2 size={14} style={{ color: theme.inkMuted }} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('¿Eliminar este objetivo?')) onDelete(goal.id);
          }}
          className="p-1 rounded hover:bg-red-500/10"
          title="Eliminar"
        >
          <Trash2 size={14} className="text-red-400" />
        </button>
      </div>

      {/* Header: icon + name + category badge */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{goal.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 style={{ color: theme.ink }} className="font-semibold text-sm truncate">{goal.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${cat.color}20`, color: cat.color }}
            >
              {cat.label}
            </span>
            {goal.description && (
              <span className="text-[10px] truncate" style={{ color: theme.inkFaint }}>
                {goal.description}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-1">
        <div
          style={{
            background: theme.surfaceAlt,
            borderRadius: '8px',
            height: '10px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${cat.color}, ${cat.color}cc)`,
              borderRadius: '8px',
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>

      {/* Progress detail */}
      <div className="flex justify-between items-end mt-3">
        <div style={{ color: theme.inkMuted }} className="text-xs">
          {goal.measureType === 'financial' && (
            <>
              <span style={{ color: theme.ink }} className="font-medium mr-1">
                <AnimatedNumber
                  value={calculateGoalCurrentValue(goal, accounts, transactions)}
                  formatFn={formatCOP}
                />
              </span>
              / {formatCOP(goal.targetAmount)}
            </>
          )}

          {goal.measureType === 'manual' && goal.targetAmount && (
            <>
              <span style={{ color: theme.ink }} className="font-medium mr-1">
                {goal.currentAmount || 0}
              </span>
              / {goal.targetAmount} {goal.targetUnit || ''}
            </>
          )}

          {goal.measureType === 'checklist' && (
            <>
              <span style={{ color: theme.ink }} className="font-medium mr-1">
                {(goal.checklistItems || []).filter(i => i.done).length}
              </span>
              / {(goal.checklistItems || []).length} pasos
            </>
          )}

          {goal.measureType === 'habit' && (
            <span>
              {(goal.linkedHabits || []).length} hábito{(goal.linkedHabits || []).length !== 1 ? 's' : ''} vinculado{(goal.linkedHabits || []).length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div style={{ color: cat.color, fontFamily: 'Fraunces, serif' }} className="font-bold text-lg">
          <AnimatedNumber value={percentage} formatFn={(v) => `${Math.round(v)}%`} />
        </div>
      </div>

      {/* ── Habit details ── */}
      {goal.measureType === 'habit' && habits && (goal.linkedHabits || []).length > 0 && (
        <div className="mt-3 pt-3 flex flex-col gap-1.5" style={{ borderTop: `1px solid ${theme.border}` }}>
          {goal.linkedHabits.map(link => {
            const habit = habits.find(h => h.id === link.habitId);
            if (!habit) return null;
            const rate = monthCompletionRate(habit, today.getFullYear(), today.getMonth(), today) || 0;
            const ratePercent = Math.round(rate * 100);
            return (
              <div key={link.habitId} className="flex items-center gap-2">
                <span className="text-xs">{habit.icon}</span>
                <span className="text-xs flex-1 truncate" style={{ color: theme.ink }}>{habit.name}</span>
                {link.weight > 1 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: theme.surfaceAlt, color: theme.inkFaint }}>
                    ×{link.weight}
                  </span>
                )}
                {/* Mini progress bar */}
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: theme.surfaceAlt }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${ratePercent}%`,
                      background: ratePercent >= 70 ? '#34d399' : ratePercent >= 40 ? '#fbbf24' : '#f87171',
                    }}
                  />
                </div>
                <span className="text-[10px] w-8 text-right" style={{ color: theme.inkMuted }}>
                  {ratePercent}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Checklist details ── */}
      {goal.measureType === 'checklist' && (goal.checklistItems || []).length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
          <button
            onClick={() => setShowChecklist(!showChecklist)}
            className="text-[10px] font-medium mb-2 flex items-center gap-1"
            style={{ color: theme.inkMuted }}
          >
            {showChecklist ? '▾' : '▸'} {showChecklist ? 'Ocultar pasos' : 'Ver pasos'}
          </button>
          {showChecklist && (
            <div className="flex flex-col gap-1">
              {goal.checklistItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onToggleChecklistItem(goal.id, item.id)}
                  className="flex items-center gap-2 p-2 rounded-lg text-left transition-all hover:bg-black/5"
                >
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: item.done ? cat.color : 'transparent',
                      border: `1.5px solid ${item.done ? cat.color : theme.border}`,
                      color: '#fff',
                      fontSize: '9px',
                    }}
                  >
                    {item.done && '✓'}
                  </div>
                  <span
                    className="text-xs"
                    style={{
                      color: item.done ? theme.inkMuted : theme.ink,
                      textDecoration: item.done ? 'line-through' : 'none',
                    }}
                  >
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Footer: time + status + manual update ── */}
      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
        {/* Status + time */}
        <div className="flex items-center gap-1.5">
          <StatusIcon size={12} style={{ color: statusColor }} />
          <span className="text-[10px]" style={{ color: statusColor }}>
            {status === 'completed' ? 'Completado' :
             status === 'overdue' ? 'Vencido' :
             status === 'at-risk' ? 'En riesgo' :
             timeLeft ? timeLeft.label : 'Sin plazo'}
          </span>
        </div>

        {/* Manual update button */}
        {goal.measureType === 'manual' && status !== 'completed' && (
          <button
            onClick={() => {
              const val = prompt(`Progreso actual (${goal.targetUnit || 'unidades'}):`, goal.currentAmount);
              if (val !== null) onUpdate(goal.id, { currentAmount: Number(val) });
            }}
            className="text-[10px] font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: theme.surfaceAlt, color: theme.ink, border: `1px solid ${theme.border}` }}
          >
            Actualizar
          </button>
        )}

        {/* Financial manual update (when not linked to account) */}
        {goal.measureType === 'financial' && !goal.linkedAccountId && status !== 'completed' && (
          <button
            onClick={() => {
              const val = prompt('Progreso actual ($):', goal.currentAmount);
              if (val !== null) onUpdate(goal.id, { currentAmount: Number(val) });
            }}
            className="text-[10px] font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: theme.surfaceAlt, color: theme.ink, border: `1px solid ${theme.border}` }}
          >
            Actualizar
          </button>
        )}

        {/* Linked account indicator */}
        {goal.measureType === 'financial' && goal.linkedAccountId && (
          <span className="text-[9px] uppercase tracking-wider" style={{ color: theme.inkFaint }}>
            Automático
          </span>
        )}
      </div>
    </div>
  );
}
