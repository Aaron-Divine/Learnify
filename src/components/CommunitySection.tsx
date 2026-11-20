'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStudentAuth } from './StudentAuthContext';
import { SubscriptionModal } from './SubscriptionModal';
import {
  Users,
  MessageSquare,
  Sparkles,
  Share2,
  CheckCircle,
  ShieldCheck,
  Repeat,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export function CommunitySection() {
  const { student, openAuthModal } = useStudentAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  // Check subscription status
  useEffect(() => {
    if (!student) {
      setIsSubscribed(false);
      return;
    }
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/subscription/status');
        if (res.ok) {
          const data = await res.json();
          setIsSubscribed(data.active);
          setSubscriptionData(data.subscription);
        }
      } catch {}
    };
    checkStatus();
  }, [student]);

  const handleJoinClick = () => {
    if (!student) {
      openAuthModal('signup');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <section className="relative overflow-hidden py-16 lg:py-24 border-t border-b border-surface-border bg-surface-muted/30">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-80 bg-brand-glow opacity-60 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Pitch & Features */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-purple/15 text-brand-purple border border-brand-purple/30">
              <Users className="w-3.5 h-3.5" />
              <span>Monthly Student Membership</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
              Premium Learning <span className="text-brand-gradient">Community</span>
            </h2>

            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-xl">
              Students pay monthly to belong to a private community where they can interact, ask questions, share projects, network and learn together.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <div className="w-7 h-7 rounded-lg bg-brand-cyan/15 text-brand-cyan flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>Interactive Q&A & Mentorship</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Ask technical questions, get debugging help, and chat directly with course mentors.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <div className="w-7 h-7 rounded-lg bg-brand-orange/15 text-brand-orange flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span>Project Sharing & Feedback</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Post your repos, showcase your web apps, and receive constructive peer code reviews.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <div className="w-7 h-7 rounded-lg bg-brand-purple/15 text-brand-purple flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Global Peer Networking</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Collaborate in study groups, participate in hackathons, and discover co-founders.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Stop Transfers Anytime</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Powered by Open Payments mandates. You can revoke or stop transfers directly in your Veylo wallet.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Subscription Card */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border shadow-2xl relative space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-muted uppercase tracking-wider block">
                    Community Pass
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-black text-brand-orange">$19</span>
                    <span className="text-sm font-bold text-muted">.00 / month</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  Monthly Mandate
                </span>
              </div>

              {/* Rafiki Currency preview */}
              <div className="p-3.5 rounded-2xl bg-surface-muted border border-surface-border text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted flex items-center gap-1 font-medium">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Veylo Debit (Rafiki FX):
                  </span>
                  <span className="font-bold text-emerald-400">≈ ₦25,705.67 NGN</span>
                </div>
                <p className="text-[10px] text-muted">
                  Auto-renews monthly via Interledger Open Payments. No credit card required.
                </p>
              </div>

              {/* Benefits list */}
              <ul className="space-y-2.5 text-xs text-foreground font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full access to private student Discord & Forums</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Weekly live Q&A sessions with senior engineers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Peer review channels & project showcase gallery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Exclusive job opportunities & freelance board</span>
                </li>
              </ul>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {isSubscribed ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Membership Active
                      </span>
                      <span className="text-[11px] font-mono text-emerald-300/80">
                        {subscriptionData?.mandate_reference || 'MAN-LRN-LIVE'}
                      </span>
                    </div>

                    <Link
                      href="/community"
                      className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2"
                    >
                      <span>Enter Community Hub</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <a
                      href="https://veylo-beta.vercel.app/app/subscriptions"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-muted hover:text-foreground bg-surface border border-surface-border transition-colors flex items-center justify-center gap-1.5 text-center"
                    >
                      <span>Manage / Stop Transfers in Veylo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleJoinClick}
                      className="w-full py-4 px-6 rounded-2xl font-black text-sm text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-brand-orange-bright" />
                      <span>Join Community ($19/mo)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <Link
                      href="/community"
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-muted hover:text-foreground bg-surface border border-surface-border transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Learn How Subscriptions & Stopping Transfers Work</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsSubscribed(true);
        }}
      />
    </section>
  );
}
