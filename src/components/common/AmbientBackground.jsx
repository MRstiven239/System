import { useTheme } from '../../theme/ThemeContext';

export function AmbientBackground() {
  const theme = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '70vw',
          height: '70vw',
          background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 60%)`,
          animation: 'ambientGlow 20s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-20%',
          width: '60vw',
          height: '60vw',
          background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 60%)`,
          animation: 'ambientGlow 25s ease-in-out infinite alternate-reverse',
        }}
      />
    </div>
  );
}
