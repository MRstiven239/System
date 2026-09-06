import { useState, useRef } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { SectionHeader } from '../layout/SectionHeader';
import { ThemePicker } from '../theme-picker/ThemePicker';
import { exportAllData, importAllData } from '../../storage/indexedDBAdapter';

export function SettingsView({ themeKey, setThemeKey }) {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [backupStatus, setBackupStatus] = useState(null); // { type: 'success'|'error', msg }

  // ── Export ──────────────────────────────────────────────────────
  async function handleExport() {
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `habit-garden-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupStatus({ type: 'success', msg: '✅ Respaldo descargado correctamente.' });
    } catch {
      setBackupStatus({ type: 'error', msg: '❌ Error al exportar los datos.' });
    }
  }

  // ── Import ──────────────────────────────────────────────────────
  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error('Invalid format');
      }

      await importAllData(data);
      setBackupStatus({ type: 'success', msg: '✅ Datos restaurados. Recarga la página para ver los cambios.' });
    } catch {
      setBackupStatus({ type: 'error', msg: '❌ El archivo no es un respaldo válido.' });
    }

    // Reset file input so the same file can be re-selected.
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const btnStyle = {
    padding: '10px 20px',
    borderRadius: 10,
    border: `1.5px solid ${theme.border}`,
    background: theme.cardBg,
    color: theme.ink,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: 'background 0.2s, transform 0.15s',
  };

  return (
    <div>
      <SectionHeader title="Configuración" />

      <div className="flex flex-col gap-8">
        {/* ── Apariencia ──────────────────────────────── */}
        <section>
          <h3 style={{ color: theme.ink }} className="text-sm font-semibold mb-4">Apariencia</h3>
          <ThemePicker activeThemeKey={themeKey} onSelect={setThemeKey} />
        </section>

        {/* ── Respaldo de datos ────────────────────────── */}
        <section>
          <h3 style={{ color: theme.ink }} className="text-sm font-semibold mb-4">Respaldo de datos</h3>
          <p style={{ color: theme.inkMuted }} className="text-sm mb-4">
            Descarga una copia de seguridad de todos tus datos o restaura una copia anterior.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              style={btnStyle}
              onClick={handleExport}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              📥 Descargar respaldo
            </button>

            <button
              style={btnStyle}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              📤 Restaurar respaldo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>

          {backupStatus && (
            <p
              className="text-sm mt-3"
              style={{
                color: backupStatus.type === 'success' ? theme.success || '#22c55e' : '#ef4444',
              }}
            >
              {backupStatus.msg}
            </p>
          )}
        </section>

        {/* ── Acerca de ───────────────────────────────── */}
        <section>
          <h3 style={{ color: theme.ink }} className="text-sm font-semibold mb-4">Acerca de</h3>
          <p style={{ color: theme.inkMuted }} className="text-sm">
            Esta es una aplicación personal 100% offline. Tus datos se guardan localmente en IndexedDB dentro de tu navegador.
          </p>
        </section>
      </div>
    </div>
  );
}

