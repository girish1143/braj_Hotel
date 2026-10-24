'use client';

import React from 'react';
import {
  LogOut,
  Lock,
  X,
  AlertTriangle,
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { OperatorSession, ShiftCashRecord } from './types';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  onLockDeskInstead: () => void;
  currentOperator: OperatorSession;
  shiftRecord?: ShiftCashRecord;
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirmLogout,
  onLockDeskInstead,
  currentOperator,
  shiftRecord
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-amber-200 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <LogOut className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-700 bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full">
              Operator Shift Termination
            </span>
            <h3 className="font-serif font-black text-neutral-900 text-xl mt-1.5">
              End Shift &amp; Sign Out?
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
              You are signed in as <strong className="text-neutral-900">{currentOperator.name}</strong> ({currentOperator.role}).
            </p>
          </div>
        </div>

        {/* Shift Audit Warning & Status Box */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950 block">
                Security &amp; Cash Reconciliation Checklist
              </span>
              <p className="text-amber-900/80 text-[11px] leading-relaxed">
                Logging out terminates your authenticated front desk token, clears cached session keys, and records an immutable logout timestamp in the audit logs.
              </p>
            </div>
          </div>

          {shiftRecord && (
            <div className="pt-2 border-t border-amber-200/70 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/80 p-2 rounded-xl border border-amber-200/50">
                <span className="text-neutral-500 block text-[10px]">Shift Type</span>
                <span className="font-bold text-neutral-900 truncate block">{currentOperator.shift}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-amber-200/50">
                <span className="text-neutral-500 block text-[10px]">Drawer Cash</span>
                <span className="font-bold text-emerald-800">₹{shiftRecord.actualDrawerCount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Temporary Step-Away Tip */}
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-neutral-700 text-[11px]">
              Just stepping away for a few minutes?
            </span>
          </div>
          <button
            type="button"
            onClick={onLockDeskInstead}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
          >
            Lock Desk Instead
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onConfirmLogout}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Confirm &amp; Terminate Session</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Cancel / Stay Signed In
          </button>
        </div>
      </div>
    </div>
  );
}
