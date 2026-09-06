import { useCallback, useState } from 'react';

/**
 * Tracks a small counter per habit id. Bumping it changes a React
 * `key`, which is enough to force the growth illustration to
 * re-mount and replay its pulse animation — without this hook, the
 * animation component itself would need to know about completion
 * events, coupling it to habit logic it shouldn't care about.
 */
export function useGrowthPulse() {
  const [pulses, setPulses] = useState({});

  const bump = useCallback((habitId) => {
    setPulses((prev) => ({ ...prev, [habitId]: (prev[habitId] || 0) + 1 }));
  }, []);

  const pulseKeyFor = useCallback((habitId) => pulses[habitId] || 0, [pulses]);

  return { bump, pulseKeyFor };
}
