import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { SectionHeader } from '../layout/SectionHeader';
import { EmptyState } from '../layout/EmptyState';
import { GoalCard } from './GoalCard';
import { GoalFormModal } from './GoalFormModal';
import { GOAL_CATEGORIES, getCategoryById } from '../../domain/goal';

export function GoalsView({
  goals, loaded, addGoal, updateGoal, deleteGoal, toggleChecklistItem,
  accounts, transactions, habits
}) {
  const theme = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredGoals = filterCategory === 'all'
    ? goals
    : goals.filter(g => g.category === filterCategory);

  // Count goals per category for badge display
  const categoryCounts = {};
  for (const g of goals) {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <SectionHeader
          title="Objetivos"
          subtitle="Define metas claras, mide tu progreso y celebra tus logros."
        />
        <button
          onClick={() => setIsCreating(true)}
          style={{ background: theme.ink, color: theme.pageBg }}
          className="px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 -mt-4"
        >
          <span>+</span> Nuevo objetivo
        </button>
      </div>

      {/* Category filter */}
      {goals.length > 0 && (
        <div
          className="flex gap-1.5 mb-6 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            onClick={() => setFilterCategory('all')}
            className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all"
            style={{
              background: filterCategory === 'all' ? theme.ink : theme.surfaceAlt,
              color: filterCategory === 'all' ? theme.pageBg : theme.inkMuted,
              fontWeight: filterCategory === 'all' ? 600 : 400,
            }}
          >
            Todos ({goals.length})
          </button>
          {GOAL_CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all inline-flex items-center gap-1.5"
                style={{
                  background: filterCategory === cat.id ? `${cat.color}20` : theme.surfaceAlt,
                  color: filterCategory === cat.id ? cat.color : theme.inkMuted,
                  fontWeight: filterCategory === cat.id ? 600 : 400,
                  border: filterCategory === cat.id ? `1px solid ${cat.color}40` : `1px solid transparent`,
                }}
              >
                <span>{cat.emoji}</span>
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Goal cards */}
      {!loaded ? (
        <p style={{ color: theme.inkMuted }} className="text-sm text-center py-16">Cargando objetivos…</p>
      ) : goals.length === 0 ? (
        <EmptyState onCreateFirst={() => setIsCreating(true)} />
      ) : filteredGoals.length === 0 ? (
        <p style={{ color: theme.inkMuted }} className="text-sm text-center py-12">
          No hay objetivos en esta categoría.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGoals.map((g, i) => (
            <div key={g.id} style={{ animationDelay: `${i * 80}ms` }}>
              <GoalCard
                goal={g}
                accounts={accounts}
                transactions={transactions}
                habits={habits}
                onUpdate={updateGoal}
                onDelete={deleteGoal}
                onToggleChecklistItem={toggleChecklistItem}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {isCreating && (
        <GoalFormModal
          onClose={() => setIsCreating(false)}
          onSubmit={(data) => {
            addGoal(data);
            setIsCreating(false);
          }}
          accounts={accounts}
          habits={habits || []}
        />
      )}
    </div>
  );
}
