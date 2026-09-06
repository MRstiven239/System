import { useTheme } from '../../theme/ThemeContext';
import { Home, Sprout, Wallet, Target, BookOpen, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'garden', label: 'Jardín', icon: Sprout },
  { id: 'money', label: 'Dinero', icon: Wallet },
  { id: 'goals', label: 'Objetivos', icon: Target },
  { id: 'reflections', label: 'Reflexión', icon: BookOpen },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

export function BottomNav({ activeSection, onSectionChange }) {
  const theme = useTheme();

  return (
    <nav
      className="md:hidden flex justify-around items-center"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: theme.surface,
        borderTop: `1px solid ${theme.border}`,
        padding: '8px 4px calc(8px + env(safe-area-inset-bottom)) 4px',
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              border: 'none',
              background: 'transparent',
              color: isActive ? theme.accent : theme.inkMuted,
              padding: '6px 4px',
              flex: 1,
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
            }}
          >
            <div 
              style={{ 
                padding: '4px 10px',
                borderRadius: '16px',
                background: isActive ? theme.accentMuted : 'transparent',
                transition: 'background var(--transition-fast)',
              }}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: '9px', fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
