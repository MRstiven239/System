import { useTheme } from '../../theme/ThemeContext';
import { createPortal } from 'react-dom';

export function Modal({ onClose, children }) {
  const theme = useTheme();

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto p-4 sm:p-6 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="w-full max-w-md rounded-2xl p-6 overflow-hidden animate-scale-in my-8"
          style={{ 
            background: theme.surface, 
            border: `1px solid ${theme.border}`,
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
