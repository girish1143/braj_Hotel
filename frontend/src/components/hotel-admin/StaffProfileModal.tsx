'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Briefcase, Building2, Calendar, Shield, X, Check, RefreshCw, AlertCircle, Save } from 'lucide-react';
import { StaffAccount } from './types';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffAccount;
  onProfileUpdated: (updatedStaff: StaffAccount) => void;
}

export default function StaffProfileModal({
  isOpen,
  onClose,
  staff,
  onProfileUpdated
}: StaffProfileModalProps) {
  const [fullName, setFullName] = useState(staff.fullName);
  const [email, setEmail] = useState(staff.email);
  const [phone, setPhone] = useState(staff.phone);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Full name, email, and phone number are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/hotel-admin/staff/${staff.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      setSuccessMsg('Profile updated successfully!');
      onProfileUpdated(data.data);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Profile update failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-amber-200 space-y-5 text-neutral-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            Staff Identity Card
          </span>
          <h3 className="font-serif font-black text-2xl text-neutral-900 mt-1">
            My Staff Profile
          </h3>
          <p className="text-xs text-neutral-500">
            View employee identity details and update permitted contact information.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Read-Only System Identity Details (Role-Based Protected) */}
        <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-amber-200 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Employee ID</span>
            <span className="font-mono font-bold text-amber-900 text-sm mt-0.5 block">{staff.employeeId}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Assigned Role</span>
            <span className="font-bold text-neutral-900 mt-0.5 block">{staff.role}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Department</span>
            <span className="font-semibold text-neutral-800 mt-0.5 block">{staff.department}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Joining Date</span>
            <span className="font-mono text-neutral-600 mt-0.5 block">{staff.joiningDate}</span>
          </div>
        </div>

        {/* Editable Permitted Contact Details */}
        <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs font-semibold">
          <div>
            <label className="text-neutral-700 block mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-[#fdfbf7] text-neutral-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-neutral-700 block mb-1">Official Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-[#fdfbf7] text-neutral-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="text-neutral-700 block mb-1">Contact Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-[#fdfbf7] text-neutral-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-amber-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
