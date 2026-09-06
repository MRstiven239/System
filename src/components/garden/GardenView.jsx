import { useTheme } from '../../theme/ThemeContext';
import { SectionHeader } from '../layout/SectionHeader';
import { Toolbar } from '../layout/Toolbar';
import { EmptyState } from '../layout/EmptyState';
import { HabitCard } from './HabitCard';
import { DANGER } from '../../theme/semanticColors';

export function GardenView({
  habits,
  range,
  setRange,
  loaded,
  saveError,
  today,
  setIsCreating,
  handleToggleDay,
  modalOpen
}) {
  const theme = useTheme();

  return (
    <div>
      <SectionHeader 
        title="Tu Jardín" 
        subtitle="Cada día que marcas es una raíz más honda hacia la persona que quieres ser." 
      />

      <Toolbar range={range} onRangeChange={setRange} onCreateHabit={() => setIsCreating(true)} />

      {!loaded ? (
        <p style={{ color: theme.inkMuted }} className="text-sm text-center py-16">Cargando tu jardín…</p>
      ) : habits.length === 0 ? (
        <EmptyState onCreateFirst={() => setIsCreating(true)} />
      ) : (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '16px' 
          }}
        >
          {habits.map((habit, i) => (
            <div key={habit.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in-up">
              <HabitCard
                habit={habit}
                today={today}
                range={range}
                onToggleDay={(dateKey) => handleToggleDay(habit.id, dateKey)}
                onClick={() => modalOpen(habit.id)}
              />
            </div>
          ))}
        </div>
      )}

      {saveError && (
        <p className="text-xs mt-4 text-center" style={{ color: DANGER }}>No se pudo guardar. Intenta de nuevo.</p>
      )}
    </div>
  );
}
