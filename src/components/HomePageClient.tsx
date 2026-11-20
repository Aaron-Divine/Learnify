'use client';

import React, { useState, useMemo } from 'react';
import { Course } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CourseCard } from '@/components/CourseCard';
import { CommunitySection } from '@/components/CommunitySection';
import { LearnifyLogo } from '@/components/LearnifyLogo';
import { Search, Sparkles, BookOpen, Video, ShieldCheck, Filter, Globe2 } from 'lucide-react';

interface HomePageClientProps {
  initialCourses: Course[];
}

export function HomePageClient({ initialCourses }: HomePageClientProps) {
  const [courses] = useState<Course[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');

  // Filter courses based on search query and currency filter
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        !searchQuery.trim() ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCurrency =
        selectedCurrency === 'ALL' || course.currency_code === selectedCurrency;

      return matchesSearch && matchesCurrency;
    });
  }, [courses, searchQuery, selectedCurrency]);

  // Available currencies for filter pills
  const filterCurrencies = ['ALL', 'USD', 'EUR', 'GBP', 'CAD', 'SGD', 'MXN', 'COP', 'ZAR', 'PKR', 'PEB', 'EGG'];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <Navbar onSearch={(q) => setSearchQuery(q)} searchQuery={searchQuery} />

      <main className="flex-1">
        {/* Hero Section with Glowing Brand Gradient */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-surface-border">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-brand-glow opacity-80 pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
              {/* Brand Hero Emblem */}
              <div className="mb-1 py-2">
                <LearnifyLogo size="xl" showTagline={true} linkToHome={false} />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange-bright" />
                <span>Next-Generation Multi-Currency Learning</span>
              </div>

              {/* Tagline / Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                Master High-Impact Skills with{' '}
                <span className="text-brand-gradient">Learnify</span>
              </h1>

              <p className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
                Explore premium online courses with crystal-clear video streaming and native pricing.
                Pay in your local currency—from Naira to Dollars, Pounds, Rupees, and Cedis—with
                zero conversion surprises.
              </p>

              {/* Hero Search Bar */}
              <div className="w-full max-w-2xl mt-4">
                <div className="relative flex items-center shadow-lg rounded-2xl glass-panel p-2 border border-surface-border">
                  <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by course title, keywords, or skills..."
                    className="w-full px-4 py-3 bg-transparent text-sm sm:text-base font-medium focus:outline-none text-foreground placeholder:text-muted"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-muted hover:text-foreground px-3 py-1 mr-2 rounded-lg bg-surface-muted"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => {}}
                    className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-gradient hover:bg-brand-gradient-hover transition-all shadow-glow-cyan/30"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Key Trust Metrics */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 text-muted">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
                  <Globe2 className="w-4 h-4 text-brand-cyan" />
                  <span>11 Supported Currencies</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
                  <Video className="w-4 h-4 text-brand-purple" />
                  <span>HD Video Streaming</span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
                  <ShieldCheck className="w-4 h-4 text-brand-orange" />
                  <span>Direct Creator Pricing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Catalog Section */}
        <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-surface-border">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Featured Courses
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Browse our comprehensive catalog of verified professional courses
              </p>
            </div>

            {/* Currency Filter Chips */}
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-xs font-semibold text-muted mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Currency:
              </span>
              {filterCurrencies.map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedCurrency === curr
                      ? 'bg-brand-cyan text-brand-navy shadow-sm'
                      : 'bg-surface-muted text-foreground hover:bg-surface-border border border-surface-border'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count & Active Filter Indicator */}
          <div className="flex items-center justify-between py-4 text-xs text-muted">
            <span>
              Showing <strong className="text-foreground">{filteredCourses.length}</strong> {filteredCourses.length === 1 ? 'course' : 'courses'}
              {selectedCurrency !== 'ALL' && ` in ${selectedCurrency}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            {(selectedCurrency !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCurrency('ALL');
                  setSearchQuery('');
                }}
                className="text-brand-cyan hover:underline font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="py-20 text-center glass-panel rounded-3xl max-w-lg mx-auto p-8 my-8 border border-surface-border">
              <div className="w-16 h-16 rounded-full bg-brand-cyan/10 text-brand-cyan mx-auto flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No courses found</h3>
              <p className="text-xs sm:text-sm text-muted mt-2 max-w-sm mx-auto">
                We couldn't find any courses matching your search query or selected currency.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCurrency('ALL');
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-cyan text-brand-navy shadow-sm hover:opacity-95"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Premium Learning Community Subscription Section */}
        <CommunitySection />

        {/* UDemy-style Platform Trust Banner */}
        <section className="py-16 bg-surface-muted/50 border-t border-b border-surface-border mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center shrink-0">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">True Multi-Currency Pricing</h4>
                  <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                    Instructors set their exact course fee in their native world currency. No automatic conversions or unexpected fee fluctuations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/15 text-brand-purple flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">Cloud-Powered HD Video</h4>
                  <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                    Enjoy crisp video playback across devices. Showcase thumbnails and custom players deliver a seamless viewing experience.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-orange/15 text-brand-orange flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">Phase 1 Architecture</h4>
                  <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                    Built cleanly with Next.js and modular design. Payment infrastructure and multi-instructor support can easily hook in for Phase 2.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
