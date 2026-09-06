import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Search, X } from 'lucide-react';

const EMOJI_DATA = {
  'Frecuentes': ['🎯', '💰', '💪', '📚', '🧘', '💼', '❤️', '⭐', '🔥', '🚀', '🏆', '💡', '🎓', '🏠', '🎨', '🎵'],
  'Finanzas': ['💰', '💵', '💳', '🏦', '📈', '📊', '💎', '🪙', '🤑', '💸', '🏧', '💹'],
  'Actividad': ['💪', '🏋️', '🏃', '🚴', '🧗', '⚽', '🏊', '🧘', '🥊', '🎾', '🏄', '🚶'],
  'Comida': ['🥗', '🍎', '🥦', '💧', '🍳', '🥤', '🫖', '🥑', '🍇', '🥕', '🫐', '🍌'],
  'Estudio': ['📚', '📖', '✏️', '🎓', '💻', '🔬', '📝', '🧠', '📐', '🗂️', '📓', '🎯'],
  'Personas': ['👨‍👩‍👧‍👦', '❤️', '🤝', '👥', '💬', '🫂', '👶', '💑', '🧑‍🤝‍🧑', '😊', '🥰', '👋'],
  'Trabajo': ['💼', '📋', '🖥️', '📞', '🗓️', '📌', '🏢', '✅', '📈', '🎯', '💡', '🔧'],
  'Bienestar': ['🧘', '🌿', '☀️', '🌊', '🕊️', '🫧', '🌸', '🦋', '🌈', '😌', '🧖', '💤'],
  'Naturaleza': ['🌱', '🌻', '🍀', '🌲', '🌺', '🪴', '🌾', '🍃', '🌵', '🌷', '🪻', '🌼'],
  'Objetos': ['🏆', '⭐', '🔑', '📱', '🎧', '📷', '✈️', '🚗', '🏠', '🎁', '🛒', '⏰'],
};

export function EmojiPicker({ value, onChange }) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Frecuentes');
  const pickerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const tabs = Object.keys(EMOJI_DATA);

  // Filter emojis if searching
  const displayEmojis = search
    ? Object.values(EMOJI_DATA).flat().filter((e, i, arr) => arr.indexOf(e) === i) // dedupe
    : EMOJI_DATA[activeTab] || [];

  return (
    <div ref={pickerRef} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-xl flex items-center justify-center text-2xl transition-all"
        style={{
          background: theme.surfaceAlt,
          border: `1px solid ${isOpen ? theme.ink : theme.border}`,
          cursor: 'pointer',
          minHeight: '48px',
        }}
      >
        {value || '🎯'}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 rounded-2xl overflow-hidden animate-scale-in"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
            width: '280px',
            right: 0,
          }}
        >
          {/* Search bar */}
          <div className="p-2 pb-0">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}` }}
            >
              <Search size={14} style={{ color: theme.inkMuted }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar emoji..."
                className="bg-transparent border-none outline-none text-xs flex-1"
                style={{ color: theme.ink }}
                autoFocus
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X size={12} style={{ color: theme.inkMuted }} />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          {!search && (
            <div
              className="flex gap-0.5 px-2 pt-2 pb-1 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {tabs.map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="px-2 py-1 rounded-lg text-[10px] whitespace-nowrap transition-all"
                  style={{
                    background: activeTab === tab ? theme.surfaceAlt : 'transparent',
                    color: activeTab === tab ? theme.ink : theme.inkMuted,
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Emoji grid */}
          <div
            className="p-2"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px' }}>
              {displayEmojis.map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  type="button"
                  onClick={() => {
                    onChange(emoji);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full aspect-square rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110"
                  style={{
                    background: value === emoji ? theme.surfaceAlt : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {displayEmojis.length === 0 && (
              <p className="text-center text-xs py-4" style={{ color: theme.inkMuted }}>
                No se encontraron emojis
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
