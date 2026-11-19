'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStudentAuth } from '@/components/StudentAuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LearnifyLogo } from '@/components/LearnifyLogo';
import { User, Mail, Lock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/my-courses';

  const { student, signup, loading: authLoading } = useStudentAuth();
  const [name, setName] = useState('');
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
      const res = await signup(name, email, password);
      if (!res.success) {
        setError(res.error || 'Failed to create account');
      } else {
        router.push(redirectUrl);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-surface-border shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <LearnifyLogo size="md" showTagline={false} linkToHome={false} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
          Create Student Account
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Enroll in world-class courses with multi-currency checkout.
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
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
            />
          </div>
        </div>

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
              placeholder="student@example.com"
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
              minLength={6}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
            />
          </div>
          <p className="text-[11px] text-muted mt-1">Minimum 6 characters</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-surface-border text-xs text-muted">
        Already have an account?{' '}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
          className="font-bold text-brand-cyan hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <Suspense
          fallback={
            <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-surface-border flex items-center justify-center min-h-[320px]">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-cyan" />
            </div>
          }
        >
          <SignupForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
