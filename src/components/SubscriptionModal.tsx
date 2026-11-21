'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from './StudentAuthContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Users,
  Repeat,
  ExternalLink,
  Sparkles,
  Wallet,
  KeyRound,
  Zap,
  CreditCard,
  Building,
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SubscriptionModal({ isOpen, onClose, onSuccess }: SubscriptionModalProps) {
  const router = useRouter();
  const { student, openAuthModal } = useStudentAuth();

  const [paymentMethod, setPaymentMethod] = useState<'veylo' | 'card' | 'bank'>('veylo');
  const [veyloAccountNumber, setVeyloAccountNumber] = useState('');
  const [walletAddressName, setWalletAddressName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const [quoteInfo, setQuoteInfo] = useState<{ rate: number; approxNgn: number }>({
    rate: 1352.93,
    approxNgn: 25705.67,
  });

  const [errorDetails, setErrorDetails] = useState<{
    code?: string;
    message: string;
  } | null>(null);

  const [successData, setSuccessData] = useState<{
    mandate_reference: string;
    amount_usd: number;
    amount_ngn: number;
    exchange_rate: number;
    next_billing_date: string;
    manage_url: string;
  } | null>(null);

  // Fetch live Rafiki quote for $19.00 USD
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchQuote = async () => {
      try {
        const res = await fetch('https://veylo-beta.vercel.app/api/quotes?amount=19&to=USD&from=NGN');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.debitAmount?.amount && data?.estimatedExchangeRate) {
            setQuoteInfo({
              rate: data.estimatedExchangeRate,
              approxNgn: data.debitAmount.amount,
            });
          }
        }
      } catch {}
    };
    fetchQuote();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)} ${raw.slice(3)}`;
    }
    setVeyloAccountNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) {
      openAuthModal('login');
      return;
    }

    setErrorDetails(null);
    setLoading(true);

    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veylo_account_number: veyloAccountNumber,
          wallet_address: walletAddressName.trim(),
          pin,
          price_usd: 19.0,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorDetails({
          code: data.code,
          message: data.error || data.message || 'Payment failed. Please check your credentials.',
        });
        return;
      }

      setSuccessData({
        mandate_reference: data.mandate_reference || 'MAN-LRN-LIVE',
        amount_usd: 19.0,
        amount_ngn: data.debited_amount_ngn || quoteInfo.approxNgn,
        exchange_rate: data.exchange_rate || quoteInfo.rate,
        next_billing_date: data.subscription?.next_billing_date || 'In 30 days',
        manage_url: data.manage_url || 'https://veylo-beta.vercel.app/app/subscriptions',
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorDetails({
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to communicate with checkout service.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border shadow-2xl my-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        {!successData && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-purple/15 text-brand-purple border border-brand-purple/30 flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                Monthly Subscription
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Open Payments Mandate
              </span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Premium Learning Community</h2>
            <p className="text-xs text-muted leading-relaxed">
              Students pay monthly to belong to a private community where they can interact, ask questions, share projects, network and learn together.
            </p>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {successData ? (
          <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-foreground">You&apos;re Officially In!</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Your monthly membership is active. The first month has been debited and your recurring mandate is live on Veylo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-muted border border-surface-border text-left space-y-2 text-xs max-w-md mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-surface-border/60">
                <span className="text-muted">Membership:</span>
                <span className="font-bold text-foreground">Premium Learning Community</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Monthly Price:</span>
                <span className="font-bold text-brand-orange text-sm">$19.00 USD / month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Debited from Veylo:</span>
                <span className="font-bold text-emerald-400">
                  ₦{successData.amount_ngn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NGN
                  <span className="text-[10px] text-muted ml-1 font-normal">
                    (@ ₦{successData.exchange_rate.toFixed(0)}/USD via Rafiki)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Mandate ID:</span>
                <span className="font-mono text-brand-cyan text-[11px]">{successData.mandate_reference}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Next Transfer:</span>
                <span className="font-semibold text-foreground">{successData.next_billing_date}</span>
              </div>
            </div>

            {/* Stop Transfers Notice */}
            <div className="p-3.5 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/25 text-left text-xs max-w-md mx-auto space-y-1">
              <div className="font-bold text-brand-cyan flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                How to stop recurring transfers:
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                You can revoke or stop this mandate at any time directly inside your Veylo wallet under <strong>Subscriptions</strong> or from the Community page here on Learnify.
              </p>
            </div>

            <div className="space-y-2.5 max-w-md mx-auto pt-2">
              <button
                onClick={() => {
                  onClose();
                  router.push('/community');
                }}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-brand-gradient shadow-glow-brand transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Community Hub Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={successData.manage_url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-muted hover:text-foreground bg-surface border border-surface-border transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Manage / View Mandate in Veylo Wallet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          /* SUBSCRIPTION FORM */
          <div className="space-y-5">
            {/* Amount / Plan Summary */}
            <div className="p-4 rounded-2xl bg-surface-muted border border-surface-border space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-muted tracking-wider block">
                    Subscription Fee
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-brand-orange">$19.00</span>
                    <span className="text-xs text-muted font-bold">USD / month</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-muted block uppercase">Billing Cycle</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 inline-block">
                    Auto-Renews Monthly
                  </span>
                </div>
              </div>

              {/* Currency conversion callout */}
              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-xs">
                <span className="text-muted flex items-center gap-1.5 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Veylo Wallet Debit (Rafiki FX):
                </span>
                <span className="font-bold text-emerald-400">
                  ≈ ₦{quoteInfo.approxNgn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NGN
                  <span className="text-[10px] text-muted ml-1 font-normal">
                    (@ ₦{quoteInfo.rate.toFixed(0)}/USD)
                  </span>
                </span>
              </div>
            </div>

            {/* Error banner */}
            {errorDetails && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 space-y-1 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-rose-200">
                      Subscription Setup Failed {errorDetails.code ? `(${errorDetails.code})` : ''}
                    </div>
                    <p className="leading-relaxed">{errorDetails.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT METHOD SELECTOR TABS (MULTIPLE CHOICES FOR VIEWS) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('veylo')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    paymentMethod === 'veylo'
                      ? 'border-brand-cyan bg-brand-cyan/15 text-foreground ring-1 ring-brand-cyan'
                      : 'border-surface-border bg-surface-muted text-muted hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Wallet className="w-4 h-4 text-brand-cyan" />
                    <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-brand-cyan/20 text-brand-cyan">Active</span>
                  </div>
                  <span className="text-xs font-bold block">Veylo Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    paymentMethod === 'card'
                      ? 'border-brand-cyan bg-brand-cyan/15 text-foreground ring-1 ring-brand-cyan'
                      : 'border-surface-border bg-surface-muted text-muted hover:border-slate-500'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold block">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    paymentMethod === 'bank'
                      ? 'border-brand-cyan bg-brand-cyan/15 text-foreground ring-1 ring-brand-cyan'
                      : 'border-surface-border bg-surface-muted text-muted hover:border-slate-500'
                  }`}
                >
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold block">Bank Wire</span>
                </button>
              </div>
            </div>

            {/* NON-VEYLO METHODS */}
            {paymentMethod === 'card' && (
              <div className="p-3.5 rounded-2xl bg-surface-muted border border-surface-border text-xs text-muted space-y-2">
                <p>Card recurring billing is offline. Please select <strong>Veylo Wallet</strong> for instant mandate authorization.</p>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('veylo')}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-brand-cyan text-brand-navy"
                >
                  Select Veylo Wallet
                </button>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="p-3.5 rounded-2xl bg-surface-muted border border-surface-border text-xs text-muted space-y-2">
                <p>Standing bank orders take 3 business days to activate. Select <strong>Veylo Wallet</strong> for instant mandate activation.</p>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('veylo')}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-brand-cyan text-brand-navy"
                >
                  Select Veylo Wallet
                </button>
              </div>
            )}

            {/* FORM (VEYLO) */}
            {paymentMethod === 'veylo' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Number */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-foreground">
                      Veylo Account Number
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setVeyloAccountNumber('212 778 2677');
                        setWalletAddressName('$ilp-veylowallet-divine');
                        setPin('1234');
                      }}
                      className="text-[10px] font-mono font-semibold text-brand-cyan hover:underline transition-colors cursor-pointer"
                    >
                      Demo Wallet Auto-Fill
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={veyloAccountNumber}
                      onChange={handleAccountNumberChange}
                      placeholder="e.g. 212 778 2677"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-2xl bg-surface border border-surface-border text-foreground font-mono text-base tracking-wider placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted bg-surface-muted px-2 py-0.5 rounded border border-surface-border">
                      10 digits
                    </span>
                  </div>
                </div>

                {/* Wallet Address Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Wallet Address Name (Confirm User)
                  </label>
                  <input
                    type="text"
                    value={walletAddressName}
                    onChange={(e) => setWalletAddressName(e.target.value)}
                    placeholder="e.g. $ilp-veylowallet-divine or divine"
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-2xl bg-surface border border-surface-border text-foreground font-mono text-xs placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                  />
                </div>

                {/* Secret PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    4-Digit Secret PIN
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-2xl bg-surface border border-surface-border text-foreground font-mono text-lg tracking-widest placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                  />
                </div>

                {/* Stop Transfers Guarantee */}
                <div className="p-3 rounded-xl bg-surface-muted/70 border border-surface-border text-[11px] text-muted flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>Pause Mandate:</strong> You can pause this mandate anytime in your Veylo wallet under Subscriptions. When paused, automatic debits will decline until you press resume.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || veyloAccountNumber.replace(/\s+/g, '').length !== 10 || pin.length !== 4}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Authorizing Open Payments Mandate...</span>
                    </>
                  ) : (
                  <>
                    <span>Authorize & Subscribe ($19.00/mo)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
