'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 ${
        theme === 'dark'
          ? 'bg-brand-navy-card/80 border-brand-navy-border text-brand-cyan hover:bg-brand-navy-light hover:shadow-glow-cyan/20'
          : 'bg-white border-slate-200 text-brand-purple hover:bg-slate-50 hover:shadow-sm'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-90 text-brand-orange-bright" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 -rotate-12 hover:rotate-0 text-brand-purple" />
      )}
    </button>
  );
}
