import { Plus } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { RangePicker } from './RangePicker';

export function Toolbar({ range, onRangeChange, onCreateHabit }) {
  const theme = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-3 justify-between mb-5">
      <RangePicker range={range} onChange={onRangeChange} />
      <button
        onClick={onCreateHabit}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
        style={{ background: theme.ink, color: theme.onInk }}
      >
        <Plus size={16} /> Nuevo hábito
      </button>
    </div>
  );
}
