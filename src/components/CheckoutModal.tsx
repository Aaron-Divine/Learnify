'use client';

import React, { useState, useEffect } from 'react';
import { Course } from '@/types';
import { useStudentAuth } from './StudentAuthContext';
import { formatPrice } from '@/lib/currencies';
import {
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Zap,
  Wallet,
} from 'lucide-react';

interface CheckoutModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export function CheckoutModal({
  course,
  isOpen,
  onClose,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const { student, openAuthModal } = useStudentAuth();

  const [veyloAccountNumber, setVeyloAccountNumber] = useState('');
  const [pin, setPin] = useState('');

  // Dynamically detect mock vs live mode from backend
  const [isMockMode, setIsMockMode] = useState(true);
  useEffect(() => {
    fetch('/api/checkout/mode')
      .then((r) => r.json())
      .then((d) => setIsMockMode(d.mock === true))
      .catch(() => setIsMockMode(true));
  }, []);

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    transaction_id: string;
    reference: string;
    amount: number;
    currency: string;
  } | null>(null);

  const [errorDetails, setErrorDetails] = useState<{
    code?: string;
    message: string;
    remainingAttempts?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits and spaces, max 10 digits
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    // Format as "XXX XXX XXXX"
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)} ${raw.slice(3)}`;
    }
    setVeyloAccountNumber(formatted);
  };

  const fillTestPreset = (preset: 'success' | 'account_not_found' | 'incorrect_pin' | 'insufficient_funds') => {
    setErrorDetails(null);
    switch (preset) {
      case 'success':
        setVeyloAccountNumber('482 193 7604');
        setPin('1234');
        break;
      case 'account_not_found':
        setVeyloAccountNumber('999 999 9999');
        setPin('0000');
        break;
      case 'incorrect_pin':
        setVeyloAccountNumber('482 193 7604');
        setPin('9999');
        break;
      case 'insufficient_funds':
        setVeyloAccountNumber('111 111 1111');
        setPin('1234');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) { openAuthModal('login'); return; }

    setErrorDetails(null);
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: course.id,
          veylo_account_number: veyloAccountNumber,
          pin,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorDetails({
          code: data.code,
          message: data.error || data.message || 'Payment was declined by the Veylo wallet.',
          remainingAttempts: data.remainingAttempts,
        });
        return;
      }

      setSuccessData({
        transaction_id: data.transaction_id,
        reference: data.reference,
        amount: data.amount || course.price,
        currency: data.currency || course.currency_code,
      });

      onPaymentSuccess();
    } catch (err: any) {
      setErrorDetails({
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to communicate with the checkout service.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border shadow-2xl my-8 space-y-6">

        {/* Close */}
        <button onClick={onClose} disabled={loading}
          className="absolute top-5 right-5 p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-muted transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        {!successData && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                Secure Merchant Checkout
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isMockMode ? 'Dev Mock Mode' : 'Live Veylo API'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Pay with Veylo Wallet</h2>
            <p className="text-xs text-muted">
              {isMockMode
                ? 'Using mock Veylo provider. No real money will be charged.'
                : 'Enter your Veylo account credentials. Your wallet balance will be debited in real time.'}
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {successData ? (
          <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground">Payment Successful!</h3>
              <p className="text-sm text-muted max-w-md mx-auto">
                {isMockMode
                  ? 'Mock payment confirmed. The course video has been unlocked for your account.'
                  : 'Your Veylo wallet was debited and the payment confirmed. The course video is now unlocked.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-muted border border-surface-border text-left space-y-2.5 text-xs max-w-md mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-surface-border/60">
                <span className="text-muted">Course:</span>
                <span className="font-bold text-foreground truncate max-w-[240px]">{course.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Amount Paid:</span>
                <span className="font-bold text-brand-orange text-sm">{formatPrice(successData.amount, successData.currency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Transaction ID:</span>
                <span className="font-mono text-brand-cyan text-[11px]">{successData.transaction_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Reference:</span>
                <span className="font-mono text-muted text-[11px]">{successData.reference}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-surface-border/60">
                <span className="text-muted">Account:</span>
                <span className="font-semibold text-foreground">{student?.email}</span>
              </div>
            </div>

            <button onClick={onClose}
              className="w-full max-w-md py-4 px-8 rounded-2xl font-black text-base text-white bg-brand-gradient shadow-glow-brand transition-all flex items-center justify-center gap-2 mx-auto">
              <span>Watch Course Video Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="space-y-5">

            {/* Amount summary */}
            <div className="p-4 rounded-2xl bg-surface-muted border border-surface-border flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-muted tracking-wider block">Total Due</span>
                <span className="text-2xl font-black text-brand-orange">{formatPrice(course.price, course.currency_code)}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-muted block">Currency</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-surface border border-surface-border text-foreground">
                  {course.currency_code}
                </span>
              </div>
            </div>

            {/* Error */}
            {errorDetails && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 space-y-1 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-rose-200">
                      Payment Failed {errorDetails.code ? `(${errorDetails.code})` : ''}
                    </div>
                    <p className="leading-relaxed">{errorDetails.message}</p>
                    {errorDetails.remainingAttempts !== undefined && (
                      <p className="text-[11px] text-rose-300/80">
                        Remaining attempts before lockout: <strong>{errorDetails.remainingAttempts}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Live wallet notice */}
            {!isMockMode && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <Zap className="w-3.5 h-3.5" />
                  Live Payment — Real Veylo Wallet Debit
                </div>
                <p className="text-muted leading-relaxed">
                  Enter your Veylo account number and PIN.
                  Your Veylo wallet balance will be debited immediately upon confirmation.
                </p>
              </div>
            )}

            {/* Dev mock test bar */}
            {isMockMode && (
              <div className="p-3.5 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 text-xs space-y-2">
                <div className="flex items-center justify-between text-brand-cyan font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    Dev Mode — Mock Veylo Wallet
                  </span>
                  <span className="text-[10px] text-muted">Click to auto-fill</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: '✓ Sufficient Funds', preset: 'success' as const, cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30' },
                    { label: 'Account Not Found', preset: 'account_not_found' as const, cls: 'bg-surface-muted text-foreground border-surface-border hover:bg-surface-border' },
                    { label: 'Wrong PIN', preset: 'incorrect_pin' as const, cls: 'bg-surface-muted text-foreground border-surface-border hover:bg-surface-border' },
                    { label: 'No Funds', preset: 'insufficient_funds' as const, cls: 'bg-surface-muted text-foreground border-surface-border hover:bg-surface-border' },
                  ].map(({ label, preset, cls }) => (
                    <button key={preset} type="button" onClick={() => fillTestPreset(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${cls}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Veylo Account Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Veylo Account Number
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    required
                    value={veyloAccountNumber}
                    onChange={handleAccountNumberChange}
                    placeholder="e.g. 482 193 7604"
                    maxLength={12}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted">10-digit Veylo account number</p>
              </div>

              {/* Veylo PIN */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Veylo PIN
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="4-6 digit PIN"
                    maxLength={6}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                  />
                </div>
              </div>

              <div className="pt-1 text-[11px] text-muted flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Credentials are never stored. Processed securely in memory only.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl font-black text-base text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Contacting Veylo Wallet...</span>
                  </>
                ) : (
                  <>
                    <span>Pay {formatPrice(course.price, course.currency_code)}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Powered by Veylo badge */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Lock className="w-3 h-3" style={{ color: '#1A73E8' }} />
                <span className="text-[11px] font-semibold" style={{ color: '#1A73E8' }}>
                  Powered by Veylo
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
