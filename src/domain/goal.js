// Goal domain — pure functions for goal creation, progress calculation, and status.

import { computeBalances } from './budget';
import { monthCompletionRate } from './progress';

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Categories ────────────────────────────────────────────────────────────────

export const GOAL_CATEGORIES = [
  { id: 'financial',     emoji: '💰', label: 'Financiera',   color: '#34d399' },
  { id: 'physical',      emoji: '💪', label: 'Física',       color: '#f97316' },
  { id: 'learning',      emoji: '📚', label: 'Aprendizaje',  color: '#60a5fa' },
  { id: 'personal',      emoji: '👨‍👩‍👧‍👦', label: 'Personal',    color: '#a78bfa' },
  { id: 'professional',  emoji: '💼', label: 'Profesional',  color: '#fbbf24' },
  { id: 'wellness',      emoji: '🧘', label: 'Bienestar',    color: '#f472b6' },
];

export function getCategoryById(id) {
  return GOAL_CATEGORIES.find(c => c.id === id) || GOAL_CATEGORIES[0];
}

// ─── Default measure type suggestions per category ─────────────────────────────

const CATEGORY_MEASURE_DEFAULTS = {
  financial: 'financial',
  physical: 'habit',
  learning: 'manual',
  personal: 'habit',
  professional: 'checklist',
  wellness: 'habit',
};

export function suggestedMeasureType(categoryId) {
  return CATEGORY_MEASURE_DEFAULTS[categoryId] || 'manual';
}

// ─── Create ────────────────────────────────────────────────────────────────────

export function createGoal({
  name,
  icon,
  category,
  description,
  deadline,
  timeframe,
  measureType,
  targetAmount,
  targetUnit,
  currentAmount,
  checklistItems,
  linkedAccountId,
  linkedHabits,       // [{ habitId, weight }]
}) {
  return {
    id: makeId(),
    name,
    icon: icon || getCategoryById(category).emoji,
    category: category || 'personal',
    description: description || '',

    // Plazos
    deadline: deadline || null,
    timeframe: timeframe || 'medium',  // 'short' | 'medium' | 'long'

    // Medición
    measureType: measureType || 'manual',
    targetAmount: targetAmount ? Number(targetAmount) : null,
    targetUnit: targetUnit || '',
    currentAmount: currentAmount ? Number(currentAmount) : 0,
    checklistItems: checklistItems || [],  // [{ id, text, done }]

    // Conexiones
    linkedAccountId: linkedAccountId || null,
    linkedHabits: linkedHabits || [],      // [{ habitId, weight }]

    createdAt: Date.now(),
    completedAt: null,
  };
}

// ─── Checklist helpers ─────────────────────────────────────────────────────────

export function makeChecklistItem(text) {
  return { id: makeId(), text, done: false };
}

export function toggleChecklistItemInGoal(goal, itemId) {
  return {
    ...goal,
    checklistItems: goal.checklistItems.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    ),
  };
}

// ─── Progress calculation ──────────────────────────────────────────────────────

/**
 * Calculates progress as a value between 0 and 1.
 * Handles all 4 measure types.
 */
export function calculateGoalProgress(goal, accounts, transactions, habits) {
  switch (goal.measureType) {
    case 'financial':
      return calcFinancialProgress(goal, accounts, transactions);
    case 'habit':
      return calcHabitProgress(goal, habits);
    case 'checklist':
      return calcChecklistProgress(goal);
    case 'manual':
    default:
      return calcManualProgress(goal);
  }
}

/**
 * Returns the raw current value (not percentage) for display purposes.
 */
export function calculateGoalCurrentValue(goal, accounts, transactions) {
  if (goal.measureType === 'financial') {
    if (!goal.linkedAccountId) return goal.currentAmount || 0;
    const balances = computeBalances(accounts, transactions);
    return Math.max(0, balances.get(goal.linkedAccountId) ?? 0);
  }
  if (goal.measureType === 'checklist') {
    const done = (goal.checklistItems || []).filter(i => i.done).length;
    return done;
  }
  return goal.currentAmount || 0;
}

function calcFinancialProgress(goal, accounts, transactions) {
  if (!goal.targetAmount || goal.targetAmount <= 0) return 0;
  
  if (goal.linkedAccountId) {
    const balances = computeBalances(accounts, transactions);
    const balance = balances.get(goal.linkedAccountId) ?? 0;
    return Math.min(1, Math.max(0, balance / goal.targetAmount));
  }
  
  // Manual financial tracking
  return Math.min(1, Math.max(0, (goal.currentAmount || 0) / goal.targetAmount));
}

function calcHabitProgress(goal, habits) {
  const linked = goal.linkedHabits || [];
  if (linked.length === 0 || !habits || habits.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();

  let totalWeight = 0;
  let weightedSum = 0;

  for (const link of linked) {
    const habit = habits.find(h => h.id === link.habitId);
    if (!habit) continue;

    const rate = monthCompletionRate(habit, year, month, today) || 0;
    const w = link.weight || 1;
    weightedSum += rate * w;
    totalWeight += w;
  }

  return totalWeight > 0 ? Math.min(1, weightedSum / totalWeight) : 0;
}

function calcChecklistProgress(goal) {
  const items = goal.checklistItems || [];
  if (items.length === 0) return 0;
  const done = items.filter(i => i.done).length;
  return done / items.length;
}

function calcManualProgress(goal) {
  if (!goal.targetAmount || goal.targetAmount <= 0) return 0;
  return Math.min(1, Math.max(0, (goal.currentAmount || 0) / goal.targetAmount));
}

// ─── Status & time helpers ─────────────────────────────────────────────────────

/**
 * Returns goal status: 'completed' | 'overdue' | 'at-risk' | 'on-track' | 'no-deadline'
 */
export function goalStatus(goal, progress) {
  if (goal.completedAt || progress >= 1) return 'completed';
  if (!goal.deadline) return 'no-deadline';

  const now = Date.now();
  const remaining = goal.deadline - now;
  const totalDuration = goal.deadline - goal.createdAt;

  if (remaining <= 0) return 'overdue';

  // At risk if less than 20% of time left but less than 80% progress
  const timeUsedRatio = 1 - (remaining / totalDuration);
  if (timeUsedRatio > 0.8 && progress < 0.8) return 'at-risk';

  return 'on-track';
}

export function goalTimeRemaining(goal) {
  if (!goal.deadline) return null;
  
  const now = Date.now();
  const diff = goal.deadline - now;
  
  if (diff <= 0) return { label: 'Vencido', days: 0, overdue: true };
  
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days === 1) return { label: 'Vence mañana', days, overdue: false };
  if (days <= 7) return { label: `Vence en ${days} días`, days, overdue: false };
  if (days <= 30) return { label: `Vence en ${Math.ceil(days / 7)} semanas`, days, overdue: false };
  if (days <= 365) return { label: `Vence en ${Math.ceil(days / 30)} meses`, days, overdue: false };
  return { label: `Vence en ${Math.round(days / 365)} años`, days, overdue: false };
}

export const STATUS_COLORS = {
  'completed': '#34d399',
  'overdue':   '#f87171',
  'at-risk':   '#fbbf24',
  'on-track':  '#60a5fa',
  'no-deadline': '#94a3b8',
};
