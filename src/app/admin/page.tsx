'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Course, CourseFormData, EnrichedPayment } from '@/types';
import { CURRENCIES, CURRENCY_MAP, formatPrice, formatWalletAddress, ILP_TEST_WALLET_PREFIX } from '@/lib/currencies';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import {
  Shield,
  Upload,
  Video,
  Image as ImageIcon,
  DollarSign,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  LogOut,
  Lock,
  Mail,
  Key,
  X,
  Play,
  FileCheck,
  RefreshCw,
  Wallet,
  Coins,
  CreditCard,
  Receipt,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  // Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('admin@learnify.com');
  const [loginPassword, setLoginPassword] = useState('learnify2026!');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'courses' | 'payments'>('courses');

  // Payments State (Phase 2)
  const [payments, setPayments] = useState<EnrichedPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string>('ALL');

  // Courses List
  const [courses, setCourses] = useState<Course[]>([]);
  const [tableLoading, setTableLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [price, setPrice] = useState<string>('');
  const [walletInput, setWalletInput] = useState<string>('');

  // Thumbnail Upload State
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  // Video Upload State
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState('');

  // Edit Course Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editCurrency, setEditCurrency] = useState('USD');
  const [editPrice, setEditPrice] = useState('');
  const [editWalletInput, setEditWalletInput] = useState('');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Course Modal State
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Submitting State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check auth status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data.authenticated && data.user?.role === 'admin') {
          setIsAdmin(true);
          setAdminEmail(data.user.email);
          fetchCourses();
          fetchPayments();
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        setIsAdmin(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch all courses for the management table
  const fetchCourses = async () => {
    try {
      setTableLoading(true);
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses);
      }
    } catch (e) {
      console.error('Failed to fetch courses:', e);
      addToast('error', 'Error loading courses', 'Could not refresh course catalog table.');
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch all payment records (Phase 2)
  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      if (data.payments) {
        setPayments(data.payments);
      }
    } catch (e) {
      console.error('Failed to fetch payments:', e);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Handle Admin Sign In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      setIsAdmin(true);
      setAdminEmail(data.user.email);
      addToast('success', 'Admin Authenticated', `Welcome back, ${data.user.email}`);
      fetchCourses();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid admin credentials');
      addToast('error', 'Sign In Failed', err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Admin Sign Out
  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      setIsAdmin(false);
      addToast('info', 'Signed Out', 'You have been disconnected from the admin session.');
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Thumbnail File Selection & Upload
  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailError(null);

    // Validation: Image types only
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setThumbnailError('Please select a valid image file (JPEG, PNG, or WebP).');
      addToast('error', 'Invalid Image Type', 'Only JPEG, PNG, and WebP are supported.');
      return;
    }

    // Validation: Size limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      setThumbnailError('Image size exceeds 10MB limit.');
      addToast('error', 'Image Too Large', 'Please upload an image under 10MB.');
      return;
    }

    // Set preview
    const reader = new FileReader();
    reader.onload = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload via API
    try {
      setThumbnailUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'thumbnail');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Thumbnail upload failed');
      }

      setThumbnailUrl(data.url);
      addToast('success', 'Thumbnail Uploaded', 'Showcase image stored successfully.');
    } catch (err: any) {
      setThumbnailError(err.message || 'Failed to upload image. Please try again.');
      addToast('error', 'Upload Failed', err.message);
    } finally {
      setThumbnailUploading(false);
    }
  };

  // Handle Video File Selection & Upload with Progress Bar
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoError(null);
    setVideoProgress(0);
    setVideoFileName(file.name);

    // Validation: Video types only (mp4, webm, mov)
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowed.includes(file.type) || ['mp4', 'webm', 'mov'].includes(ext || '');

    if (!isValidType) {
      const msg = 'Invalid video file type. Only MP4, WebM, and MOV are supported.';
      setVideoError(msg);
      addToast('error', 'Invalid Video Format', msg);
      return;
    }

    // Validation: Size limit 250MB
    if (file.size > 250 * 1024 * 1024) {
      const msg = 'Video file size exceeds the 250MB limit.';
      setVideoError(msg);
      addToast('error', 'Video Too Large', msg);
      return;
    }

    // Upload with real-time XMLHttpRequest progress
    setVideoUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'video');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setVideoProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setVideoUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          setVideoUrl(response.url);
          setVideoProgress(100);
          addToast('success', 'Video Uploaded', `Successfully uploaded ${file.name}`);
        } catch {
          setVideoError('Invalid response from server.');
          addToast('error', 'Upload Error', 'Could not parse upload response.');
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          setVideoError(response.error || 'Video upload failed.');
          addToast('error', 'Upload Failed', response.error || 'Server error during upload.');
        } catch {
          setVideoError(`Upload failed with status ${xhr.status}.`);
          addToast('error', 'Upload Failed', `Server error (${xhr.status}).`);
        }
      }
    };

    xhr.onerror = () => {
      setVideoUploading(false);
      const msg = 'Network error during video upload. Please check your connection and retry.';
      setVideoError(msg);
      addToast('error', 'Network Error', msg);
    };

    xhr.send(formData);
  };

  // Submit "Add New Course" Form
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    if (!title.trim()) {
      addToast('error', 'Missing Title', 'Please enter a course title.');
      return;
    }
    if (!summary.trim()) {
      addToast('error', 'Missing Description', 'Please provide a course summary/description.');
      return;
    }
    if (!thumbnailUrl) {
      addToast('error', 'Missing Thumbnail', 'Please upload a showcase image thumbnail.');
      return;
    }
    if (!videoUrl) {
      addToast('error', 'Missing Video', 'Please upload the course video.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      addToast('error', 'Invalid Price', 'Price must be a valid positive number greater than 0.');
      return;
    }
    if (!walletInput.trim()) {
      addToast('error', 'Missing Wallet Address', 'Please provide your Interledger wallet address username.');
      return;
    }

    const formattedWallet = formatWalletAddress(walletInput);

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          currency_code: currencyCode,
          price: numPrice,
          wallet_address: formattedWallet,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create course');
      }

      addToast('success', 'Course Published!', `"${title}" has been added with wallet ${formattedWallet}`);

      // Reset form
      setTitle('');
      setSummary('');
      setPrice('');
      setWalletInput('');
      setThumbnailUrl('');
      setThumbnailPreview(null);
      setVideoUrl('');
      setVideoProgress(0);
      setVideoFileName('');

      // Refresh management table
      fetchCourses();
    } catch (err: any) {
      addToast('error', 'Failed to Create Course', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setEditTitle(course.title);
    setEditSummary(course.summary);
    setEditCurrency(course.currency_code);
    setEditPrice(course.price.toString());
    setEditWalletInput(course.wallet_address || '');
    setEditThumbnailUrl(course.thumbnail_url);
    setEditVideoUrl(course.video_url);
  };

  // Submit Edit Course
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const numPrice = Number(editPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      addToast('error', 'Invalid Price', 'Price must be a positive number.');
      return;
    }

    if (!editWalletInput.trim()) {
      addToast('error', 'Missing Wallet Address', 'Interledger test wallet address is required.');
      return;
    }

    const formattedWallet = formatWalletAddress(editWalletInput);

    try {
      setIsSubmittingEdit(true);
      const res = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          summary: editSummary,
          currency_code: editCurrency,
          price: numPrice,
          wallet_address: formattedWallet,
          thumbnail_url: editThumbnailUrl,
          video_url: editVideoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update course');

      addToast('success', 'Course Updated', 'Changes saved successfully.');
      setEditingCourse(null);
      fetchCourses();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Execute Course Deletion
  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/courses/${deletingCourse.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete course');

      addToast('success', 'Course Deleted', `Removed "${deletingCourse.title}"`);
      setDeletingCourse(null);
      fetchCourses();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Render Admin Sign In Screen if not authenticated
  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 py-16">
          <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-surface-border shadow-2xl space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-brand-cyan/15 text-brand-cyan mx-auto flex items-center justify-center shadow-glow-cyan">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-foreground">Admin Portal Access</h1>
              <p className="text-xs sm:text-sm text-muted">
                Role-based access required. Please authenticate to manage courses and uploads.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                    placeholder="admin@learnify.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted border border-surface-border text-[11px] text-muted space-y-1">
                <div className="font-semibold text-foreground">Demo Admin Credentials:</div>
                <div>Email: <code className="text-brand-cyan">admin@learnify.com</code> (or configured via <code className="text-brand-purple">ADMIN_EMAIL</code>)</div>
                <div>Password: <code className="text-brand-orange">learnify2026!</code></div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-6 rounded-xl font-bold text-sm text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Sign In to Admin Portal</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link href="/" className="text-xs font-semibold text-muted hover:text-brand-cyan transition-colors">
                ← Return to Public Courses
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  // Loading admin authentication status
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-cyan" />
            <p className="text-sm font-semibold text-muted">Checking Admin Permissions...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Admin Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Studio • Phase 1</span>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Course Upload & Management
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Signed in as <strong className="text-foreground">{adminEmail}</strong> (Super Admin)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-surface-muted hover:bg-surface-border border border-surface-border text-foreground transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-cyan" />
              <span>View Storefront</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Courses vs Payments) */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-brand-cyan text-brand-navy shadow-sm'
                : 'bg-surface-muted text-muted hover:text-foreground border border-surface-border'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Course Management ({courses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('payments');
              fetchPayments();
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payments'
                ? 'bg-brand-cyan text-brand-navy shadow-sm'
                : 'bg-surface-muted text-muted hover:text-foreground border border-surface-border'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Payment Records ({payments.length})</span>
          </button>
        </div>

        {activeTab === 'courses' ? (
          <>
            {/* SECTION 1: "ADD NEW COURSE" FORM */}
            <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-surface-border shadow-xl space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Add New Course</h2>
              <p className="text-xs text-muted">Fill out course details, upload media, set currency pricing, and configure Interledger wallet</p>
            </div>
          </div>

          <form onSubmit={handleCreateCourse} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 1: Course Title (required) */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Course Title <span className="text-brand-orange">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Artificial Intelligence & Full-Stack Development"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                />
              </div>

              {/* Field 2: Course Summary / Description (required, multi-line) */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Course Summary / Description <span className="text-brand-orange">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Detailed multi-line description of the course content, curriculum, objectives, and prerequisites..."
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60 leading-relaxed"
                />
              </div>

              {/* Field: Instructor Interledger Wallet Address (Required) */}
              <div className="md:col-span-2 space-y-2 p-5 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-cyan flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-brand-cyan" />
                    <span>Instructor Interledger Wallet Address</span>
                    <span className="text-brand-orange">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-brand-orange bg-brand-orange/10 px-2.5 py-0.5 rounded-full border border-brand-orange/20 self-start sm:self-auto">
                    Testnet Wallet Address
                  </span>
                </div>

                <div className="relative flex items-center rounded-xl bg-surface border border-surface-border focus-within:ring-2 focus-within:ring-brand-cyan/60 overflow-hidden shadow-sm">
                  <span className="pl-4 pr-2 py-3 text-sm font-mono font-semibold text-muted bg-surface-muted border-r border-surface-border select-none whitespace-nowrap">
                    $ilp.interledger-test.dev/
                  </span>
                  <input
                    type="text"
                    required
                    value={walletInput}
                    onChange={(e) => {
                      // Allow pasting full $ilp.interledger-test.dev/username or typing username
                      const val = e.target.value.replace(/^\$ilp\.interledger-test\.dev\//, '').replace(/^\$+/, '');
                      setWalletInput(val);
                    }}
                    placeholder="your_wallet_name"
                    className="w-full px-3 py-3 text-sm font-mono font-medium bg-transparent text-foreground placeholder:text-muted/60 focus:outline-none"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1 text-xs text-muted leading-relaxed">
                  <Coins className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <p>
                    <strong>First Payment Integration Setup:</strong> We are using test wallets for now. Please enter the name on your test wallet in the format <code className="text-brand-cyan font-mono font-semibold">$ilp.interledger-test.dev/(name)</code>. Student payments will be routed directly to this testnet wallet address.
                  </p>
                </div>
              </div>

              {/* Field 3: Thumbnail / Showcase Image Upload (required) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Showcase Image / Thumbnail <span className="text-brand-orange">*</span>
                </label>
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] ${
                    thumbnailPreview
                      ? 'border-brand-cyan/50 bg-brand-cyan/5'
                      : 'border-surface-border hover:border-brand-cyan/40 bg-surface'
                  }`}
                >
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />

                  {thumbnailPreview ? (
                    <div className="space-y-3 w-full">
                      <div className="relative aspect-video max-h-36 mx-auto rounded-xl overflow-hidden shadow-md">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                        {thumbnailUploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-brand-cyan" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-brand-cyan font-semibold">
                        {thumbnailUploading ? 'Uploading to cloud storage...' : '✓ Image ready. Click to change.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 text-brand-cyan mx-auto flex items-center justify-center">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-foreground">Click to upload thumbnail image</div>
                      <p className="text-[11px] text-muted">JPEG, PNG, or WebP (max 10MB)</p>
                    </div>
                  )}
                </div>
                {thumbnailError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{thumbnailError}</span>
                  </p>
                )}
              </div>

              {/* Field 4: Course Video Upload (required, progress bar, mp4/webm/mov validation) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Course Video Upload <span className="text-brand-orange">*</span>
                </label>
                <div
                  onClick={() => !videoUploading && videoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] ${
                    videoUrl
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-surface-border hover:border-brand-purple/40 bg-surface'
                  }`}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    onChange={handleVideoChange}
                    disabled={videoUploading}
                    className="hidden"
                  />

                  {videoUploading ? (
                    <div className="w-full space-y-3 px-4">
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <span className="truncate max-w-[200px]">{videoFileName}</span>
                        <span className="text-brand-cyan">{videoProgress}%</span>
                      </div>
                      {/* REAL-TIME PROGRESS BAR */}
                      <div className="w-full h-3 rounded-full bg-surface-muted overflow-hidden border border-surface-border">
                        <div
                          className="h-full bg-brand-gradient transition-all duration-150 ease-out"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted animate-pulse">Uploading video to cloud storage...</p>
                    </div>
                  ) : videoUrl ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-emerald-400">✓ Video Uploaded Successfully</div>
                      <p className="text-[11px] text-muted truncate max-w-xs mx-auto">{videoFileName || 'Course media ready'}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          videoInputRef.current?.click();
                        }}
                        className="text-[11px] text-brand-purple hover:underline"
                      >
                        Replace video file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-brand-purple/10 text-brand-purple mx-auto flex items-center justify-center">
                        <Video className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-foreground">Click to upload course video</div>
                      <p className="text-[11px] text-muted">MP4, WebM, or MOV (max 250MB)</p>
                    </div>
                  )}
                </div>
                {videoError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{videoError}</span>
                  </p>
                )}
              </div>

              {/* Field 5: Currency Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Currency <span className="text-brand-orange">*</span>
                </label>
                <div className="relative">
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60 cursor-pointer"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-surface text-foreground">
                        {c.flag} {c.code} ({c.symbol}) — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-muted">
                  The course price will always be displayed natively in this currency.
                </p>
              </div>

              {/* Field 6: Price (required, positive numeric validation) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Price <span className="text-brand-orange">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-orange">
                    {CURRENCY_MAP[currencyCode]?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 29.99"
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm font-bold bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                  />
                </div>
                <p className="text-[11px] text-muted">
                  Must be a positive number greater than 0.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setSummary('');
                  setPrice('');
                  setWalletInput('');
                  setThumbnailUrl('');
                  setThumbnailPreview(null);
                  setVideoUrl('');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-foreground transition-colors"
              >
                Reset Fields
              </button>

              <button
                type="submit"
                disabled={isSubmitting || thumbnailUploading || videoUploading}
                className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-brand-gradient hover:bg-brand-gradient-hover shadow-glow-brand transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing Course...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Publish Course</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 2: "MANAGE COURSES" TABLE */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-surface-border shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
            <div>
              <h2 className="text-xl font-bold text-foreground">Manage Courses</h2>
              <p className="text-xs text-muted">View, inspect, edit, or delete courses currently live in the catalog</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-muted text-muted">
                {courses.length} Total Courses
              </span>
              <button
                onClick={fetchCourses}
                className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                title="Refresh course table"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table View */}
          {tableLoading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-cyan mx-auto mb-2" />
              <p className="text-xs text-muted">Loading courses...</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-border text-xs uppercase font-bold text-muted tracking-wider">
                    <th className="py-3 px-4">Thumbnail</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Interledger Wallet</th>
                    <th className="py-3 px-4">Price & Currency</th>
                    <th className="py-3 px-4">Date Added</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-sm">
                  {courses.map((course) => {
                    const formattedDate = new Date(course.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <tr key={course.id} className="hover:bg-surface-muted/50 transition-colors">
                        {/* Thumbnail */}
                        <td className="py-3.5 px-4 w-28">
                          <div className="relative aspect-video w-24 rounded-lg overflow-hidden bg-brand-navy-dark shadow-sm">
                            {course.thumbnail_url ? (
                              <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted">
                                No image
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title & Preview Link */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <Link
                            href={`/course/${course.id}`}
                            className="font-bold text-foreground hover:text-brand-cyan transition-colors line-clamp-2"
                          >
                            {course.title}
                          </Link>
                          <span className="text-[11px] text-muted line-clamp-1 mt-0.5">
                            {course.summary}
                          </span>
                        </td>

                        {/* Interledger Wallet */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/25">
                            <Wallet className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[200px]">{course.wallet_address || '$ilp.interledger-test.dev/instructor'}</span>
                          </span>
                        </td>

                        {/* Price + Currency */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-extrabold text-brand-orange text-base block">
                            {formatPrice(course.price, course.currency_code)}
                          </span>
                          <span className="text-[11px] text-muted font-mono">
                            {course.currency_code} ({CURRENCY_MAP[course.currency_code]?.symbol})
                          </span>
                        </td>

                        {/* Date Added */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-muted">
                          {formattedDate}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={`/course/${course.id}`}
                              target="_blank"
                              className="p-2 rounded-lg text-muted hover:text-brand-cyan hover:bg-surface-muted transition-colors"
                              title="View Public Course Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleOpenEdit(course)}
                              className="p-2 rounded-lg text-muted hover:text-brand-purple hover:bg-surface-muted transition-colors"
                              title="Edit Course"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeletingCourse(course)}
                              className="p-2 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted text-sm">
              No courses found. Add your first course using the form above.
            </div>
          )}
        </section>
      </>
    ) : (
      /* ========================================== */
      /* SECTION: PAYMENT RECORDS (PHASE 2)        */
      /* ========================================== */
      <section className="space-y-8 animate-in fade-in duration-200">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-surface-border">
            <span className="text-xs uppercase font-bold text-muted tracking-wider block">
              Total Transactions
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-foreground">
                {payments.length}
              </span>
              <Receipt className="w-5 h-5 text-brand-cyan" />
            </div>
            <span className="text-[11px] text-muted mt-1 block">All checkout attempts</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-surface-border">
            <span className="text-xs uppercase font-bold text-muted tracking-wider block">
              Successful Charges
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-emerald-400">
                {payments.filter((p) => p.status === 'success').length}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] text-muted mt-1 block">Confirmed by Wallet API</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-surface-border">
            <span className="text-xs uppercase font-bold text-muted tracking-wider block">
              Failed Charges
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-rose-400">
                {payments.filter((p) => p.status === 'failed').length}
              </span>
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-[11px] text-muted mt-1 block">Declined or card errors</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-surface-border">
            <span className="text-xs uppercase font-bold text-muted tracking-wider block">
              Payment Provider
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-black text-brand-orange">
                Swappable
              </span>
              <CreditCard className="w-5 h-5 text-brand-orange" />
            </div>
            <span className="text-[11px] text-brand-cyan mt-1 block font-mono">
              WALLET_API_URL contract
            </span>
          </div>
        </div>

        {/* Payments Table Panel */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-cyan" />
                <span>Student Payment Transactions</span>
              </h2>
              <p className="text-xs text-muted mt-1">
                Audited charges received from the external Wallet API. Sensitive card data is never stored.
              </p>
            </div>

            <button
              onClick={fetchPayments}
              disabled={paymentsLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-surface-muted hover:bg-surface-border text-foreground transition-all self-start sm:self-auto border border-surface-border"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${paymentsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="Search by student, email, reference, course..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-muted mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {['ALL', 'success', 'failed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setPaymentFilterStatus(st)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    paymentFilterStatus === st
                      ? 'bg-brand-cyan text-brand-navy shadow-sm'
                      : 'bg-surface-muted text-foreground hover:bg-surface-border border border-surface-border'
                  }`}
                >
                  {st.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {paymentsLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-cyan mx-auto" />
              <p className="text-xs text-muted mt-2">Loading payment records...</p>
            </div>
          ) : (() => {
            const filteredPayments = payments.filter((p) => {
              const q = paymentSearch.toLowerCase().trim();
              const matchesSearch =
                !q ||
                p.reference.toLowerCase().includes(q) ||
                (p.student_name && p.student_name.toLowerCase().includes(q)) ||
                (p.student_email && p.student_email.toLowerCase().includes(q)) ||
                (p.course_title && p.course_title.toLowerCase().includes(q));

              const matchesStatus =
                paymentFilterStatus === 'ALL' || p.status === paymentFilterStatus;

              return matchesSearch && matchesStatus;
            });

            if (filteredPayments.length === 0) {
              return (
                <div className="py-16 text-center text-muted text-xs space-y-2">
                  <Receipt className="w-8 h-8 mx-auto text-muted/60" />
                  <p className="font-semibold text-foreground text-sm">No Payment Records Found</p>
                  <p>
                    {paymentSearch || paymentFilterStatus !== 'ALL'
                      ? 'No records match your search or status filter.'
                      : 'When a student checks out, payments will be automatically audited here.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto rounded-2xl border border-surface-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted/80 text-muted uppercase tracking-wider font-bold text-[10px] border-b border-surface-border">
                    <tr>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Wallet Tx ID / Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {filteredPayments.map((payment) => {
                      const formattedDate = new Date(payment.created_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const isSuccess = payment.status === 'success';

                      return (
                        <tr key={payment.id} className="hover:bg-surface-muted/40 transition-colors">
                          {/* Reference */}
                          <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                            {payment.reference}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                            {formattedDate}
                          </td>

                          {/* Student */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-foreground">
                              {payment.student_name || 'Student'}
                            </div>
                            <div className="text-[11px] text-muted">
                              {payment.student_email || 'N/A'}
                            </div>
                          </td>

                          {/* Course */}
                          <td className="py-3.5 px-4 max-w-xs truncate font-medium text-foreground">
                            {payment.course_title || 'Learnify Course'}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-extrabold text-brand-orange text-sm block">
                              {formatPrice(payment.amount, payment.currency)}
                            </span>
                            <span className="text-[10px] text-muted font-mono">
                              {payment.currency}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <AlertCircle className="w-3 h-3" />
                                Failed
                              </span>
                            )}
                          </td>

                          {/* Wallet Transaction / Code */}
                          <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                            {isSuccess ? (
                              <span className="text-brand-cyan">{payment.wallet_transaction_id || 'N/A'}</span>
                            ) : (
                              <span className="text-rose-400 font-semibold">{payment.failure_code || 'DECLINED'}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </section>
    )}
      </main>

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-surface-border shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <h3 className="text-xl font-bold text-foreground">Edit Course</h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1 rounded-lg text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Summary / Description</label>
                <textarea
                  rows={4}
                  required
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">
                  Instructor Interledger Wallet Address
                </label>
                <div className="relative flex items-center rounded-xl bg-surface border border-surface-border focus-within:ring-2 focus-within:ring-brand-cyan/60 overflow-hidden">
                  <span className="pl-3.5 pr-2 py-2.5 text-xs font-mono text-muted bg-surface-muted border-r border-surface-border select-none">
                    $ilp.interledger-test.dev/
                  </span>
                  <input
                    type="text"
                    required
                    value={editWalletInput.replace(/^\$ilp\.interledger-test\.dev\//, '')}
                    onChange={(e) => setEditWalletInput(e.target.value)}
                    placeholder="wallet_name"
                    className="w-full px-3 py-2.5 text-xs font-mono bg-transparent text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Currency</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-surface border border-surface-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  required
                  value={editThumbnailUrl}
                  onChange={(e) => setEditThumbnailUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-xs bg-surface border border-surface-border text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Video Stream URL</label>
                <input
                  type="text"
                  required
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-xs bg-surface border border-surface-border text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-surface-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-cyan text-brand-navy hover:opacity-90"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-surface-border shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-500 mx-auto flex items-center justify-center">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-foreground">Delete Course?</h3>
              <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
                Are you sure you want to delete <strong className="text-foreground font-semibold">"{deletingCourse.title}"</strong>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-surface-muted text-foreground hover:bg-surface-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
