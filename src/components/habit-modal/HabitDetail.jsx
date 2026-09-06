import { useTheme } from '../../theme/ThemeContext';
import { formatLongDate, parseKey } from '../../domain/dates';
import { rootDepth, stageFor, stageIndexFor } from '../../domain/rootDepth';
import { currentStreak } from '../../domain/streak';
import { weeklyProgress } from '../../domain/habit';
import { growthRingsCount } from '../../domain/growthRings';
import { GrowthIllustration } from '../growth-illustration/GrowthIllustration';
import { Stat } from '../common/Stat';

export function HabitDetail({ habit, today, pulseKey }) {
  const theme = useTheme();
  const depth = rootDepth(habit, today);
  const stage = stageFor(depth);
  const stageIndex = stageIndexFor(depth);
  const isWeekly = habit.frequency.type === 'weekly';
  const streak = isWeekly ? null : currentStreak(habit, today);
  const weekly = isWeekly ? weeklyProgress(habit, today) : null;
  const rings = growthRingsCount(habit, today);

  return (
    <div>
      <div className="flex justify-center my-4">
        <GrowthIllustration
          stageIndex={stageIndex}
          color={habit.color}
          mutedInk={theme.inkMuted}
          size={110}
          pulseKey={pulseKey}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Etapa actual" value={stage.name} />
        <Stat
          label={isWeekly ? 'Esta semana' : 'Racha actual'}
          value={isWeekly ? `${weekly.count}/${weekly.target} días` : `${streak} día${streak !== 1 ? 's' : ''}`}
        />
        <Stat label="Anillos de crecimiento" value={`${rings}`} />
        <Stat label="Empezado el" value={formatLongDate(parseKey(habit.startDate))} />
      </div>

      <p className="mt-4 text-sm leading-relaxed" style={{ color: theme.inkMuted }}>{stage.detail}</p>
    </div>
  );
}
