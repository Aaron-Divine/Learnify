'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useStudentAuth } from '@/components/StudentAuthContext';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import {
  Users,
  MessageSquare,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Repeat,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  AlertCircle,
  ThumbsUp,
  MessageCircle,
  PlusCircle,
  Check,
  Play,
  Pause,
  RefreshCw,
  Clock,
  Zap,
} from 'lucide-react';

export default function CommunityPage() {
  const { student, openAuthModal } = useStudentAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'discussions' | 'projects' | 'networking'>('discussions');

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // 30-Second Demo Cycle State
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [autoDebitActive, setAutoDebitActive] = useState(true);
  const [isProcessingDebit, setIsProcessingDebit] = useState(false);
  const [debitLogs, setDebitLogs] = useState<
    Array<{
      id: string;
      time: string;
      status: 'success' | 'blocked' | 'error';
      text: string;
      amount?: string;
    }>
  >([]);
  const [blockedNotice, setBlockedNotice] = useState<string | null>(null);

  // Load subscription status
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/subscription/status');
      if (res.ok) {
        const data = await res.json();
        setIsSubscribed(data.active);
        setSubscriptionData(data.subscription);
      }
    } catch {
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (student) {
      checkStatus();
    } else {
      setIsSubscribed(false);
      setLoadingStatus(false);
    }
  }, [student]);

  const triggerRecurringDebit = async () => {
    if (isProcessingDebit) return;
    setIsProcessingDebit(true);

    try {
      const res = await fetch('/api/subscription/recurring-charge', { method: 'POST' });
      const data = await res.json();
      const now = new Date().toLocaleTimeString();

      if (data.status === 'blocked' || data.code === 'MANDATE_REVOKED') {
        // BLOCKED BY VEYLO!
        setBlockedNotice(
          data.message || 'Recurring transfer was blocked by Veylo because the mandate was revoked.'
        );
        setIsSubscribed(false);
        setAutoDebitActive(false);
        setDebitLogs((prev) => [
          {
            id: `log_${Date.now()}`,
            time: now,
            status: 'blocked',
            text: `BLOCKED BY VEYLO: ${data.message || 'Mandate revoked by user. Automatic debit stopped!'}`,
          },
          ...prev.slice(0, 5),
        ]);
        await checkStatus();
      } else if (data.status === 'success') {
        // SUCCESSFUL RECURRING DEBIT!
        const ngnFormatted = data.debited_amount_ngn
          ? `₦${Number(data.debited_amount_ngn).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} NGN`
          : '₦25,705.67 NGN';

        setDebitLogs((prev) => [
          {
            id: `log_${Date.now()}`,
            time: now,
            status: 'success',
            text: `Billed $19.00 USD (${ngnFormatted} @ ₦${
              data.exchange_rate ? Number(data.exchange_rate).toFixed(0) : '1,353'
            }/USD via Rafiki). Txn: ${data.transaction_id}`,
            amount: ngnFormatted,
          },
          ...prev.slice(0, 5),
        ]);
        setSecondsLeft(30);
      } else {
        setDebitLogs((prev) => [
          {
            id: `log_${Date.now()}`,
            time: now,
            status: 'error',
            text: `Debit failed: ${data.message || data.error}`,
          },
          ...prev.slice(0, 5),
        ]);
        setSecondsLeft(30);
      }
    } catch (err: any) {
      setDebitLogs((prev) => [
        {
          id: `log_${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          status: 'error',
          text: `Network error: ${err.message}`,
        },
        ...prev.slice(0, 5),
      ]);
      setSecondsLeft(30);
    } finally {
      setIsProcessingDebit(false);
    }
  };

  // 30-second recurring timer loop
  useEffect(() => {
    if (!isSubscribed || !autoDebitActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          triggerRecurringDebit();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubscribed, autoDebitActive]);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your community subscription and stop recurring transfers in your Veylo wallet?')) {
      return;
    }
    setIsCancelling(true);
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      if (res.ok) {
        setCancelSuccess(true);
        setIsSubscribed(false);
        setAutoDebitActive(false);
        await checkStatus();
      }
    } catch {
      alert('Failed to cancel subscription.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* HEADER / HERO BANNER */}
        <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-surface-border">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-brand-glow opacity-60 pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-purple/15 text-brand-purple border border-brand-purple/30">
                <Users className="w-3.5 h-3.5" />
                <span>Monthly Student Membership</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
                Premium Learning <span className="text-brand-gradient">Community</span>
              </h1>

              <p className="text-base sm:text-lg text-muted leading-relaxed">
                Students pay monthly to belong to a private community where they can interact, ask questions, share projects, network and learn together.
              </p>
            </div>
          </div>
        </section>

        {/* CANCELLATION SUCCESS NOTIFICATION */}
        {cancelSuccess && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  <strong>Recurring Transfer Stopped:</strong> Your Open Payments mandate has been revoked and recurring monthly transfers have been stopped in your Veylo wallet.
                </span>
              </div>
              <button
                onClick={() => setCancelSuccess(false)}
                className="text-muted hover:text-foreground text-xs px-2 py-1 rounded-lg"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* IF USER HAS ACTIVE MEMBERSHIP: SHOW COMMUNITY HUB */}
        {isSubscribed ? (
          <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Active Membership Status Card */}
            <div className="glass-panel p-6 rounded-3xl border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Member
                  </span>
                  <span className="text-xs text-muted font-mono">
                    Mandate: {subscriptionData?.mandate_reference || 'MAN-LRN-LIVE'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Welcome back, {student?.name || 'Scholar'}!
                </h3>
                <p className="text-xs text-muted">
                  Billed: <strong>$19.00 USD/mo</strong> (≈ ₦{subscriptionData?.amount_ngn?.toLocaleString() || '25,705.67'} NGN) • Next renewal: {subscriptionData?.next_billing_date || 'In 30 days'}
                </p>
              </div>

              {/* Stop Transfers & Management Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="https://veylo-beta.vercel.app/app/subscriptions"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-foreground bg-surface border border-surface-border hover:bg-surface-muted transition-colors flex items-center gap-1.5"
                >
                  <span>Manage in Veylo Wallet</span>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-cyan" />
                </a>

                <button
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                >
                  {isCancelling ? 'Stopping...' : 'Stop Recurring Transfers'}
                </button>
              </div>
            </div>

            {/* BLOCKED NOTICE IF REVOKED IN VEYLO */}
            {blockedNotice && (
              <div className="p-5 rounded-3xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-black text-rose-300 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>Recurring Transfer Blocked by Veylo!</span>
                </div>
                <p className="leading-relaxed">
                  {blockedNotice}
                </p>
                <div className="text-[11px] text-rose-300/80 pt-1">
                  Notice how Open Payments gives the customer 100% control: because the mandate was revoked on Veylo, the merchant cannot debit another penny.
                </div>
              </div>
            )}

            {/* 30-SECOND RECURRING DEBIT DEMO SIMULATOR */}
            <div className="p-6 rounded-3xl bg-surface-muted/80 border border-surface-border shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-orange">
                      Live Interactive Demo
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-foreground mt-0.5">
                    30-Second Recurring Debit Cycle (Interledger Open Payments)
                  </h4>
                  <p className="text-xs text-muted">
                    Every 30 seconds, Learnify requests the monthly $19.00 USD (≈ ₦25,705.67 NGN) subscription deduction under your active mandate.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAutoDebitActive(!autoDebitActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      autoDebitActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-surface text-muted border border-surface-border'
                    }`}
                  >
                    {autoDebitActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{autoDebitActive ? 'Auto-Cycle ON' : 'Paused'}</span>
                  </button>

                  <button
                    onClick={triggerRecurringDebit}
                    disabled={isProcessingDebit}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessingDebit ? 'animate-spin' : ''}`} />
                    <span>{isProcessingDebit ? 'Debiting...' : 'Trigger Debit Now'}</span>
                  </button>
                </div>
              </div>

              {/* Progress countdown bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                    Next automated deduction:
                  </span>
                  <span className="font-mono font-black text-brand-orange text-sm">
                    {autoDebitActive ? `${secondsLeft}s` : 'Paused'}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-border/60 overflow-hidden">
                  <div
                    className="h-full bg-brand-gradient transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${((30 - secondsLeft) / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Test instructions banner */}
              <div className="p-3.5 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-brand-cyan flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand-orange-bright" />
                    Test Stopping Transfers Live:
                  </span>
                  <p className="text-[11px] text-muted">
                    Open <strong className="text-foreground">Veylo Subscriptions</strong>, click <strong className="text-rose-400">&quot;Revoke Mandate&quot;</strong>, then watch this timer hit 0.
                  </p>
                </div>
                <a
                  href="https://veylo-beta.vercel.app/app/subscriptions"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-surface text-brand-cyan border border-brand-cyan/30 hover:bg-surface-muted transition-colors flex items-center gap-1 self-start sm:self-auto shrink-0"
                >
                  <span>Open Veylo Subscriptions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Live Audit Log */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                  Real-Time Interledger Transfer Log
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-xs">
                  {debitLogs.length === 0 ? (
                    <div className="p-3 rounded-xl bg-surface border border-surface-border text-muted text-[11px]">
                      Waiting for next 30-second cycle or click &quot;Trigger Debit Now&quot; to test...
                    </div>
                  ) : (
                    debitLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                          log.status === 'blocked'
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-bold'
                            : log.status === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-surface border-surface-border text-muted'
                        }`}
                      >
                        <span className="text-slate-400 shrink-0">[{log.time}]</span>
                        <span className="leading-relaxed">{log.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Community Tabs */}
            <div className="flex items-center gap-2 border-b border-surface-border pb-3">
              <button
                onClick={() => setActiveTab('discussions')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'discussions'
                    ? 'bg-brand-cyan text-brand-navy shadow-sm'
                    : 'text-muted hover:text-foreground bg-surface-muted'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discussions & Q&A (24)</span>
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'projects'
                    ? 'bg-brand-cyan text-brand-navy shadow-sm'
                    : 'text-muted hover:text-foreground bg-surface-muted'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Project Showcase (12)</span>
              </button>

              <button
                onClick={() => setActiveTab('networking')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'networking'
                    ? 'bg-brand-cyan text-brand-navy shadow-sm'
                    : 'text-muted hover:text-foreground bg-surface-muted'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Study Groups & Networking</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'discussions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-foreground">Recent Mentorship Threads</h4>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Ask a Question</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-surface border border-surface-border hover:border-brand-cyan/40 transition-all space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-gradient text-white flex items-center justify-center font-bold text-[10px]">
                          E
                        </span>
                        <span className="font-semibold text-foreground">Emeka Okafor</span>
                        <span>• 2 hours ago</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-brand-cyan/10 text-brand-cyan font-mono text-[10px]">
                        React 19 & Next.js
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-foreground">
                      How to handle optimistic updates with Interledger stream packets in a web checkout?
                    </h5>
                    <p className="text-xs text-muted leading-relaxed">
                      I&apos;m building a micropayment video player that streams payments every 10 seconds. Anyone have patterns for error retry without double charging the wallet?
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted pt-1">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-brand-orange" /> 14 upvotes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-brand-cyan" /> 8 mentor replies
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-surface-border hover:border-brand-cyan/40 transition-all space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold text-[10px]">
                          F
                        </span>
                        <span className="font-semibold text-foreground">Fatima Bello</span>
                        <span>• Yesterday</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-brand-purple/10 text-brand-purple font-mono text-[10px]">
                        Full-Stack Architecture
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-foreground">
                      Dockerizing the Rafiki connector locally alongside Postgres and TigerBeetle
                    </h5>
                    <p className="text-xs text-muted leading-relaxed">
                      Here is my complete docker-compose.yml for setting up a local testnet peer. Tested on Windows and macOS. Let me know if you run into port binding errors!
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted pt-1">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-brand-orange" /> 29 upvotes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-brand-cyan" /> 15 replies
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                      Open Source Project
                    </span>
                    <span className="text-xs text-muted font-mono">github.com/aaron/learnify</span>
                  </div>
                  <h5 className="font-bold text-base text-foreground">Learnify E-Learning Hub</h5>
                  <p className="text-xs text-muted leading-relaxed">
                    Production e-learning platform with multi-currency creator pricing, HD video streaming, and Veylo in-app wallet integration.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-surface-border/60 text-xs">
                    <span className="text-muted">By Aaron-Divine</span>
                    <span className="font-bold text-brand-cyan">18 Peer Reviews</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                      Payment Rail
                    </span>
                    <span className="text-xs text-muted font-mono">github.com/aaron/veylo</span>
                  </div>
                  <h5 className="font-bold text-base text-foreground">Veylo Payment Identity</h5>
                  <p className="text-xs text-muted leading-relaxed">
                    Cross-border wallet enabling in-app checkout using 10-digit account numbers, 4-digit PINs, and Interledger Rafiki FX quotes.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-surface-border/60 text-xs">
                    <span className="text-muted">By Aaron-Divine</span>
                    <span className="font-bold text-brand-cyan">24 Peer Reviews</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'networking' && (
              <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-4">
                <h4 className="font-bold text-base text-foreground">Active Peer Study Groups</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-muted border border-surface-border space-y-1">
                    <span className="text-xs font-bold text-brand-cyan">Sunday Morning Coding Circle</span>
                    <p className="text-xs text-muted">Weekly LeetCode & Full-Stack code pairing over Google Meet.</p>
                    <span className="text-[10px] text-muted block pt-1">14 Members • Next: Sunday 10:00 AM UTC</span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-muted border border-surface-border space-y-1">
                    <span className="text-xs font-bold text-brand-purple">Open Payments Hackathon Squad</span>
                    <p className="text-xs text-muted">Team building Interledger-powered micro-tipping for writers.</p>
                    <span className="text-[10px] text-muted block pt-1">6 Members • Recruiting 2 frontend devs</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : (
          /* IF NOT SUBSCRIBED: SHOW FULL EXPLANATION & SUBSCRIBE CALLOUT */
          <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* The 4 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl glass-panel border border-surface-border space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-foreground">Interactive Q&A</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Never get stuck. Ask technical questions, share error logs, and get unblocked by mentors and senior peers.
                </p>
              </div>

              <div className="p-6 rounded-3xl glass-panel border border-surface-border space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-orange/15 text-brand-orange flex items-center justify-center">
                  <Share2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-foreground">Project Sharing</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Showcase real projects, get code reviews, and build a portfolio of verified work that employers love.
                </p>
              </div>

              <div className="p-6 rounded-3xl glass-panel border border-surface-border space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/15 text-brand-purple flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-foreground">Peer Networking</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Join study groups, team up for global hackathons, and connect with fellow developers worldwide.
                </p>
              </div>

              <div className="p-6 rounded-3xl glass-panel border border-surface-border space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-foreground">Total Transfer Control</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Stop transfers with 1 click in Learnify or directly inside your Veylo wallet under Subscriptions.
                </p>
              </div>
            </div>

            {/* HOW SUBSCRIPTIONS & STOPPING TRANSFERS WORK (Educational Section) */}
            <div className="p-8 sm:p-10 rounded-3xl bg-surface-muted/60 border border-surface-border space-y-8">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-bold text-brand-cyan tracking-wider uppercase">
                  Transparency First
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                  How Subscriptions & Stopping Transfers Work
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  We believe in 100% transparency. Unlike traditional credit cards that lock you in, Veylo subscriptions are built on open protocols.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h5 className="font-bold text-sm text-foreground">Authorize with Number & PIN</h5>
                  <p className="text-xs text-muted leading-relaxed">
                    You enter your 10-digit Veylo Account Number and 4-digit PIN. Your wallet is debited $19.00 USD (converted to Naira via live Rafiki rates) for the first month.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h5 className="font-bold text-sm text-foreground">Mandate Registered on Veylo</h5>
                  <p className="text-xs text-muted leading-relaxed">
                    An Open Payments recurring mandate is created. It appears immediately in your Veylo wallet under Subscriptions, listing next billing date and exact amount.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h5 className="font-bold text-sm text-foreground">Stop Transfers Instantly</h5>
                  <p className="text-xs text-muted leading-relaxed">
                    Whenever you want to pause or leave, click &quot;Revoke Mandate&quot; in Veylo or &quot;Stop Transfers&quot; in Learnify. Veylo immediately blocks future debits. Zero friction.
                  </p>
                </div>
              </div>
            </div>

            {/* JOIN CTA CARD */}
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-surface-border text-center space-y-6 max-w-3xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-brand-gradient text-white mx-auto flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                  Ready to Accelerate Your Learning?
                </h3>
                <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto leading-relaxed">
                  Join hundreds of students networking, building projects, and receiving direct mentorship every day.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    if (!student) {
                      openAuthModal('signup');
                    } else {
                      setIsModalOpen(true);
                    }
                  }}
                  className="w-full sm:w-auto py-4 px-8 rounded-2xl font-black text-sm text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-brand-orange-bright" />
                  <span>Join Premium Community ($19.00/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-muted">
                Cancel or stop transfers anytime • Converted via Interledger Rafiki FX • No hidden fees
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsSubscribed(true);
          checkStatus();
        }}
      />

      <Footer />
    </div>
  );
}
