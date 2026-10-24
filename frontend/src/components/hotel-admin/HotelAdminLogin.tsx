'use client';

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StaffAccount, StaffRole } from './types';

interface HotelAdminLoginProps {
  hotelName: string;
  propertyCode: string;
  destination: string;
  onLoginSuccess: (staff: StaffAccount, token: string) => void;
  onSwitchProperty?: () => void;
}

export default function HotelAdminLogin({
  hotelName,
  propertyCode,
  destination,
  onLoginSuccess,
  onSwitchProperty
}: HotelAdminLoginProps) {
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDemoDrawer, setShowDemoDrawer] = useState(true);

  // Forced password change on first login
  const [pendingFirstLoginStaff, setPendingFirstLoginStaff] = useState<{
    staff: StaffAccount;
    token: string;
  } | null>(null);
  const [firstLoginNewPassword, setFirstLoginNewPassword] = useState('');
  const [firstLoginConfirmPassword, setFirstLoginConfirmPassword] = useState('');
  const [firstLoginError, setFirstLoginError] = useState('');

  // Forgot password states
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);

  // Quick preset accounts for demonstration
  const demoAccounts = [
    { role: 'Admin' as StaffRole, username: 'admin', pass: 'BrijAdmin@2026', title: 'Admin (Full Access & Staff Creation)' },
    { role: 'Manager' as StaffRole, username: 'manager', pass: 'BrijStaff@2026', title: 'Manager (Operations & Reports)' },
    { role: 'Receptionist' as StaffRole, username: 'reception', pass: 'BrijStaff@2026', title: 'Receptionist (Front Desk Check-In)' },
    { role: 'Housekeeping' as StaffRole, username: 'housekeeping', pass: 'BrijStaff@2026', title: 'Housekeeping (Room Cleaning)' },
    { role: 'Accountant' as StaffRole, username: 'accountant', pass: 'BrijStaff@2026', title: 'Accountant (POS, Folios & Cash)' },
    { role: 'Restaurant Staff' as StaffRole, username: 'restaurant', pass: 'BrijStaff@2026', title: 'Restaurant Staff (Bhojan Dining)' }
  ];

  const handleFillDemo = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter both email/username and your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/hotel-admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      const { profile, token, mustChangePassword } = data.data;

      // Check if first-time password change is required
      if (mustChangePassword) {
        setPendingFirstLoginStaff({ staff: profile, token });
        setIsLoading(false);
        return;
      }

      // Successful login
      setSuccessMsg(`Welcome, ${profile.fullName}! Authenticating workstation...`);
      setTimeout(() => {
        onLoginSuccess(profile, token);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstLoginPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirstLoginError('');

    if (firstLoginNewPassword.length < 8) {
      setFirstLoginError('Password must be at least 8 characters long.');
      return;
    }
    if (firstLoginNewPassword !== firstLoginConfirmPassword) {
      setFirstLoginError('Passwords do not match.');
      return;
    }

    if (!pendingFirstLoginStaff) return;

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/hotel-admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: pendingFirstLoginStaff.staff.id,
          currentPassword: password,
          newPassword: firstLoginNewPassword
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update password.');
      }

      // Password updated successfully -> Proceed to dashboard
      const updatedStaff = {
        ...pendingFirstLoginStaff.staff,
        mustChangePassword: false
      };
      onLoginSuccess(updatedStaff, pendingFirstLoginStaff.token);
    } catch (err: any) {
      setFirstLoginError(err.message || 'Password update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!recoveryIdentifier.trim()) {
      setErrorMsg('Please enter your registered email or username.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/hotel-admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: recoveryIdentifier.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Recovery failed.');
      setRecoveryStep(2);
      setSuccessMsg('Recovery code sent! Enter sacred recovery code 108108 to proceed.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!recoveryCode.trim() || !newResetPassword) {
      setErrorMsg('Recovery code and new password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/hotel-admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: recoveryIdentifier.trim(),
          code: recoveryCode.trim(),
          newPassword: newResetPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Reset failed.');

      alert('Password reset successfully! You can now log in with your new credentials.');
      setMode('LOGIN');
      setRecoveryStep(1);
      setPassword(newResetPassword);
      setIdentifier(recoveryIdentifier);
    } catch (err: any) {
      setErrorMsg(err.message || 'Reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/95 backdrop-blur-xl flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-800/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg bg-neutral-900 border border-amber-900/60 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative text-white">
        {/* Top Property Badge & Switcher */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800/80">
              {propertyCode}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {destination}
            </span>
          </div>
          {onSwitchProperty && (
            <button
              type="button"
              onClick={onSwitchProperty}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1.5 transition hover:underline"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Change Hotel</span>
            </button>
          )}
        </div>

        {/* Portal Branding Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>BRIJNIDHI PMS ENTERPRISE SECURITY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
            {hotelName}
          </h1>
          <p className="text-xs text-neutral-400">
            Hotel Management Login & Staff Access Control
          </p>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FIRST-TIME LOGIN PASSWORD CHANGE MODAL */}
        {pendingFirstLoginStaff ? (
          <div className="space-y-4 bg-neutral-800/80 p-5 rounded-2xl border border-amber-700/80">
            <div className="space-y-1 text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-900/60 px-2 py-0.5 rounded">
                First Time Login Required
              </span>
              <h3 className="text-lg font-bold text-white">
                Set Your Personal Password
              </h3>
              <p className="text-xs text-neutral-400">
                Welcome, {pendingFirstLoginStaff.staff.fullName} ({pendingFirstLoginStaff.staff.role}). Your account was created with a temporary password. You must set a permanent private password to continue.
              </p>
            </div>

            {firstLoginError && (
              <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{firstLoginError}</span>
              </div>
            )}

            <form onSubmit={handleFirstLoginPasswordSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  New Password (Min. 8 characters)
                </label>
                <input
                  type="password"
                  value={firstLoginNewPassword}
                  onChange={e => setFirstLoginNewPassword(e.target.value)}
                  placeholder="Enter your new secure password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={firstLoginConfirmPassword}
                  onChange={e => setFirstLoginConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new secure password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-black text-sm transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Save Password & Open Workstation</span>
              </button>
            </form>
          </div>
        ) : mode === 'LOGIN' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Email Address or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="e.g. admin or priya.goswami@brijnidhi.org"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('FORGOT_PASSWORD');
                    setErrorMsg('');
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 transition hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your confidential password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-neutral-400 hover:text-white transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-neutral-700 bg-neutral-950 text-amber-500 focus:ring-0"
                />
                <span>Remember session on this device</span>
              </label>
              <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SSL Encrypted</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-sm tracking-wide transition flex items-center justify-center space-x-2 shadow-xl shadow-amber-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-neutral-950" />
                  <span>Sign In to Workstation</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* FORGOT PASSWORD FORM */
          <div className="space-y-4">
            <div className="space-y-1 text-left">
              <h3 className="text-lg font-bold text-white">
                Account Recovery & Password Reset
              </h3>
              <p className="text-xs text-neutral-400">
                {recoveryStep === 1
                  ? 'Enter your registered email or username to initiate password reset.'
                  : 'Enter the recovery code (108108) and set your new password.'}
              </p>
            </div>

            {recoveryStep === 1 ? (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Email Address or Username
                  </label>
                  <input
                    type="text"
                    value={recoveryIdentifier}
                    onChange={e => setRecoveryIdentifier(e.target.value)}
                    placeholder="e.g. admin or priya.goswami@brijnidhi.org"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('LOGIN')}
                    className="w-1/3 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-black transition flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    <span>Send Recovery Code</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Verification Code (Sacred Code: 108108)
                  </label>
                  <input
                    type="text"
                    value={recoveryCode}
                    onChange={e => setRecoveryCode(e.target.value)}
                    placeholder="108108"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    value={newResetPassword}
                    onChange={e => setNewResetPassword(e.target.value)}
                    placeholder="Enter at least 8 characters"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryStep(1)}
                    className="w-1/3 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-black transition flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>Confirm & Reset Password</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* DEMO CREDENTIALS QUICK-FILL ACCORDION (For Seamless Pair-Testing) */}
        <div className="pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => setShowDemoDrawer(!showDemoDrawer)}
            className="w-full flex items-center justify-between text-xs text-amber-300 font-bold hover:text-amber-200 transition p-1"
          >
            <div className="flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Staff Credentials (1-Click Fill)</span>
            </div>
            {showDemoDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDemoDrawer && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2.5">
              {demoAccounts.map(demo => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleFillDemo(demo.username, demo.pass)}
                  className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-amber-950/60 border border-neutral-700 hover:border-amber-600 text-left transition text-xs group cursor-pointer"
                >
                  <span className="font-bold text-white block text-[11px] group-hover:text-amber-300">
                    {demo.role}
                  </span>
                  <span className="text-[10px] text-neutral-400 block font-mono truncate">
                    {demo.username}
                  </span>
                  <span className="text-[9px] text-amber-400/80 block mt-0.5">
                    Click to fill
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Security & Access Policies Footer */}
        <div className="text-[11px] text-neutral-500 text-center space-y-1">
          <p>
            🔒 Protected under Role-Based Access Control (RBAC). Unauthorized attempts are logged.
          </p>
          <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-400">
            <span>Staff accounts must be created by Authorized Hotel Administrator.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
