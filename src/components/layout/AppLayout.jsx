import { useTheme } from '../../theme/ThemeContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function AppLayout({ activeSection, onSectionChange, children }) {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.pageBg }}>
      <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />
      
      <main 
        style={{ 
          flex: 1, 
          maxWidth: '100vw', 
          paddingBottom: '80px', // espacio para bottom nav en movil
        }}
        className="md:pb-0"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full animate-fade-in-up">
          {children}
        </div>
      </main>

      <BottomNav activeSection={activeSection} onSectionChange={onSectionChange} />
    </div>
  );
}
