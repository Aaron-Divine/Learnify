'use client';

import React, { useState, useEffect } from 'react';
import { Course } from '@/types';
import { useStudentAuth } from './StudentAuthContext';
import { formatPrice } from '@/lib/currencies';
import {
  X,
  CreditCard,
  Lock,
  KeyRound,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Zap,
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

  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [pin, setPin] = useState('');
  const [expiry, setExpiry] = useState('');
  const [showExpiryField] = useState(true);

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

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 19);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    setExpiry(raw);
  };

  const fillTestPreset = (preset: 'success' | 'invalid_card' | 'incorrect_pin' | 'insufficient_funds' | 'server_error') => {
    setErrorDetails(null);
    setExpiry('12/28');
    switch (preset) {
      case 'success':        setCardNumber('4111 2222 3333 4444'); setCvv('123'); setPin('1234'); break;
      case 'invalid_card':   setCardNumber('4000 0000 0000 0000'); setCvv('999'); setPin('1234'); break;
      case 'incorrect_pin':  setCardNumber('4111 2222 3333 4444'); setCvv('123'); setPin('9999'); break;
      case 'insufficient_funds': setCardNumber('4111 2222 3333 4002'); setCvv('123'); setPin('1234'); break;
      case 'server_error':   setCardNumber('4111 2222 3333 5000'); setCvv('123'); setPin('1234'); break;
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
          card_number: cardNumber,
          cvv,
          pin,
          expiry: showExpiryField ? expiry : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorDetails({
          code: data.code,
          message: data.error || data.message || 'Payment was declined by the wallet app.',
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
                {isMockMode ? 'Dev Mock Mode' : 'Live Wallet API'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Enroll in {course.title}</h2>
            <p className="text-xs text-muted">
              {isMockMode
                ? 'Using mock wallet provider. No real money will be charged.'
                : 'Enter your wallet-issued card details. Your account will be debited in real time via the Interledger wallet.'}
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
                  : 'Your wallet was debited and the payment confirmed. The course video is now unlocked.'}
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
                  Live Payment — Real Wallet Debit
                </div>
                <p className="text-muted leading-relaxed">
                  Enter the card number, CVV, and PIN issued by your Interledger wallet app.
                  Your wallet balance will be debited immediately upon confirmation.
                  Funds are transferred to the instructor's wallet via Interledger.
                </p>
              </div>
            )}

            {/* Dev mock test bar */}
            {isMockMode && (
              <div className="p-3.5 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 text-xs space-y-2">
                <div className="flex items-center justify-between text-brand-cyan font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    Dev Mode — Mock Wallet
                  </span>
                  <span className="text-[10px] text-muted">Click to auto-fill</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: '✓ Success', preset: 'success' as const, cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30' },
                    { label: 'Invalid Card', preset: 'invalid_card' as const, cls: 'bg-surface-muted text-foreground border-surface-border hover:bg-surface-border' },
                    { label: 'Wrong PIN', preset: 'incorrect_pin' as const, cls: 'bg-surface-muted text-foreground border-surface-border hover:bg-surface-border' },
                    { label: 'No Funds', preset: 'insufficient_funds' as const, cls: 'bg-surface-muted text-foreground border-surface-border hover:bg-surface-border' },
                    { label: 'Server Error', preset: 'server_error' as const, cls: 'bg-surface-muted text-foreground border-surface-border hover:bg-surface-border' },
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
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Wallet Card Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input type="text" required value={cardNumber} onChange={handleCardChange}
                    placeholder="4111 2222 3333 4444" maxLength={23}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-brand-cyan/60" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">CVV</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input type="password" required value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123" maxLength={4}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-brand-cyan/60" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Card PIN</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input type="password" required value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••" maxLength={6}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-brand-cyan/60" />
                  </div>
                </div>

                {showExpiryField && (
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Expiry (MM/YY)</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input type="text" value={expiry} onChange={handleExpiryChange}
                        placeholder="12/28" maxLength={5}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-brand-cyan/60" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-1 text-[11px] text-muted flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Card data is never stored. Processed securely in memory only.</span>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 px-6 rounded-2xl font-black text-base text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60">
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Contacting Wallet Provider...</span>
                  </>
                ) : (
                  <>
                    <span>Pay {formatPrice(course.price, course.currency_code)}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
