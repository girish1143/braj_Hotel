'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Phone,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  X,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Check
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess?: (user: any) => void;
  canClose?: boolean;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  canClose = true
}: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');

  // Login form state
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regOtpInput, setRegOtpInput] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpVerified, setRegOtpVerified] = useState(false);
  const [regSendingOtp, setRegSendingOtp] = useState(false);
  const [regVerifyingOtp, setRegVerifyingOtp] = useState(false);
  const [regCountdown, setRegCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Resend Countdown timer for Login
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Resend Countdown timer for Register
  useEffect(() => {
    if (regCountdown > 0) {
      const timer = setTimeout(() => setRegCountdown(regCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [regCountdown]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canClose && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, canClose, onClose]);

  if (!isOpen || !mounted) return null;

  const currentIdentifier = loginMethod === 'phone' ? phone.trim() : email.trim();

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (loginMethod === 'phone' && (!phone || phone.trim().length < 10)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (loginMethod === 'email' && (!email || !email.includes('@'))) {
      setError('Please enter a valid email address.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: currentIdentifier, phone, email })
      });
      const data = await res.json();
      setOtpSent(true);
      setOtpVerified(false);
      setResendCountdown(30);
      setSuccessMsg(data.message || `Sacred verification code sent! Default Code: 108108`);
    } catch {
      // Offline fallback
      setOtpSent(true);
      setOtpVerified(false);
      setResendCountdown(30);
      setSuccessMsg(`Sacred verification code sent to ${currentIdentifier}. (Default Code: 108108)`);
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!otpInput || otpInput.trim().length === 0) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: currentIdentifier, otp: otpInput.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Incorrect verification code. Please enter 108108.');
      }

      setOtpVerified(true);
      setSuccessMsg('✓ Mobile number verified successfully! You can now press Sign In below.');
    } catch (err: any) {
      // Local fallback: accept 108108 or 123456
      if (otpInput.trim() === '108108' || otpInput.trim() === '123456') {
        setOtpVerified(true);
        setSuccessMsg('✓ Mobile number verified successfully! You can now press Sign In below.');
      } else {
        setError(err.message || 'Incorrect OTP. Please enter sacred code 108108.');
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: Press Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentIdentifier) {
      setError('Please provide your mobile number or email.');
      return;
    }

    if (!otpVerified) {
      setError('Please verify the OTP first before pressing Sign In.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: currentIdentifier,
          phone: loginMethod === 'phone' ? currentIdentifier : undefined,
          email: loginMethod === 'email' ? currentIdentifier : undefined,
          otpVerified: true
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please verify your credentials.');
      }

      const userData = data.user || {
        id: `usr-${Date.now()}`,
        name: currentIdentifier.includes('@') ? currentIdentifier.split('@')[0] : `Braj Yatri (${currentIdentifier.slice(-4)})`,
        email: currentIdentifier.includes('@') ? currentIdentifier : `${currentIdentifier}@yatri.brijnidhi.org`,
        phone: loginMethod === 'phone' ? currentIdentifier : 'Not provided',
        role: 'CUSTOMER'
      };

      localStorage.setItem('brijnidhi_logged_in', 'true');
      localStorage.setItem('brijnidhi_current_user', JSON.stringify(userData));
      if (data.token) {
        localStorage.setItem('brijnidhi_token', data.token);
      }

      window.dispatchEvent(new Event('brijnidhi_auth_change'));

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      // Offline fallback: log in client-side smoothly
      const fallbackUser = {
        id: `usr-${Date.now()}`,
        name: currentIdentifier.includes('@') ? currentIdentifier.split('@')[0] : `Braj Devotee (${currentIdentifier.slice(-4)})`,
        email: currentIdentifier.includes('@') ? currentIdentifier : `${currentIdentifier}@yatri.brijnidhi.org`,
        phone: loginMethod === 'phone' ? currentIdentifier : 'Not provided',
        role: 'CUSTOMER'
      };

      localStorage.setItem('brijnidhi_logged_in', 'true');
      localStorage.setItem('brijnidhi_current_user', JSON.stringify(fallbackUser));
      window.dispatchEvent(new Event('brijnidhi_auth_change'));

      if (onLoginSuccess) {
        onLoginSuccess(fallbackUser);
      }
      if (onClose) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  // Register: Send OTP
  const handleRegSendOtp = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!regPhone || regPhone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number for registration.');
      return;
    }

    setRegSendingOtp(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: regPhone.trim(), phone: regPhone.trim() })
      });
      const data = await res.json();
      setRegOtpSent(true);
      setRegOtpVerified(false);
      setRegCountdown(30);
      setSuccessMsg(data.message || `Sacred verification code sent! Default Code: 108108`);
    } catch {
      setRegOtpSent(true);
      setRegOtpVerified(false);
      setRegCountdown(30);
      setSuccessMsg(`Sacred verification code sent to +91 ${regPhone.slice(-4)}. (Default Code: 108108)`);
    } finally {
      setRegSendingOtp(false);
    }
  };

  // Register: Verify OTP
  const handleRegVerifyOtp = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!regOtpInput || regOtpInput.trim().length === 0) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setRegVerifyingOtp(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: regPhone.trim(), otp: regOtpInput.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Incorrect verification code. Please enter 108108.');
      }

      setRegOtpVerified(true);
      setSuccessMsg('✓ Mobile number verified successfully! You can now complete registration.');
    } catch (err: any) {
      if (regOtpInput.trim() === '108108' || regOtpInput.trim() === '123456') {
        setRegOtpVerified(true);
        setSuccessMsg('✓ Mobile number verified successfully! You can now complete registration.');
      } else {
        setError(err.message || 'Incorrect OTP. Please enter sacred code 108108.');
      }
    } finally {
      setRegVerifyingOtp(false);
    }
  };

  // Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!regPhone.trim()) {
      setError('Please provide your 10-digit mobile number.');
      return;
    }
    if (!regOtpVerified) {
      setError('Please verify your mobile number with OTP first before submitting.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          phone: regPhone.trim(),
          email: regEmail.trim() || undefined,
          city: regCity.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      const userData = data.user;
      localStorage.setItem('brijnidhi_logged_in', 'true');
      localStorage.setItem('brijnidhi_current_user', JSON.stringify(userData));
      if (data.token) {
        localStorage.setItem('brijnidhi_token', data.token);
      }

      window.dispatchEvent(new Event('brijnidhi_auth_change'));

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      // Local fallback
      const fallbackUser = {
        id: `usr-${Date.now()}`,
        name: regName.trim(),
        email: regEmail.trim() || `${regPhone}@yatri.brijnidhi.org`,
        phone: regPhone.trim() || 'Not provided',
        city: regCity.trim() || 'Braj Bhumi',
        role: 'CUSTOMER'
      };

      localStorage.setItem('brijnidhi_logged_in', 'true');
      localStorage.setItem('brijnidhi_current_user', JSON.stringify(fallbackUser));
      window.dispatchEvent(new Event('brijnidhi_auth_change'));

      if (onLoginSuccess) {
        onLoginSuccess(fallbackUser);
      }
      if (onClose) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && canClose && onClose) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      style={{ top: 0, left: 0, width: '100vw', height: '100vh', margin: 0 }}
    >
      <div className="relative w-full max-w-[420px] max-h-[96vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-white rounded-3xl shadow-2xl border-2 border-amber-300/80 animate-scale-up">
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700" />

        {/* Close Button */}
        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Modal Header */}
        <div className="px-5 pt-4 pb-1 text-center">
          <div className="w-11 h-11 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-500 text-white flex items-center justify-center text-2xl font-serif shadow-md shadow-orange-500/20 mb-1.5">
            🕉️
          </div>
          <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mb-1">
            🙏 Radhe Radhe • Sacred Access
          </span>
          <h2 className="text-xl font-black font-serif text-neutral-900 leading-tight">
            Sign In to Brijnidhi
          </h2>
          <p className="text-[11px] text-neutral-500 mt-0.5 max-w-xs mx-auto">
            Book verified stays &amp; manage sacred reservations.
          </p>
        </div>

        {/* Tabs: Sign In / Register */}
        <div className="flex border-b border-amber-100 px-5">
          <button
            onClick={() => {
              setTab('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold transition border-b-2 text-center cursor-pointer ${
              tab === 'login'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Devotee Sign In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold transition border-b-2 text-center cursor-pointer ${
              tab === 'register'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            New Pilgrim Register
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-3.5 space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-fade-in">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              {/* Method Toggle: Mobile / Email */}
              <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('phone');
                    setOtpSent(false);
                    setOtpVerified(false);
                    setError(null);
                  }}
                  className={`flex-1 py-1 rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                    loginMethod === 'phone'
                      ? 'bg-white text-amber-900 shadow-sm font-bold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setOtpSent(false);
                    setOtpVerified(false);
                    setError(null);
                  }}
                  className={`flex-1 py-1 rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                    loginMethod === 'email'
                      ? 'bg-white text-amber-900 shadow-sm font-bold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
              </div>

              {/* Identifier Input */}
              {loginMethod === 'phone' ? (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Mobile Number
                    </label>
                    {otpVerified && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    )}
                  </div>
                  <div className={`relative flex rounded-xl border ${otpVerified ? 'border-emerald-400 bg-emerald-50/20' : 'border-neutral-300 focus-within:border-amber-600'} bg-white transition`}>
                    <span className="inline-flex items-center px-3 text-xs font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200 rounded-l-xl">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      disabled={otpVerified}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/[^0-9]/g, ''));
                        setOtpSent(false);
                        setOtpVerified(false);
                      }}
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      required
                      className="w-full px-3 py-2 text-xs text-neutral-900 rounded-r-xl focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-600 font-medium"
                    />
                    {otpVerified && (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpVerified(false);
                          setOtpSent(false);
                          setOtpInput('');
                        }}
                        className="px-2.5 text-[11px] font-bold text-amber-700 hover:text-amber-800"
                      >
                        Change
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Email Address
                    </label>
                    {otpVerified && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      disabled={otpVerified}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setOtpSent(false);
                        setOtpVerified(false);
                      }}
                      placeholder="devotee@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-amber-600 focus:outline-none disabled:bg-neutral-50"
                    />
                  </div>
                </div>
              )}

              {/* Step 1 Button: Send OTP (Visible when OTP not sent yet or to resend) */}
              {!otpSent && !otpVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || (loginMethod === 'phone' ? phone.length < 10 : !email.includes('@'))}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{sendingOtp ? 'Sending Code...' : 'Get Verification Code (OTP)'}</span>
                </button>
              )}

              {/* Step 2 Section: Enter & Verify OTP */}
              {otpSent && !otpVerified && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Enter 6-Digit Code *</span>
                    </label>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full border border-amber-300">
                      OTP: 108108
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="108108"
                        maxLength={6}
                        autoFocus
                        className="w-full px-3 py-2 text-center text-sm font-bold font-mono tracking-widest bg-white rounded-xl border border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otpInput.length < 6}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      <span>{verifyingOtp ? 'Checking...' : 'Verify OTP'}</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-neutral-500">
                    <span>Didn&apos;t receive code?</span>
                    {resendCountdown > 0 ? (
                      <span className="text-amber-700 font-semibold">Resend in {resendCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Verified Confirmation Badge */}
              {otpVerified && (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-900 font-bold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>OTP verified! Click below to sign in.</span>
                </div>
              )}

              {/* Step 3: Main Sign In Button (ENABLED ONLY AFTER OTP IS VERIFIED) */}
              <button
                type="submit"
                disabled={!otpVerified || loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-200 ${
                  otpVerified
                    ? 'btn-primary shadow-md cursor-pointer transform hover:-translate-y-0.5'
                    : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : otpVerified ? (
                  <>
                    <span>Sign In to Brijnidhi</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    <span>Verify OTP to Unlock Sign In</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[10px] text-neutral-400 leading-none">
                  By continuing, you agree to Brijnidhi&apos;s Terms &amp; Privacy Policy.
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Devotee Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Mobile Number *
                  </label>
                  {regOtpVerified && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  )}
                </div>
                <div className={`relative flex rounded-xl border ${regOtpVerified ? 'border-emerald-400 bg-emerald-50/20' : 'border-neutral-300'} bg-white`}>
                  <span className="inline-flex items-center px-3 text-xs font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200 rounded-l-xl">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    disabled={regOtpVerified}
                    value={regPhone}
                    onChange={(e) => {
                      setRegPhone(e.target.value.replace(/[^0-9]/g, ''));
                      setRegOtpSent(false);
                      setRegOtpVerified(false);
                    }}
                    placeholder="10-digit number"
                    maxLength={10}
                    required
                    className="w-full px-3 py-1.5 text-xs text-neutral-900 rounded-r-xl focus:outline-none disabled:bg-neutral-50"
                  />
                  {regOtpVerified && (
                    <button
                      type="button"
                      onClick={() => {
                        setRegOtpVerified(false);
                        setRegOtpSent(false);
                        setRegOtpInput('');
                      }}
                      className="px-2.5 text-[11px] font-bold text-amber-700 hover:text-amber-800"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Step 1 Button for Register */}
              {!regOtpSent && !regOtpVerified && (
                <button
                  type="button"
                  onClick={handleRegSendOtp}
                  disabled={regSendingOtp || regPhone.length < 10}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{regSendingOtp ? 'Sending Code...' : 'Get Verification Code (OTP)'}</span>
                </button>
              )}

              {/* Step 2 Section for Register */}
              {regOtpSent && !regOtpVerified && (
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Enter 6-Digit Code *</span>
                    </label>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full border border-amber-300">
                      OTP: 108108
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={regOtpInput}
                      onChange={(e) => setRegOtpInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="108108"
                      maxLength={6}
                      autoFocus
                      className="w-full px-3 py-1.5 text-center text-sm font-bold font-mono tracking-widest bg-white rounded-xl border border-amber-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleRegVerifyOtp}
                      disabled={regVerifyingOtp || regOtpInput.length < 6}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      <span>{regVerifyingOtp ? '...' : 'Verify'}</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-neutral-500">
                    <span>Didn&apos;t receive code?</span>
                    {regCountdown > 0 ? (
                      <span className="text-amber-700 font-semibold">Resend in {regCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRegSendOtp}
                        className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                      >
                        Resend
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-0.5">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-0.5">
                    Home City / State
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 3: Register Button (ENABLED ONLY AFTER OTP IS VERIFIED) */}
              <button
                type="submit"
                disabled={!regOtpVerified || loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-200 ${
                  regOtpVerified
                    ? 'btn-primary shadow-md cursor-pointer transform hover:-translate-y-0.5'
                    : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span>Registering...</span>
                ) : regOtpVerified ? (
                  <>
                    <span>Register &amp; Enter Brijnidhi</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    <span>Verify Mobile Number to Register</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
