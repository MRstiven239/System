import { useTheme } from '../../theme/ThemeContext';
import { AnimatedNumber } from '../common/AnimatedNumber';

export function HabitProgressBar({ percent, color }) {
  const theme = useTheme();

  return (
    <div className="flex items-center gap-3 w-full my-2">
      <div 
        style={{ background: theme.surfaceAlt, borderRadius: '8px', height: '8px', flex: 1, overflow: 'hidden' }}
      >
        <div 
          style={{ 
            height: '100%', 
            width: `${percent * 100}%`, 
            background: color, 
            borderRadius: '8px',
            transition: 'width var(--transition-slow)' 
          }}
        />
      </div>
      <div style={{ color: theme.inkMuted, fontSize: '12px', minWidth: '36px', textAlign: 'right' }}>
        <AnimatedNumber value={Math.round(percent * 100)} formatFn={(v) => `${Math.round(v)}%`} />
      </div>
    </div>
  );
}
