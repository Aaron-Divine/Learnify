'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStudentAuth } from '@/components/StudentAuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LearnifyLogo } from '@/components/LearnifyLogo';
import { Mail, Lock, ArrowRight, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/my-courses';

  const { student, login, loading: authLoading } = useStudentAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && student) {
      router.push(redirectUrl);
    }
  }, [student, authLoading, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      } else {
        router.push(redirectUrl);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail('student@learnify.com');
    setPassword('student123!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-surface-border shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <LearnifyLogo size="md" showTagline={false} linkToHome={false} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Sign In to Learnify
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Access your enrolled courses and resume video learning.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@learnify.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-muted border border-surface-border flex items-center justify-between text-[11px]">
              <div>
                <span className="font-semibold text-foreground">Test Student:</span>{' '}
                <span className="text-muted">student@learnify.com</span>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="font-bold text-brand-cyan hover:underline"
              >
                Auto-Fill
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-surface-border text-xs text-muted">
            Don't have an account?{' '}
            <Link
              href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
              className="font-bold text-brand-cyan hover:underline"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
