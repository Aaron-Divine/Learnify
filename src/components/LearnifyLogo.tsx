'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

interface LearnifyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  linkToHome?: boolean;
  mode?: 'vector' | 'image';
}

export function LearnifyLogo({
  className = '',
  size = 'md',
  showTagline = true,
  linkToHome = true,
  mode = 'vector',
}: LearnifyLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const dimensions = {
    sm: { width: 120, height: 38, iconSize: 32, textClass: 'text-xl', subClass: 'text-[7.5px]' },
    md: { width: 160, height: 50, iconSize: 42, textClass: 'text-2xl', subClass: 'text-[9px]' },
    lg: { width: 220, height: 68, iconSize: 56, textClass: 'text-3xl', subClass: 'text-[11px]' },
    xl: { width: 290, height: 90, iconSize: 76, textClass: 'text-5xl', subClass: 'text-[13px]' },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {mode === 'image' ? (
        // Sampled Master Image mode: dark logo in dark mode, light logo in light mode
        <div className="relative flex items-center">
          <Image
            src={isDark ? '/logo-dark.png' : '/logo-light.png'}
            alt="Learnify - Online Learning Platform"
            width={dimensions.width}
            height={dimensions.height}
            priority
            className="object-contain h-auto max-h-[64px] transition-opacity duration-300 drop-shadow-sm"
          />
        </div>
      ) : (
        // Ultra-Crisp Precision Vector SVG matching exact brand artwork
        <div className="flex items-center gap-3.5">
          <svg
            width={dimensions.iconSize}
            height={dimensions.iconSize}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_0_14px_rgba(11,185,254,0.35)] shrink-0 transition-transform duration-300 group-hover:scale-105"
          >
            <defs>
              {/* Cyan to Violet to Orange Logo Glow */}
              <linearGradient id="mainBrandGrad" x1="10%" y1="10%" x2="90%" y2="90%">
                <stop offset="0%" stopColor="#13E4FF" />
                <stop offset="45%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#FF8A3D" />
              </linearGradient>

              {/* Cyan Accent Gradient */}
              <linearGradient id="cyanAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#13E4FF" />
                <stop offset="100%" stopColor="#0BB9FE" />
              </linearGradient>

              {/* Violet to Coral Gradient */}
              <linearGradient id="violetOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#FF8A3D" />
              </linearGradient>
            </defs>

            {/* Graduation Cap Diamond */}
            <path
              d="M60 20 L102 38 L60 56 L18 38 Z"
              fill="url(#mainBrandGrad)"
            />

            {/* Cap Underside / Bevel */}
            <path
              d="M34 46 V58 C34 65 46 72 60 72 C74 72 86 65 86 58 V46"
              fill="none"
              stroke="url(#mainBrandGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Cap Tassel (Hanging to the left) */}
            <path
              d="M26 42 C20 48 18 60 16 66"
              fill="none"
              stroke="#13E4FF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="16" cy="68" r="3.5" fill="#13E4FF" />

            {/* Open Book Pages (Base of mark) */}
            <path
              d="M22 75 C38 70 52 78 58 88 C64 78 78 70 94 75 V100 C78 95 64 102 58 108 C52 102 38 95 22 100 Z"
              fill="none"
              stroke="url(#mainBrandGrad)"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            {/* Inner Page Ribs */}
            <path
              d="M32 84 C42 80 50 86 54 94"
              fill="none"
              stroke="#13E4FF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M84 84 C74 80 66 86 62 94"
              fill="none"
              stroke="#FF8A3D"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Tech Pixel Elements (Upper Right) */}
            <rect x="88" y="24" width="7" height="7" rx="1.5" fill="#FFAC42" />
            <rect x="98" y="28" width="8" height="8" rx="2" fill="#FF8A3D" />
            <rect x="92" y="35" width="7" height="7" rx="1.5" fill="#13E4FF" />

            {/* Connected Circuit Line & Nodes */}
            <circle cx="102" cy="48" r="4.5" fill="#FFAC42" />
            <line x1="84" y1="62" x2="98" y2="52" stroke="#FFAC42" strokeWidth="3" strokeLinecap="round" />
            <circle cx="82" cy="64" r="5" fill="#8B5CF6" />
          </svg>

          {/* Typography */}
          <div className="flex flex-col">
            <span className={`font-black tracking-tight leading-none ${dimensions.textClass}`}>
              <span className="text-foreground">Learn</span>
              <span className="text-brand-cyan">ify</span>
            </span>
            {showTagline && (
              <span
                className={`font-bold tracking-[0.22em] uppercase mt-1 leading-none ${dimensions.subClass} text-muted`}
              >
                Online Learning Platform
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-block hover:opacity-95 transition-opacity group">
        {content}
      </Link>
    );
  }

  return content;
}
