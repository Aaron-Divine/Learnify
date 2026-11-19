'use client';

import React from 'react';
import Link from 'next/link';
import { LearnifyLogo } from './LearnifyLogo';
import { CURRENCIES } from '@/lib/currencies';
import { ShieldCheck, Sparkles, Heart } from 'lucide-react';

export function Footer() {
  const availableCurrencies = CURRENCIES;

  return (
    <footer className="border-t border-surface-border bg-surface transition-colors duration-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <LearnifyLogo size="lg" />
            <p className="text-sm text-muted max-w-md leading-relaxed mt-3">
              Learnify is an online learning platform empowering creators and learners
              worldwide. Sell courses in your chosen global currency with zero forced conversion,
              delivering HD streaming and modern video learning.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                <Sparkles className="w-3 h-3" />
                Phase 1: Course Catalog & Admin Studio
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                <ShieldCheck className="w-3 h-3" />
                Direct Currency Pricing
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
              Explore Learnify
            </h3>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-brand-cyan transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <span className="text-muted">
                  Interledger Settlement (Phase 2)
                </span>
              </li>
              <li>
                <span className="text-slate-400 cursor-not-allowed">
                  Payment Checkout (Coming Phase 2)
                </span>
              </li>
              <li>
                <span className="text-slate-400 cursor-not-allowed">
                  Instructor Network (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Supported Currencies */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
              Supported Currencies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {availableCurrencies.map((c) => (
                <span
                  key={c.code}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-surface-muted border border-surface-border text-foreground font-mono font-medium"
                  title={`${c.name} (${c.code})`}
                >
                  <span>{c.flag}</span>
                  <span>{c.code}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-surface-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} Learnify Platform. Built with modern full-stack architecture.</p>
          <div className="flex items-center gap-2">
            <span>Powered by Next.js & Tailwind CSS</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-brand-cyan font-medium">
              Made with <Heart className="w-3.5 h-3.5 fill-brand-orange text-brand-orange inline" /> for Global Learning
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
