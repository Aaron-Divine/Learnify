'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { useStudentAuth } from '@/components/StudentAuthContext';
import { formatPrice, CURRENCY_MAP } from '@/lib/currencies';
import {
  Play,
  Pause,
  Lock,
  ArrowLeft,
  Clock,
  Globe2,
  ShieldCheck,
  CheckCircle,
  Share2,
  Sparkles,
  CreditCard,
  RotateCcw,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';

interface CourseDetailsClientProps {
  course: Course;
  initialHasAccess?: boolean;
}

export function CourseDetailsClient({
  course,
  initialHasAccess = false,
}: CourseDetailsClientProps) {
  const { student, openAuthModal } = useStudentAuth();

  const [hasAccess, setHasAccess] = useState(initialHasAccess);
  const [videoUrl, setVideoUrl] = useState(course.video_url || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const currency = CURRENCY_MAP[course.currency_code] || {
    flag: '🌐',
    code: course.currency_code,
    name: course.currency_code,
    symbol: course.currency_code,
  };

  const formattedDate = new Date(course.created_at).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Verify access whenever student session changes
  const checkAccess = async () => {
    try {
      const res = await fetch(`/api/courses/${course.id}/access`);
      const data = await res.json();
      if (res.ok && data.unlocked && data.video_url) {
        setHasAccess(true);
        setVideoUrl(data.video_url);
      } else {
        setHasAccess(false);
        setVideoUrl('');
      }
    } catch {
      // Retain existing state on failure
    }
  };

  useEffect(() => {
    // Only fetch if initial access was not already granted from server
    if (!initialHasAccess) {
      checkAccess();
    }
  }, [student, course.id, initialHasAccess]);

  // Handle Play Overlay Click
  const handlePreviewClick = () => {
    if (hasAccess) {
      setIsPlaying(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch((e) => {
            console.warn('Autoplay prevented by browser:', e);
          });
        }
      }, 100);
    } else {
      // Trigger checkout or login
      if (!student) {
        openAuthModal('login');
      } else {
        setShowCheckoutModal(true);
      }
    }
  };

  // Fast forward / rewind
  const handleRewind = (seconds = 10) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - seconds);
    }
  };

  const handleFastForward = (seconds = 10) => {
    if (videoRef.current) {
      const total = videoRef.current.duration || 0;
      videoRef.current.currentTime = Math.min(total, videoRef.current.currentTime + seconds);
    }
  };

  const handleSeek = (timeInSeconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration || 0, timeInSeconds));
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Callback on successful payment
  const handlePaymentSuccess = async () => {
    await checkAccess();
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-6 mb-2 border-b border-surface-border">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted hover:text-brand-cyan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-muted hover:bg-surface-border text-foreground transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Course'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-6">
          {/* Main Course Content (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* VIDEO PLAYER AREA */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-panel border border-surface-border shadow-2xl bg-black">
              {!isPlaying || !hasAccess ? (
                // Pre-Playback Showcase View
                <div
                  className="relative w-full h-full group cursor-pointer"
                  onClick={handlePreviewClick}
                >
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized={
                        course.thumbnail_url.startsWith('/uploads') ||
                        course.thumbnail_url.startsWith('http')
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-navy-card flex items-center justify-center">
                      <span className="text-muted text-sm">Course Preview</span>
                    </div>
                  )}

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/50 group-hover:bg-black/30 transition-colors" />

                  {/* Centered Overlay (Play if Unlocked, Lock if Locked) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    {hasAccess ? (
                      // Unlocked Play Overlay
                      <>
                        <div className="relative">
                          <div className="absolute -inset-3 rounded-full bg-brand-cyan/30 animate-ping opacity-75" />
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-glow-brand transform group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1 text-white" />
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase drop-shadow-md bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                          Watch Course Video
                        </span>
                      </>
                    ) : (
                      // Locked Overlay
                      <>
                        <div className="relative">
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface-muted/90 text-brand-orange border border-brand-orange/40 backdrop-blur-md flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                            <Lock className="w-8 h-8 sm:w-9 sm:h-9" />
                          </div>
                        </div>
                        <div className="text-center space-y-1">
                          <span className="text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow-md bg-black/70 px-4 py-1.5 rounded-full backdrop-blur-sm border border-brand-orange/40 inline-flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-brand-orange" />
                            Enroll to Unlock Video
                          </span>
                          <p className="text-[11px] text-slate-300 drop-shadow">
                            Click to buy with your wallet card
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Top Access Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    {hasAccess ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/80 backdrop-blur-md text-white border border-emerald-400/40 flex items-center gap-1.5 shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Enrolled & Unlocked
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/70 backdrop-blur-md text-brand-orange border border-brand-orange/30 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Locked Video
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                // Active Video Player with standard HTML5 controls
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                    onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            {/* Quick Navigation & Minute Jump Bar (Available when Unlocked) */}
            {hasAccess && (
              <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-surface-border space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlayPause}
                      className="px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-border text-foreground font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRewind(10)}
                      className="px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-border text-foreground font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      title="Rewind 10 seconds"
                    >
                      <RotateCcw className="w-4 h-4 text-brand-cyan" />
                      <span>-10s</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFastForward(10)}
                      className="px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface-border text-foreground font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      title="Fast forward 10 seconds"
                    >
                      <RotateCw className="w-4 h-4 text-brand-cyan" />
                      <span>+10s</span>
                    </button>
                  </div>

                  <div className="text-xs font-mono font-bold text-muted">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Minute Chapters / Jump-to-Minute Pills */}
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-muted uppercase block mb-2">
                    Jump to Minute:
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {Array.from({ length: Math.max(1, Math.ceil(duration > 0 ? duration / 60 : 10)) }, (_, idx) => idx).slice(0, 15).map((minute) => {
                      const targetSeconds = minute * 60;
                      const isCurrentMinute = Math.floor(currentTime / 60) === minute;
                      return (
                        <button
                          key={minute}
                          type="button"
                          onClick={() => {
                            if (!isPlaying) setIsPlaying(true);
                            handleSeek(targetSeconds);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                            isCurrentMinute
                              ? 'bg-brand-cyan text-slate-900 font-bold shadow-sm'
                              : 'bg-surface-muted hover:bg-brand-cyan/20 text-muted hover:text-brand-cyan border border-surface-border'
                          }`}
                        >
                          {minute}:00
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Course Header & Information */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                  <Globe2 className="w-3.5 h-3.5" />
                  {currency.flag} {course.currency_code} - {currency.name}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-muted text-muted border border-surface-border">
                  <Clock className="w-3.5 h-3.5" />
                  Added {formattedDate}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
                {course.title}
              </h1>

              {/* Full Course Description / Summary */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border space-y-4 mt-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-cyan" />
                  Course Overview & Description
                </h2>
                <div className="text-sm sm:text-base text-foreground/90 whitespace-pre-line leading-relaxed">
                  {course.summary}
                </div>
              </div>

              {/* What You'll Learn / Syllabus Highlights */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border space-y-4">
                <h3 className="text-base font-bold text-foreground">
                  What this course includes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-muted">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>Full HD video streaming content</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>Lifetime on-demand access</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>Direct wallet checkout with card details</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>Certificate of completion upon request</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Purchase & Enrollment Box (Right Column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xl space-y-6">
              <div>
                <span className="text-xs uppercase font-bold text-muted tracking-wider block">
                  Course Tuition ({course.currency_code})
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-black text-brand-orange">
                    {formatPrice(course.price, course.currency_code)}
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-2 leading-relaxed">
                  Billed in <strong>{currency.name} ({course.currency_code})</strong> directly to your wallet card. Zero currency conversion fees.
                </p>
              </div>

              {/* ACTION BUTTON (Buy Now or Watch) */}
              <div className="space-y-3 pt-2">
                {hasAccess ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-4 px-6 rounded-2xl font-black text-base text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Watch Unlocked Video</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!student) {
                        openAuthModal('login');
                      } else {
                        setShowCheckoutModal(true);
                      }
                    }}
                    className="w-full py-4 px-6 rounded-2xl font-black text-base text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Buy Now & Unlock Video</span>
                  </button>
                )}

                <p className="text-center text-[11px] text-muted flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Secure checkout verified by external Wallet API</span>
                </p>
              </div>

              {/* Course Features Quick List */}
              <div className="border-t border-surface-border pt-6 space-y-3 text-xs text-muted">
                <div className="flex items-center justify-between">
                  <span>Currency:</span>
                  <strong className="text-foreground font-mono">{course.currency_code} ({currency.flag})</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Access:</span>
                  <span className="text-foreground font-medium">Lifetime On-Demand</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Video Quality:</span>
                  <span className="text-foreground font-medium">HD 1080p Stream</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security:</span>
                  <span className="text-foreground font-medium">Encrypted In-Memory</span>
                </div>
              </div>

              {/* Share Action */}
              <div className="border-t border-surface-border pt-4 flex items-center justify-between">
                <button
                  onClick={handleShare}
                  className="text-xs font-semibold text-brand-cyan hover:underline inline-flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? '✓ Copied course link' : 'Share with friends'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Real / Mock Checkout Modal */}
      <CheckoutModal
        course={course}
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Footer />
    </div>
  );
}
