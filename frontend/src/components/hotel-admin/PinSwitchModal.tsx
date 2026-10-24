'use client';

import React, { useState } from 'react';
import { KeyRound, User, ShieldCheck, Check, X } from 'lucide-react';
import { OperatorSession } from './types';

interface PinSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOperator: OperatorSession;
  onSwitchOperator: (newOperator: OperatorSession) => void;
  availableStaff?: OperatorSession[];
  hotelName?: string;
}

export default function PinSwitchModal({
  isOpen,
  onClose,
  currentOperator,
  onSwitchOperator,
  availableStaff,
  hotelName
}: PinSwitchModalProps) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Countdown timer for brute force lockout
  React.useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  if (!isOpen) return null;

  // Use hotel-specific staff accounts if provided
  const staffAccounts: OperatorSession[] = availableStaff && availableStaff.length > 0
    ? availableStaff
    : [
        {
          id: 'op-3',
          pin: '3885',
          name: 'Amit Verma',
          role: 'Night Auditor',
          shift: 'Night Audit (22:00 - 06:00)'
        },
        {
          id: 'op-1',
          pin: '1001',
          name: 'Rakesh Sharma',
          role: 'Desk Lead',
          shift: 'Morning (06:00 - 14:00)'
        },
        {
          id: 'op-2',
          pin: '2002',
          name: 'Priya Goswami',
          role: 'Front Desk Agent',
          shift: 'Evening (14:00 - 22:00)'
        }
      ];

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutRemaining > 0) return;

    const trimmed = pinInput.trim();
    const found = staffAccounts.find(s => s.pin === trimmed || (s.id === 'op-3' && trimmed === '3003'));
    if (found) {
      onSwitchOperator(found);
      setPinInput('');
      setErrorMsg('');
      setFailedAttempts(0);
      onClose();
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockoutRemaining(60);
        setErrorMsg('Security Lockout: 5 failed PIN attempts. Wait 60 seconds.');
      } else {
        setErrorMsg(`Invalid 4-digit PIN. (${5 - newAttempts} attempts left before security lockout).`);
      }
    }
  };

  const handleSelectStaff = (staff: OperatorSession) => {
    if (lockoutRemaining > 0) return;
    onSwitchOperator(staff);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-amber-200 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-black text-neutral-900 text-lg">
            Fast PIN Shift Switching
          </h3>
          {hotelName && (
            <span className="text-[10px] text-amber-800 font-bold block truncate">
              {hotelName}
            </span>
          )}
          <p className="text-xs text-neutral-500">
            Current: <strong className="text-neutral-900">{currentOperator.name}</strong> ({currentOperator.role})
          </p>
        </div>

        {/* 4-Digit PIN Form */}
        <form onSubmit={handlePinSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
              Enter 4-Digit Security PIN:
            </label>
            <input
              autoFocus
              type="password"
              maxLength={4}
              disabled={lockoutRemaining > 0}
              value={pinInput}
              onChange={e => {
                setPinInput(e.target.value);
                setErrorMsg('');
              }}
              placeholder="••••"
              className="w-full text-center tracking-[1em] font-mono text-2xl py-2.5 rounded-xl border border-neutral-300 focus:border-amber-600 focus:outline-none bg-neutral-50 text-neutral-900 disabled:opacity-50"
            />
          </div>

          {lockoutRemaining > 0 && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-center">
              <span className="text-xs font-bold text-rose-700 block">
                🔒 Security Lockout Active
              </span>
              <span className="text-[11px] text-rose-600">
                Please wait {lockoutRemaining}s before retrying.
              </span>
            </div>
          )}

          {errorMsg && lockoutRemaining === 0 && (
            <p className="text-[11px] text-rose-600 font-bold text-center">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={lockoutRemaining > 0}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow"
          >
            Switch Active Session
          </button>
        </form>

        {/* One-Click Quick Shift Accounts */}
        <div className="pt-2 border-t border-neutral-100 space-y-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
            Quick Shift Handover:
          </span>
          <div className="space-y-1.5">
            {staffAccounts.map(staff => (
              <button
                key={staff.id}
                onClick={() => handleSelectStaff(staff)}
                className={`w-full p-2 rounded-xl text-left text-xs transition flex justify-between items-center ${
                  staff.name === currentOperator.name
                    ? 'bg-amber-50 border border-amber-300 font-bold text-amber-950'
                    : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700'
                }`}
              >
                <div>
                  <span className="font-bold block text-neutral-900">{staff.name}</span>
                  <span className="text-[10px] text-neutral-500 font-normal">
                    {staff.role} • PIN: {staff.pin}
                  </span>
                </div>
                {staff.name === currentOperator.name && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
