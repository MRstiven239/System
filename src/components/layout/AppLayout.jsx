import { useTheme } from '../../theme/ThemeContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Settings, Cloud, CloudOff } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export function AppLayout({ activeSection, onSectionChange, children }) {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.pageBg }}>
      <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />
      
      <main 
        style={{ 
          flex: 1, 
          maxWidth: '100vw', 
          paddingBottom: '80px',
        }}
        className="md:pb-0"
      >
        {/* Mobile top navigation header */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30 backdrop-blur-md"
          style={{
            background: theme.surface + 'dd',
            borderColor: theme.border,
          }}
        >
          <h1
            style={{ fontFamily: 'Fraunces, serif', color: theme.ink }}
            className="text-xl font-semibold tracking-tight"
          >
            Mi Vida
          </h1>

          <button
            onClick={() => onSectionChange('settings')}
            className="p-2 rounded-xl border flex items-center gap-1.5 text-xs font-medium cursor-pointer transition active:scale-95"
            style={{
              background: activeSection === 'settings' ? theme.accentMuted : theme.cardBg,
              borderColor: activeSection === 'settings' ? theme.accent : theme.border,
              color: activeSection === 'settings' ? theme.accent : theme.ink,
            }}
          >
            {user ? (
              <Cloud className="w-4 h-4 text-purple-400" />
            ) : (
              <CloudOff className="w-4 h-4 text-slate-400" />
            )}
            <span>{user ? 'Cuenta' : 'Ingresar'}</span>
          </button>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-12 w-full animate-fade-in-up">
          {children}
        </div>
      </main>

      <BottomNav activeSection={activeSection} onSectionChange={onSectionChange} />
    </div>
  );
}
