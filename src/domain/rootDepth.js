// The "identity roots" mechanic: a resilience score that grows with
// consistency but never crashes to zero after a single lapse — it's a
// blend of lifetime history (permanent, slow-moving) and a recent
// 28-day window (responsive to what you're doing right now).

import { addDays, parseKey } from './dates';
import { periodStats } from './progress';

/**
 * Growth-stage vocabulary. This is *data*, not a chain of if/else —
 * adding, renaming or re-thresholding a stage means editing this list,
 * nothing that consumes it (Open/Closed).
 */
export const STAGES = [
  { max: 20, name: 'Semilla', detail: 'La intención está plantada. Todo comienzo cuenta, incluso este.' },
  { max: 40, name: 'Raíz brotando', detail: 'Empieza a tomar forma bajo la superficie, aunque todavía no se vea mucho.' },
  { max: 60, name: 'Raíz creciendo', detail: 'Ya hay una base real sosteniendo esto. Se nota cuando lo dejas un día.' },
  { max: 80, name: 'Raíz firme', detail: 'Esto ya puede sostener peso, incluso en los días difíciles.' },
  { max: 101, name: 'Identidad arraigada', detail: 'Esto ya no es algo que haces: es parte de quién eres.' },
];

export function rootDepth(habit, referenceDate) {
  const start = parseKey(habit.startDate);
  const totalDays = Math.floor((referenceDate - start) / 86400000) + 1;
  if (totalDays <= 0) return 0;

  const { expected: totalExpected, completed: totalCompleted } = periodStats(habit, start, referenceDate);
  const historicalRate = totalExpected > 0 ? Math.min(1, totalCompleted / totalExpected) : 0;

  const windowDays = Math.min(28, totalDays);
  const windowStartRaw = addDays(referenceDate, -(windowDays - 1));
  const windowStart = windowStartRaw < start ? start : windowStartRaw;
  const { expected: windowExpected, completed: windowCompleted } = periodStats(habit, windowStart, referenceDate);
  const recentRate = windowExpected > 0 ? Math.min(1, windowCompleted / windowExpected) : 0;

  return Math.round((historicalRate * 0.45 + recentRate * 0.55) * 100);
}

export function stageIndexFor(depth) {
  const idx = STAGES.findIndex((s) => depth < s.max);
  return idx === -1 ? STAGES.length - 1 : idx;
}

export function stageFor(depth) {
  return STAGES[stageIndexFor(depth)];
}
