'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  User,
  LogOut,
  ChevronRight,
  Sparkles,
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Building,
  RefreshCw
} from 'lucide-react';
import { OperatorSession } from './types';

interface TerminalLockScreenProps {
  mode: 'LOCKED' | 'LOGGED_OUT';
  currentOperator: OperatorSession;
  availableOperators: OperatorSession[];
  hotelName: string;
  propertyCode?: string;
  onUnlock: (operator: OperatorSession) => void;
  onFullLogout?: () => void;
  onSwitchStaff?: () => void;
  onSwitchProperty?: () => void;
}

export default function TerminalLockScreen({
  mode,
  currentOperator,
  availableOperators,
  hotelName,
  propertyCode,
  onUnlock,
  onFullLogout,
  onSwitchStaff,
  onSwitchProperty
}: TerminalLockScreenProps) {
  const [selectedStaff, setSelectedStaff] = useState<OperatorSession>(currentOperator);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [showPin, setShowPin] = useState(false);

  // Sync selectedStaff when currentOperator changes
  useEffect(() => {
    setSelectedStaff(currentOperator);
  }, [currentOperator]);

  // Countdown timer for security lockout
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Handle PIN unlock attempt
  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutRemaining > 0) return;

    const trimmed = pin.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your 4-digit security PIN.');
      return;
    }

    // Verify PIN for selected staff (also allow 3003 for Amit Verma)
    const isCorrect =
      selectedStaff.pin === trimmed ||
      (selectedStaff.id === 'op-3' && trimmed === '3003') ||
      trimmed === '108108'; // Sacred master bypass for demo/testing

    if (isCorrect) {
      setErrorMsg('');
      setFailedAttempts(0);
      setPin('');
      onUnlock(selectedStaff);
    } else {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      setPin('');
      if (attempts >= 5) {
        setLockoutRemaining(60);
        setErrorMsg('Security lockout: 5 failed PIN attempts. Terminal locked for 60 seconds.');
      } else {
        setErrorMsg(`Incorrect security PIN. (${5 - attempts} attempts remaining before lockout).`);
      }
    }
  };

  const handleKeyPress = (num: string) => {
    if (lockoutRemaining > 0) return;
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin.length === 4) {
        // Auto-verify when 4 digits reached
        setTimeout(() => {
          const isCorrect =
            selectedStaff.pin === nextPin ||
            (selectedStaff.id === 'op-3' && nextPin === '3003') ||
            nextPin === '108108';
          if (isCorrect) {
            setErrorMsg('');
            setFailedAttempts(0);
            setPin('');
            onUnlock(selectedStaff);
          } else {
            const attempts = failedAttempts + 1;
            setFailedAttempts(attempts);
            setPin('');
            if (attempts >= 5) {
              setLockoutRemaining(60);
              setErrorMsg('Security lockout: 5 failed PIN attempts. Terminal locked for 60 seconds.');
            } else {
              setErrorMsg(`Incorrect PIN. (${5 - attempts} attempts left).`);
            }
          }
        }, 150);
      }
    }
  };

  const handleClearPin = () => {
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto">
      {/* Background Spiritual Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,#b45309_0%,transparent_60%)]" />

      <div className="relative z-10 w-full max-w-lg bg-neutral-900 border border-amber-900/60 rounded-3xl shadow-2xl p-6 sm:p-8 text-white space-y-6">
        {/* Brand & Security Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            {propertyCode && (
              <span className="font-mono text-xs font-black bg-neutral-950 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-600/50">
                {propertyCode}
              </span>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 text-[10px] uppercase font-bold tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Brijnidhi PMS Enterprise Security</span>
            </div>
          </div>

          <h2 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide">
            {hotelName}
          </h2>

          {onSwitchProperty && (
            <div>
              <button
                type="button"
                onClick={onSwitchProperty}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Switch to Another Braj Hotel</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-amber-200/80">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              {mode === 'LOCKED'
                ? 'Front Desk Workstation Locked (Data Privacy Active)'
                : 'Terminal Session Closed • Operator Sign-In Required'}
            </span>
          </div>
        </div>

        {/* Lock / Logged Out Indicator Card */}
        <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              {mode === 'LOCKED' ? 'Active Session Holder' : 'Select Staff Account:'}
            </span>
            <span className="text-[10px] font-mono bg-neutral-900 text-amber-400 px-2 py-0.5 rounded border border-neutral-700">
              {selectedStaff.role}
            </span>
          </div>

          {/* Mode 1: LOCKED (Single user unlock with switch option) */}
          {mode === 'LOCKED' ? (
            <div className="flex items-center justify-between bg-neutral-900/80 p-3 rounded-xl border border-neutral-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-sm shadow">
                  {selectedStaff.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedStaff.name}</h4>
                  <p className="text-xs text-amber-300/80 font-mono">
                    {selectedStaff.shift}
                  </p>
                </div>
              </div>

              {onSwitchStaff && (
                <button
                  type="button"
                  onClick={onSwitchStaff}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline"
                >
                  Switch Staff
                </button>
              )}
            </div>
          ) : (
            /* Mode 2: LOGGED OUT (Pick staff account) */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {availableOperators.map(op => {
                const isSelected = selectedStaff.id === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      setSelectedStaff(op);
                      setPin('');
                      setErrorMsg('');
                    }}
                    className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-600/30 border-amber-500 text-white shadow-md'
                        : 'bg-neutral-900/80 hover:bg-neutral-900 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-6 h-6 rounded-full bg-amber-500/80 text-neutral-950 font-bold flex items-center justify-center text-[11px]">
                        {op.name.charAt(0)}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-white truncate">{op.name}</span>
                      <span className="text-[10px] text-amber-300/80 block truncate">{op.role}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4-Digit PIN Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Enter 4-Digit Security PIN:</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPin(prev => !prev)}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
              >
                {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPin ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>

            {/* PIN Display Dots */}
            <div className="flex items-center justify-center gap-4 py-3 bg-neutral-950 rounded-2xl border border-neutral-800 mb-3">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > idx
                      ? 'bg-amber-500 border-amber-400 scale-110 shadow-sm shadow-amber-500/50'
                      : 'border-neutral-700 bg-neutral-900'
                  }`}
                >
                  {showPin && pin.length > idx && (
                    <span className="text-[10px] text-neutral-950 font-bold flex items-center justify-center h-full">
                      {pin[idx]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Number Keypad for Rapid Touchscreen / Mouse entry */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(k => (
                <button
                  key={k}
                  type="button"
                  disabled={lockoutRemaining > 0}
                  onClick={() => {
                    if (k === 'C') handleClearPin();
                    else if (k === '⌫') setPin(prev => prev.slice(0, -1));
                    else handleKeyPress(k);
                  }}
                  className={`py-2.5 rounded-xl text-sm font-bold font-mono transition active:scale-95 ${
                    k === 'C' || k === '⌫'
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-amber-600/40 shadow-xs'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Security Lockout Banner */}
          {lockoutRemaining > 0 && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/80 rounded-2xl text-center space-y-1">
              <span className="text-xs font-black text-rose-300 flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Anti-Brute Force Protection Active
              </span>
              <p className="text-[11px] text-rose-200">
                Too many incorrect attempts. Terminal locked for <strong className="font-mono font-bold">{lockoutRemaining}s</strong>.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && lockoutRemaining === 0 && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-600/50 rounded-xl text-center">
              <p className="text-xs text-rose-300 font-semibold">{errorMsg}</p>
            </div>
          )}

          {/* Submit / Unlock Button */}
          <button
            type="submit"
            disabled={pin.length < 4 || lockoutRemaining > 0}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>{mode === 'LOCKED' ? 'Unlock Front Desk Terminal' : 'Authenticate & Open Workstation'}</span>
          </button>

          {/* Fast Shift Hint for Quick Testing */}
          <p className="text-center text-[10px] text-neutral-400">
            ⚡ Operator PIN: <strong className="text-amber-400 font-mono">{selectedStaff.pin}</strong> (or master PIN <strong className="text-amber-400 font-mono">108108</strong>)
          </p>
        </form>

        {/* Footer Security Controls */}
        <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
          {mode === 'LOCKED' && onFullLogout && (
            <button
              type="button"
              onClick={onFullLogout}
              className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Full Sign Out</span>
            </button>
          )}

          <div className="flex items-center space-x-3 text-[11px] ml-auto">
            <Link href="/" className="hover:text-amber-300 transition">
              Public Portal
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-amber-300 transition">
              Super Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
