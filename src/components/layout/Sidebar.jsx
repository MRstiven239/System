import { useTheme } from '../../theme/ThemeContext';
import { Home, Sprout, Wallet, Target, BookOpen, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'garden', label: 'Jardín', icon: Sprout },
  { id: 'money', label: 'Dinero', icon: Wallet },
  { id: 'goals', label: 'Objetivos', icon: Target },
  { id: 'reflections', label: 'Reflexión', icon: BookOpen },
];

export function Sidebar({ activeSection, onSectionChange }) {
  const theme = useTheme();

  const getStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    background: isActive ? theme.accentMuted : 'transparent',
    color: isActive ? theme.accent : theme.inkMuted,
    fontWeight: isActive ? 600 : 500,
    transition: 'all var(--transition-fast)',
    fontSize: '14px',
  });

  return (
    <aside
      className="hidden md:flex flex-col justify-between"
      style={{
        width: '240px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: theme.surface,
        borderRight: `1px solid ${theme.border}`,
        padding: '24px 16px',
        zIndex: 10,
      }}
    >
      <div>
        <h1 
          style={{ fontFamily: 'Fraunces, serif', color: theme.ink }} 
          className="text-2xl font-semibold tracking-tight px-4 mb-8"
        >
          Mi Vida
        </h1>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              style={getStyle(activeSection === item.id)}
              className="hover:bg-opacity-80"
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = theme.surfaceHover;
                  e.currentTarget.style.color = theme.ink;
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = theme.inkMuted;
                }
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
        <button
          onClick={() => onSectionChange('settings')}
          style={getStyle(activeSection === 'settings')}
          onMouseEnter={(e) => {
            if (activeSection !== 'settings') {
              e.currentTarget.style.background = theme.surfaceHover;
              e.currentTarget.style.color = theme.ink;
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== 'settings') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.inkMuted;
            }
          }}
        >
          <Settings size={20} />
          <span>Configuración</span>
        </button>
      </div>
    </aside>
  );
}
