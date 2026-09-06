import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Modal } from '../common/Modal';
import { EmojiPicker } from '../common/EmojiPicker';
import {
  GOAL_CATEGORIES,
  getCategoryById,
  suggestedMeasureType,
  makeChecklistItem,
} from '../../domain/goal';
import {
  ChevronRight, ChevronLeft, Plus, X,
  Wallet, BarChart3, PenLine, ListChecks,
} from 'lucide-react';

const MEASURE_TYPES = [
  { id: 'financial',  icon: Wallet,     label: 'Vincular a cuenta',  desc: 'Progreso = balance de la cuenta' },
  { id: 'habit',      icon: BarChart3,  label: 'Vincular a hábitos', desc: 'Progreso = completación de hábitos' },
  { id: 'manual',     icon: PenLine,    label: 'Seguimiento manual', desc: 'Tú actualizas el progreso' },
  { id: 'checklist',  icon: ListChecks, label: 'Lista de pasos',     desc: 'Sub-metas como checklist' },
];

const TIMEFRAMES = [
  { id: 'short',  label: 'Corto', desc: '< 1 mes' },
  { id: 'medium', label: 'Mediano', desc: '1-6 meses' },
  { id: 'long',   label: 'Largo', desc: '> 6 meses' },
];

export function GoalFormModal({ onClose, onSubmit, accounts, habits }) {
  const theme = useTheme();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');

  // Step 2 state
  const [measureType, setMeasureType] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetUnit, setTargetUnit] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [linkedHabits, setLinkedHabits] = useState([]); // [{ habitId, weight }]
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [timeframe, setTimeframe] = useState('medium');
  const [deadline, setDeadline] = useState('');

  function handleCategorySelect(catId) {
    setCategory(catId);
    const cat = getCategoryById(catId);
    if (!icon) setIcon(cat.emoji);
    // Pre-select suggested measure type
    setMeasureType(suggestedMeasureType(catId));
  }

  function handleToggleHabit(habitId) {
    setLinkedHabits(prev => {
      const existing = prev.find(l => l.habitId === habitId);
      if (existing) return prev.filter(l => l.habitId !== habitId);
      return [...prev, { habitId, weight: 1 }];
    });
  }

  function handleHabitWeight(habitId, weight) {
    setLinkedHabits(prev =>
      prev.map(l => l.habitId === habitId ? { ...l, weight: Math.max(1, Math.min(10, Number(weight) || 1)) } : l)
    );
  }

  function handleAddChecklistItem() {
    if (!newChecklistText.trim()) return;
    setChecklistItems(prev => [...prev, makeChecklistItem(newChecklistText.trim())]);
    setNewChecklistText('');
  }

  function handleRemoveChecklistItem(itemId) {
    setChecklistItems(prev => prev.filter(i => i.id !== itemId));
  }

  function handleSubmit() {
    onSubmit({
      name,
      icon: icon || getCategoryById(category).emoji,
      category,
      description,
      deadline: deadline ? new Date(deadline).getTime() : null,
      timeframe,
      measureType,
      targetAmount: targetAmount || null,
      targetUnit: measureType === 'financial' ? '$' : targetUnit,
      linkedAccountId: measureType === 'financial' ? linkedAccountId || null : null,
      linkedHabits: measureType === 'habit' ? linkedHabits : [],
      checklistItems: measureType === 'checklist' ? checklistItems : [],
    });
  }

  const canGoToStep2 = name.trim() && category;
  const canSubmit = (() => {
    if (!measureType) return false;
    if (measureType === 'financial' && !targetAmount) return false;
    if (measureType === 'manual' && !targetAmount) return false;
    if (measureType === 'habit' && linkedHabits.length === 0) return false;
    if (measureType === 'checklist' && checklistItems.length === 0) return false;
    return true;
  })();

  const inputStyle = {
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    color: theme.ink,
  };

  return (
    <Modal onClose={onClose}>
      {/* Header with step indicator */}
      <div className="flex items-center justify-between mb-6">
        <h3 style={{ fontFamily: 'Fraunces, serif', color: theme.ink }} className="text-xl font-bold">
          Nuevo objetivo
        </h3>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-1.5 rounded-full transition-all"
            style={{ background: step >= 1 ? theme.ink : theme.border }}
          />
          <div
            className="w-8 h-1.5 rounded-full transition-all"
            style={{ background: step >= 2 ? theme.ink : theme.border }}
          />
        </div>
      </div>

      {/* ═══════════════ STEP 1 ═══════════════ */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <p style={{ color: theme.inkMuted }} className="text-sm -mt-2">¿Qué quieres lograr?</p>

          {/* Name */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Nombre del objetivo</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Ahorrar para vacaciones, Leer 12 libros..."
              className="w-full p-3 rounded-xl text-sm"
              style={inputStyle}
            />
          </div>

          {/* Category grid */}
          <div>
            <label className="text-xs mb-2 block" style={{ color: theme.inkMuted }}>Categoría</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {GOAL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all"
                  style={{
                    background: category === cat.id ? `${cat.color}15` : theme.surfaceAlt,
                    border: `1.5px solid ${category === cat.id ? cat.color : theme.border}`,
                    color: category === cat.id ? cat.color : theme.inkMuted,
                  }}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-[10px] font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon + Description row */}
          <div className="grid grid-cols-[80px_1fr] gap-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Icono</label>
              <EmojiPicker value={icon} onChange={setIcon} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Descripción (opcional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="¿Por qué es importante para ti?"
                rows={2}
                className="w-full p-3 rounded-xl text-sm resize-none"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm" style={{ color: theme.inkMuted }}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canGoToStep2}
              className="px-5 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 transition-opacity"
              style={{
                background: theme.ink,
                color: theme.pageBg,
                opacity: canGoToStep2 ? 1 : 0.4,
              }}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP 2 ═══════════════ */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <p style={{ color: theme.inkMuted }} className="text-sm -mt-2">¿Cómo lo vas a medir?</p>

          {/* Measure type cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {MEASURE_TYPES.map(mt => {
              const Icon = mt.icon;
              const isSelected = measureType === mt.id;
              const catColor = getCategoryById(category).color;
              return (
                <button
                  key={mt.id}
                  type="button"
                  onClick={() => setMeasureType(mt.id)}
                  className="flex flex-col items-start gap-1.5 p-3 rounded-xl transition-all text-left"
                  style={{
                    background: isSelected ? `${catColor}15` : theme.surfaceAlt,
                    border: `1.5px solid ${isSelected ? catColor : theme.border}`,
                  }}
                >
                  <Icon size={18} style={{ color: isSelected ? catColor : theme.inkMuted }} />
                  <span className="text-xs font-semibold" style={{ color: isSelected ? theme.ink : theme.inkMuted }}>
                    {mt.label}
                  </span>
                  <span className="text-[10px]" style={{ color: theme.inkFaint }}>{mt.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic fields based on measureType */}
          <div className="flex flex-col gap-4">

            {/* ── Financial fields ── */}
            {measureType === 'financial' && (
              <>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Meta ($)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    placeholder="Ej: 500000"
                    className="w-full p-3 rounded-xl text-sm"
                    style={inputStyle}
                  />
                </div>
                {accounts.length > 0 && (
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Vincular a cuenta (opcional)</label>
                    <select
                      value={linkedAccountId}
                      onChange={e => setLinkedAccountId(e.target.value)}
                      className="w-full p-3 rounded-xl text-sm"
                      style={inputStyle}
                    >
                      <option value="">— Progreso manual —</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* ── Habit fields ── */}
            {measureType === 'habit' && (
              <div>
                <label className="text-xs mb-2 block" style={{ color: theme.inkMuted }}>
                  Selecciona hábitos y asigna peso (importancia)
                </label>
                {habits.length === 0 ? (
                  <div className="p-4 rounded-xl text-center" style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}` }}>
                    <p style={{ color: theme.inkMuted }} className="text-xs">
                      No tienes hábitos creados. Crea hábitos en la sección "Jardín" primero.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {habits.map(habit => {
                      const linked = linkedHabits.find(l => l.habitId === habit.id);
                      const isLinked = !!linked;
                      return (
                        <div
                          key={habit.id}
                          className="flex items-center gap-3 p-3 rounded-xl transition-all"
                          style={{
                            background: isLinked ? `${habit.color}10` : theme.surfaceAlt,
                            border: `1.5px solid ${isLinked ? habit.color : theme.border}`,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleHabit(habit.id)}
                            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              background: isLinked ? habit.color : 'transparent',
                              border: `2px solid ${isLinked ? habit.color : theme.border}`,
                              color: '#fff',
                              fontSize: '11px',
                            }}
                          >
                            {isLinked && '✓'}
                          </button>
                          <span className="text-sm flex-shrink-0">{habit.icon}</span>
                          <span className="text-sm flex-1 truncate" style={{ color: theme.ink }}>{habit.name}</span>

                          {isLinked && (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-[10px]" style={{ color: theme.inkMuted }}>Peso:</span>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={linked.weight}
                                onChange={e => handleHabitWeight(habit.id, e.target.value)}
                                className="w-12 p-1 rounded-lg text-center text-xs"
                                style={inputStyle}
                                onClick={e => e.stopPropagation()}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {linkedHabits.length > 0 && (
                  <p className="text-[10px] mt-2" style={{ color: theme.inkFaint }}>
                    Peso mayor = más importancia en el progreso. Ej: Peso 3 cuenta el triple que peso 1.
                  </p>
                )}
              </div>
            )}

            {/* ── Manual fields ── */}
            {measureType === 'manual' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Meta (cantidad)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    placeholder="Ej: 30"
                    className="w-full p-3 rounded-xl text-sm"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Unidad</label>
                  <input
                    value={targetUnit}
                    onChange={e => setTargetUnit(e.target.value)}
                    placeholder="Ej: páginas, km, horas"
                    className="w-full p-3 rounded-xl text-sm"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* ── Checklist fields ── */}
            {measureType === 'checklist' && (
              <div>
                <label className="text-xs mb-2 block" style={{ color: theme.inkMuted }}>Pasos / Sub-metas</label>

                {checklistItems.length > 0 && (
                  <div className="flex flex-col gap-1.5 mb-3 max-h-40 overflow-y-auto">
                    {checklistItems.map((item, i) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2.5 rounded-xl"
                        style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}` }}
                      >
                        <span className="text-xs font-medium w-5 text-center" style={{ color: theme.inkFaint }}>{i + 1}</span>
                        <span className="text-sm flex-1" style={{ color: theme.ink }}>{item.text}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          style={{ color: theme.inkFaint }}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    value={newChecklistText}
                    onChange={e => setNewChecklistText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistItem(); } }}
                    placeholder="Agregar paso..."
                    className="flex-1 p-2.5 rounded-xl text-sm"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 rounded-xl transition-opacity"
                    style={{
                      background: theme.surfaceAlt,
                      border: `1px solid ${theme.border}`,
                      color: theme.ink,
                      opacity: newChecklistText.trim() ? 1 : 0.4,
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Timeframe + Deadline ── */}
          {measureType && (
            <div>
              <label className="text-xs mb-2 block" style={{ color: theme.inkMuted }}>Plazo</label>
              <div className="flex gap-2 mb-3">
                {TIMEFRAMES.map(tf => (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => setTimeframe(tf.id)}
                    className="flex-1 py-2 px-2 rounded-xl text-center transition-all"
                    style={{
                      background: timeframe === tf.id ? theme.ink : theme.surfaceAlt,
                      color: timeframe === tf.id ? theme.pageBg : theme.inkMuted,
                      border: `1px solid ${timeframe === tf.id ? theme.ink : theme.border}`,
                    }}
                  >
                    <div className="text-xs font-semibold">{tf.label}</div>
                    <div className="text-[9px] mt-0.5" style={{ opacity: 0.7 }}>{tf.desc}</div>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: theme.inkMuted }}>Fecha límite (opcional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm"
                  style={inputStyle}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-sm inline-flex items-center gap-1.5"
              style={{ color: theme.inkMuted }}
            >
              <ChevronLeft size={16} /> Atrás
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-opacity"
              style={{
                background: theme.ink,
                color: theme.pageBg,
                opacity: canSubmit ? 1 : 0.4,
              }}
            >
              Crear objetivo
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
