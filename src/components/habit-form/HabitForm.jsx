import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { DANGER } from '../../theme/semanticColors';
import { dateKey } from '../../domain/dates';
import { buildFrequency } from '../../domain/habit';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { FrequencyPicker } from './FrequencyPicker';

const DEFAULT_ICON = '🧘';

export function HabitForm({ initial, defaultColor, onCancel, onSubmit, submitLabel }) {
  const theme = useTheme();
  const [name, setName] = useState(initial?.name || '');
  const [identity, setIdentity] = useState(initial?.identity || '');
  const [icon, setIcon] = useState(initial?.icon || DEFAULT_ICON);
  const [color, setColor] = useState(initial?.color || defaultColor);
  const [freqType, setFreqType] = useState(initial?.frequency?.type || 'daily');
  const [days, setDays] = useState(initial?.frequency?.type === 'days' ? initial.frequency.days : []);
  const [timesPerWeek, setTimesPerWeek] = useState(initial?.frequency?.type === 'weekly' ? initial.frequency.timesPerWeek : 3);
  const [startDate, setStartDate] = useState(initial?.startDate || dateKey(new Date()));
  const [error, setError] = useState('');

  function toggleDay(i) {
    setDays((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort()));
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError('Ponle un nombre a tu hábito.');
      return;
    }
    const { frequency, error: freqError } = buildFrequency({ freqType, days, timesPerWeek });
    if (freqError) {
      setError(freqError);
      return;
    }
    onSubmit({ name: name.trim(), identity: identity.trim(), icon, color, frequency, startDate });
  }

  const fieldStyle = { border: `1px solid ${theme.border}`, background: theme.surface, color: theme.ink };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm block mb-1" style={{ color: theme.ink }}>¿Qué hábito quieres incorporar?</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Meditar 10 minutos"
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={fieldStyle}
        />
      </div>

      <div>
        <label className="text-sm block mb-1" style={{ color: theme.ink }}>
          ¿En quién te convierte? <span style={{ color: theme.inkMuted }}>(opcional)</span>
        </label>
        <input
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          placeholder="Soy alguien que medita"
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={fieldStyle}
        />
      </div>

      <IconPicker value={icon} onChange={setIcon} accentColor={color} />
      <ColorPicker value={color} onChange={setColor} />
      <FrequencyPicker
        freqType={freqType}
        onFreqTypeChange={setFreqType}
        days={days}
        onToggleDay={toggleDay}
        timesPerWeek={timesPerWeek}
        onTimesPerWeekChange={setTimesPerWeek}
        accentColor={color}
      />

      <div>
        <label className="text-sm block mb-1" style={{ color: theme.ink }}>Fecha de inicio</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={fieldStyle}
        />
      </div>

      {error && <p className="text-sm" style={{ color: DANGER }}>{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 rounded-full py-2 text-sm font-medium"
          style={{ background: theme.ink, color: theme.onInk }}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2 text-sm"
          style={{ border: `1px solid ${theme.border}`, color: theme.ink }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
