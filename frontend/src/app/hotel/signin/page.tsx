'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function HotelSignInPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMsg('Please enter your registered email address or username.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/hotel-admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: cleanIdentifier,
          password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid email/username or password. Please verify your credentials.');
      }

      // Store authentic session state
      if (typeof window !== 'undefined') {
        localStorage.setItem('brijnidhi_hotel_admin_token', data.data.token);
        localStorage.setItem('brijnidhi_hotel_admin_staff', JSON.stringify(data.data.profile));
        localStorage.removeItem('brijnidhi_hotel_admin_logged_out');
      }

      setSuccessMsg(`Welcome back, ${data.data.profile.fullName}! Opening your Hotel PMS Dashboard...`);

      // Redirect to /hotel/dashboard
      setTimeout(() => {
        router.push('/hotel/dashboard');
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col justify-between">
      {/* 1. TOP MINIMAL HEADER */}
      <header className="bg-stone-950 text-amber-50 px-4 sm:px-8 py-3.5 border-b border-amber-900/40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/hotel" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-serif font-black text-sm">
              श्री
            </div>
            <div className="font-serif font-bold text-base text-amber-100">
              Brijnidhi <span className="text-stone-400 text-xs font-sans font-normal">• Hotel Sign In</span>
            </div>
          </Link>

          <Link
            href="/list-property"
            className="text-xs text-amber-300 hover:text-amber-200 font-medium transition-colors"
          >
            New hotel partner? <span className="underline font-semibold">Register</span>
          </Link>
        </div>
      </header>

      {/* 2. SIGN IN CARD */}
      <main className="max-w-md w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-stone-200/80">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3 border border-amber-100 shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Hotel Partner Sign In</h1>
            <p className="text-xs text-stone-500 mt-1">
              Access your hotel PMS, room inventory, guest check-ins, and billing.
            </p>
          </div>

          {/* Feedback */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => {
                    setIdentifier(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="admin@brijnidhi.org or username"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials hint */}
          <div className="mt-6 p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-[11px] text-stone-600">
            <div className="font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Registered Accounts:</span>
            </div>
            <div className="font-mono text-[10px] space-y-0.5 text-stone-500">
              <div>Admin: <span className="text-stone-800">admin@brijnidhi.org</span> / <span className="text-stone-800">BrijAdmin@2026</span></div>
              <div>Manager: <span className="text-stone-800">manager</span> / <span className="text-stone-800">BrijStaff@2026</span></div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Need to register a new hotel in Braj Dham?{' '}
              <Link href="/list-property" className="text-amber-700 font-semibold hover:underline">
                Register Your Hotel
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* 3. MINIMAL FOOTER */}
      <footer className="py-6 text-center text-[11px] text-stone-400 border-t border-stone-200">
        <div>© {new Date().getFullYear()} Brijnidhi Hotel Partner Network. All rights reserved.</div>
      </footer>
    </div>
  );
}
