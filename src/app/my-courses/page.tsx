'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Course } from '@/types';
import { useStudentAuth } from '@/components/StudentAuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { formatPrice } from '@/lib/currencies';
import {
  BookOpen,
  PlayCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogIn,
} from 'lucide-react';

export default function MyCoursesPage() {
  const router = useRouter();
  const { student, loading: authLoading, openAuthModal } = useStudentAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnrolledCourses() {
      if (!student) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch('/api/student/courses');
        const data = await res.json();
        if (data.courses) {
          setCourses(data.courses);
        }
      } catch (err) {
        console.error('Failed to load student courses:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadEnrolledCourses();
    }
  }, [student, authLoading]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-cyan" />
        </main>
        <Footer />
      </div>
    );
  }

  // Unauthenticated visitor view
  if (!student) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 py-16">
          <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-surface-border shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-cyan/15 text-brand-cyan mx-auto flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">
                Sign In to View Your Courses
              </h2>
              <p className="text-xs sm:text-sm text-muted">
                Please log in with your student account to access your enrolled courses and streaming library.
              </p>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In as Student</span>
            </button>
            <p className="text-xs text-muted">
              Don't have an account?{' '}
              <button
                onClick={() => openAuthModal('signup')}
                className="font-bold text-brand-cyan hover:underline"
              >
                Create one now
              </button>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Learning Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                My Enrolled Courses
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                Welcome back, <strong className="text-foreground">{student.name}</strong>. You have lifetime access to your enrolled courses below.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-surface-muted hover:bg-surface-border border border-surface-border text-foreground transition-all shrink-0 self-start sm:self-auto"
            >
              <span>Explore More Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Courses Section */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl glass-panel p-4 h-80 animate-pulse flex flex-col space-y-4">
                <div className="w-full aspect-video bg-surface-muted rounded-xl" />
                <div className="h-4 bg-surface-muted rounded w-3/4" />
                <div className="h-3 bg-surface-muted rounded w-full" />
                <div className="pt-4 mt-auto flex justify-between items-center">
                  <div className="h-8 bg-surface-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group relative flex flex-col rounded-3xl glass-panel border border-surface-border overflow-hidden hover:border-brand-cyan/40 transition-all duration-300 hover:shadow-glow-cyan/20"
              >
                {/* Thumbnail with Enrolled Overlay */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={
                        course.thumbnail_url.startsWith('/uploads') ||
                        course.thumbnail_url.startsWith('http')
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                      Course Preview
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/80 backdrop-blur-md text-white border border-emerald-400/40 flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3" />
                      Enrolled & Unlocked
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-brand-orange border border-white/10">
                      {formatPrice(course.price, course.currency_code)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col space-y-3">
                  <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug group-hover:text-brand-cyan transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {course.summary}
                  </p>

                  <div className="pt-3 mt-auto border-t border-surface-border flex items-center justify-between">
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-cyan" />
                      Lifetime Access
                    </span>

                    <Link
                      href={`/course/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-sm transition-all"
                    >
                      <PlayCircle className="w-4 h-4 fill-white/20" />
                      <span>Watch Course</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center glass-panel rounded-3xl max-w-lg mx-auto p-8 my-8 border border-surface-border space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-cyan/10 text-brand-cyan mx-auto flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Courses Enrolled Yet</h3>
            <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
              You haven't purchased any courses yet. Browse our multi-currency catalog and unlock your first course today!
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all"
              >
                <span>Browse Course Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
