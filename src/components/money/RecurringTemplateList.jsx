import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { formatCOP } from '../../domain/budget';

export function RecurringTemplateList({ templates, onRegister, onEdit, onDelete, onCreate }) {
  const theme = useTheme();

  return (
    <div className="mt-8 animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ color: theme.ink }} className="text-lg font-semibold">Fijos mensuales</h3>
        <button 
          onClick={onCreate}
          style={{ background: theme.surfaceAlt, color: theme.ink }}
          className="text-xs px-3 py-1.5 rounded-full hover:bg-opacity-80 transition-colors"
        >
          + Agregar fijo
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map(t => (
          <div 
            key={t.id}
            className="p-4 rounded-2xl relative group transition-transform"
            style={{ 
              background: theme.surface, 
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
              <button 
                onClick={() => onEdit(t)} 
                className="text-xs hover:scale-110 transition-transform"
                title="Editar"
              >
                ✏️
              </button>
              <button 
                onClick={() => { if(window.confirm('¿Eliminar fijo mensual?')) onDelete(t.id); }} 
                className="text-xs hover:scale-110 transition-transform"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>

            <div className="text-2xl mb-2">{t.icon}</div>
            <div style={{ color: theme.ink }} className="font-semibold text-sm truncate pr-12">{t.name}</div>
            <div style={{ color: t.type === 'income' ? theme.income : theme.inkMuted }} className="text-sm font-medium mt-1">
              {formatCOP(t.amount)}
            </div>
            {t.dayOfMonth && (
              <div style={{ color: theme.inkFaint }} className="text-xs mt-2">
                Día {t.dayOfMonth}
              </div>
            )}
            
            <button 
              onClick={() => onRegister(t)}
              style={{ background: theme.ink, color: theme.pageBg }}
              className="mt-4 w-full py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Registrar →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
