'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LearnifyLogo } from './LearnifyLogo';
import { ThemeToggle } from './ThemeToggle';
import { useStudentAuth } from './StudentAuthContext';
import { Search, Globe, BookOpen, User, LogOut, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function Navbar({ onSearch, searchQuery = '' }: NavbarProps) {
  const router = useRouter();
  const { student, logout, openAuthModal } = useStudentAuth();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearch);
    } else {
      router.push(`/?q=${encodeURIComponent(localSearch)}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <LearnifyLogo size="md" />
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={localSearch}
                onChange={handleChange}
                placeholder="Search courses, technologies, topics..."
                className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-cyan/60 bg-surface border border-surface-border text-foreground placeholder:text-muted"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </form>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Multi-currency badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
              <Globe className="w-3.5 h-3.5" />
              <span>Multi-Currency</span>
            </div>

            {/* Student Account Status */}
            {student ? (
              <div className="flex items-center gap-2">
                {/* My Courses Link */}
                <Link
                  href="/my-courses"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-cyan/15 text-brand-cyan hover:bg-brand-cyan/25 border border-brand-cyan/30 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>My Courses</span>
                </Link>

                {/* Student Avatar / Name */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-muted border border-surface-border text-xs">
                  <div className="w-6 h-6 rounded-full bg-brand-gradient text-white flex items-center justify-center font-bold text-[10px]">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-foreground max-w-[120px] truncate">
                    {student.name.split(' ')[0]}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-2 rounded-xl text-muted hover:text-rose-400 hover:bg-rose-500/10 border border-surface-border transition-colors text-xs"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-surface-muted transition-colors border border-surface-border"
                >
                  <LogIn className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-sm transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Dark/Light Mode Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={localSearch}
              onChange={handleChange}
              placeholder="Search courses..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-cyan/60 bg-surface border border-surface-border text-foreground placeholder:text-muted"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </form>
        </div>
      </div>
    </header>
  );
}
