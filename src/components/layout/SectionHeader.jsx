import { useTheme } from '../../theme/ThemeContext';

export function SectionHeader({ title, subtitle }) {
  const theme = useTheme();

  return (
    <header className="mb-8 animate-fade-in-up">
      <h2
        style={{
          fontFamily: 'Fraunces, serif',
          color: theme.ink,
          fontSize: '32px',
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: theme.inkMuted, fontSize: '14px', marginTop: '8px' }}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
