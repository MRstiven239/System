// The Habit "model" and everything that depends only on its shape
// (frequency rules). Kept separate from progress math (see progress.js)
// so each file has one reason to change.

import { addDays, dateKey } from './dates';

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

/**
 * Builds a new habit record from form data.
 * This is the single place that knows the full shape of a habit,
 * so nothing else has to guess which fields exist.
 */
export function createHabit({ name, identity, icon, color, frequency, startDate }) {
  return {
    id: makeId(),
    name,
    identity,
    icon,
    color,
    frequency,
    startDate,
    completions: [],
    createdAt: Date.now(),
  };
}

/**
 * Turns the form's frequency-related fields into a validated frequency
 * object, or returns an error message. This is the one place that
 * knows "a 'days' frequency needs at least one day" — the form
 * component just displays whatever error comes back.
 */
export function buildFrequency({ freqType, days, timesPerWeek }) {
  if (freqType === 'daily') {
    return { frequency: { type: 'daily' } };
  }
  if (freqType === 'days') {
    if (!days || days.length === 0) {
      return { error: 'Elige al menos un día de la semana.' };
    }
    return { frequency: { type: 'days', days } };
  }
  return {
    frequency: { type: 'weekly', timesPerWeek: Math.min(7, Math.max(1, Number(timesPerWeek) || 1)) },
  };
}

export function toggleHabitCompletion(habit, key) {
  const has = habit.completions.includes(key);
  return {
    ...habit,
    completions: has
      ? habit.completions.filter((k) => k !== key)
      : [...habit.completions, key],
  };
}

/** True if `date` counts toward this habit's frequency target. */
export function isRequiredDay(freq, date) {
  if (freq.type === 'days') return freq.days.includes(date.getDay());
  return true; // 'daily' and 'weekly' — every day is eligible
}

export function weeklyProgress(habit, referenceDate) {
  const start = addDays(referenceDate, -((referenceDate.getDay() + 6) % 7));
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    if (d > referenceDate) break;
    if (habit.completions.includes(dateKey(d))) count++;
  }
  return { count, target: habit.frequency.timesPerWeek };
}
