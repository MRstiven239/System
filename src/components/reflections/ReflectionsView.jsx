import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { SectionHeader } from '../layout/SectionHeader';
import { Trash2, Edit2 } from 'lucide-react';

export function ReflectionsView({ reflections, loaded, addReflection, deleteReflection, updateReflection }) {
  const theme = useTheme();
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    addReflection({ content });
    setContent('');
  };

  return (
    <div>
      <SectionHeader 
        title="Reflexión" 
        subtitle="Un espacio para pensar sobre tus días, tus hábitos y tu progreso." 
      />

      <div className="mb-12 animate-fade-in-up">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué hay en tu mente hoy?"
            className="w-full min-h-[160px] p-5 rounded-2xl resize-y transition-colors focus:outline-none"
            style={{ 
              background: theme.surface, 
              border: `1px solid ${theme.border}`,
              color: theme.ink,
              lineHeight: 1.6
            }}
            onFocus={(e) => e.target.style.borderColor = theme.accent}
            onBlur={(e) => e.target.style.borderColor = theme.border}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              type="submit"
              disabled={!content.trim()}
              className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ 
                background: content.trim() ? theme.ink : theme.surfaceAlt, 
                color: content.trim() ? theme.pageBg : theme.inkMuted,
                cursor: content.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Guardar reflexión
            </button>
          </div>
        </form>
      </div>

      {!loaded ? (
        <p style={{ color: theme.inkMuted }} className="text-sm text-center py-16">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-6">
          {reflections.map((r, i) => (
            <div 
              key={r.id} 
              className="p-6 rounded-2xl animate-fade-in-up relative group"
              style={{ 
                background: theme.surfaceAlt, 
                border: `1px solid ${theme.border}`,
                animationDelay: `${i * 100}ms`
              }}
            >
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    const newContent = prompt('Editar reflexión:', r.content);
                    if (newContent !== null && newContent.trim()) {
                      updateReflection(r.id, { content: newContent });
                    }
                  }}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  title="Editar"
                >
                  <Edit2 size={14} style={{ color: theme.inkMuted }} />
                </button>
                <button 
                  onClick={() => { 
                    if (confirm('¿Eliminar esta reflexión?')) deleteReflection(r.id); 
                  }}
                  className="p-1 rounded hover:bg-red-500/10"
                  title="Eliminar"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>

              <div 
                style={{ color: theme.inkMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }} 
                className="mb-3"
              >
                {new Date(r.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <p style={{ color: theme.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }} className="text-sm pr-12">
                {r.content}
              </p>
            </div>
          ))}
          
          {reflections.length === 0 && (
            <p style={{ color: theme.inkMuted }} className="text-sm text-center py-8">
              Aún no has escrito ninguna reflexión. Empieza hoy.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
