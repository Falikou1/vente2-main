'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className={`relative flex items-center justify-center gap-2 p-2 rounded-full transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-surface-container-high text-amber-300 hover:bg-surface-container-highest hover:text-amber-200'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
      } ${className}`}
    >
      <span className="material-symbols-outlined text-[20px] transition-transform duration-300 hover:rotate-12 select-none">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      {showLabel && (
        <span className="text-xs font-semibold select-none">
          {isDark ? 'Mode clair' : 'Mode sombre'}
        </span>
      )}
    </button>
  );
};
