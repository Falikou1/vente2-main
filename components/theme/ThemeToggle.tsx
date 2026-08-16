'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'pill' | 'switch';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'icon',
  showLabel = false,
}) => {
  const { isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center p-1 bg-surface-container-high rounded-full border border-outline-variant/40 shadow-inner ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-label="Mode Clair"
          title="Mode Clair (Éclairé)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
            !isDark
              ? 'bg-surface text-primary shadow-sm ring-1 ring-black/5'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] text-amber-500">light_mode</span>
          <span className="hidden sm:inline">Clair</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-label="Mode Sombre"
          title="Mode Sombre"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
            isDark
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] text-primary-fixed">dark_mode</span>
          <span className="hidden sm:inline">Sombre</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Activer le Mode Clair' : 'Activer le Mode Sombre'}
      className={`relative flex items-center justify-center gap-2 p-2.5 rounded-full transition-all duration-300 cursor-pointer border border-outline-variant/30 ${
        isDark
          ? 'bg-surface-container-high text-amber-300 hover:bg-surface-container-highest hover:text-amber-200 ring-1 ring-amber-400/20'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
      } ${className}`}
    >
      <span className="material-symbols-outlined text-[20px] transition-transform duration-300 hover:rotate-45 select-none">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      {showLabel && (
        <span className="text-xs font-bold select-none">
          {isDark ? 'Mode clair' : 'Mode sombre'}
        </span>
      )}
    </button>
  );
};
