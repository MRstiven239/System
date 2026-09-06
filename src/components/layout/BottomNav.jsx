import { useTheme } from '../../theme/ThemeContext';
import { Home, Sprout, Wallet, Target, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'garden', label: 'Jardín', icon: Sprout },
  { id: 'money', label: 'Dinero', icon: Wallet },
  { id: 'goals', label: 'Objetivos', icon: Target },
  { id: 'reflections', label: 'Reflexión', icon: BookOpen },
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
        padding: '12px 8px calc(12px + env(safe-area-inset-bottom)) 8px',
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
              gap: '4px',
              border: 'none',
              background: 'transparent',
              color: isActive ? theme.accent : theme.inkMuted,
              padding: '8px',
              minWidth: '60px',
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
            }}
          >
            <div 
              style={{ 
                padding: '4px 12px',
                borderRadius: '16px',
                background: isActive ? theme.accentMuted : 'transparent',
                transition: 'background var(--transition-fast)',
              }}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
