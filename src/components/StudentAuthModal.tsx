'use client';

import React, { useState } from 'react';
import { useStudentAuth } from './StudentAuthContext';
import { LearnifyLogo } from './LearnifyLogo';
import { X, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export function StudentAuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, login, signup, openAuthModal } = useStudentAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid credentials');
        } else {
          setEmail('');
          setPassword('');
        }
      } else {
        const res = await signup(name, email, password);
        if (!res.success) {
          setError(res.error || 'Registration failed');
        } else {
          setName('');
          setEmail('');
          setPassword('');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoStudent = () => {
    setEmail('student@learnify.com');
    setPassword('student123!');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border shadow-2xl space-y-6">
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <LearnifyLogo size="md" showTagline={false} linkToHome={false} />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground">
            {isLogin ? 'Welcome Back, Learner!' : 'Create Your Student Account'}
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            {isLogin
              ? 'Log in to access your purchased courses and checkout faster.'
              : 'Sign up to enroll in courses and stream HD video content.'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
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
          )}

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
            {!isLogin && (
              <p className="text-[11px] text-muted mt-1">Must be at least 6 characters</p>
            )}
          </div>

          {/* Quick Demo Student Fill Button for testing */}
          {isLogin && (
            <div className="p-3 rounded-xl bg-surface-muted border border-surface-border flex items-center justify-between text-[11px]">
              <div>
                <span className="font-semibold text-foreground">Demo Student:</span>{' '}
                <span className="text-muted">student@learnify.com</span>
              </div>
              <button
                type="button"
                onClick={fillDemoStudent}
                className="font-bold text-brand-cyan hover:underline"
              >
                Auto-Fill
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Sign In as Student' : 'Create Student Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="text-center pt-2 border-t border-surface-border/60 text-xs text-muted">
          {isLogin ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal('signup');
                }}
                className="font-bold text-brand-cyan hover:underline"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal('login');
                }}
                className="font-bold text-brand-cyan hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
