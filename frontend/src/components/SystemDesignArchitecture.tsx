'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Building2,
  User,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  CreditCard,
  Search,
  Key,
  Database,
  Eye,
  FileCheck
} from 'lucide-react';

export default function SystemDesignArchitecture() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'system-admin' | 'hotel-admin' | 'customer'>('architecture');

  return (
    <div className="card-temple p-6 sm:p-10 border-2 border-amber-300/80 shadow-temple-lg bg-gradient-to-b from-[#fffcf7] via-white to-amber-50/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-200/80 pb-6 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-black uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>3-Tier Platform Architecture &amp; System Design</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif text-neutral-900">
            Brijnidhi System Architecture
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
            A specialized three-tier role-based system separating global platform governance, multi-tenant hotel inventory, and devotional customer bookings.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-amber-100/60 rounded-2xl border border-amber-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'architecture'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-neutral-700 hover:text-amber-900 hover:bg-amber-200/50'
            }`}
          >
            System Diagram
          </button>
          <button
            onClick={() => setActiveTab('system-admin')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'system-admin'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-neutral-700 hover:text-amber-900 hover:bg-amber-200/50'
            }`}
          >
            1. System Admin
          </button>
          <button
            onClick={() => setActiveTab('hotel-admin')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'hotel-admin'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-neutral-700 hover:text-amber-900 hover:bg-amber-200/50'
            }`}
          >
            2. Hotel Admin
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'customer'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-neutral-700 hover:text-amber-900 hover:bg-amber-200/50'
            }`}
          >
            3. Customer
          </button>
        </div>
      </div>

      {/* TAB 1: VISUAL ARCHITECTURE DIAGRAM */}
      {activeTab === 'architecture' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Visual Role Hierarchy Tree */}
          <div className="bg-amber-950/5 border border-amber-200 rounded-3xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-xs uppercase tracking-widest shadow-md">
                🕉️ BRIJNIDHI CORE PLATFORM
              </span>
            </div>

            {/* Tree Branch Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Role 1: System Admin */}
              <div className="bg-white rounded-2xl border-2 border-red-200 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center space-x-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">SYSTEM ADMIN</h3>
                    <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Entire Platform</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                  Controls global marketplace, approves/rejects hotel listings, monitors commissions, user accounts, and platform audits.
                </p>

                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-[11px] space-y-1 text-neutral-700 mb-4">
                  <div className="flex items-center justify-between">
                    <span>• Hotel Approvals:</span>
                    <span className="font-bold text-amber-700">12 Pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Active Hotels:</span>
                    <span className="font-bold text-emerald-700">221 Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Total Devotees:</span>
                    <span className="font-bold text-neutral-900">18,542</span>
                  </div>
                </div>

                <Link
                  href="/admin"
                  className="w-full btn-secondary text-xs py-2 flex items-center justify-center text-red-950 border-red-300 hover:bg-red-50"
                >
                  <span>Open Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>

              {/* Role 2: Hotel Admin */}
              <div className="bg-white rounded-2xl border-2 border-amber-300 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center space-x-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">HOTEL ADMIN / OWNER</h3>
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Own Hotel Only</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                  Isolated tenant dashboard. Manages room inventory, pricing matrices, booking check-in/out, and calendar availability.
                </p>

                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-[11px] space-y-1 text-neutral-700 mb-4">
                  <div className="flex items-center justify-between">
                    <span>• Available Rooms:</span>
                    <span className="font-bold text-emerald-700">27 Rooms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Today&apos;s Check-ins:</span>
                    <span className="font-bold text-amber-700">14 Guests</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Tenant Isolation:</span>
                    <span className="font-bold text-emerald-600 flex items-center"><Lock className="w-2.5 h-2.5 mr-0.5" /> Enforced</span>
                  </div>
                </div>

                <Link
                  href="/hotel/dashboard"
                  className="w-full btn-secondary text-xs py-2 flex items-center justify-center text-amber-950 border-amber-300 hover:bg-amber-50"
                >
                  <span>Open Hotel Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>

              {/* Role 3: Customer Devotee */}
              <div className="bg-white rounded-2xl border-2 border-emerald-300 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center space-x-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">CUSTOMER / DEVOTEE</h3>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Yatra Booking</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                  Devotees search stays close to sacred temples, filter 100% Satvik kitchens, view aarti schedules, and print booking vouchers.
                </p>

                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-[11px] space-y-1 text-neutral-700 mb-4">
                  <div className="flex items-center justify-between">
                    <span>• 4 Destinations:</span>
                    <span className="font-bold text-neutral-900">Mathura, Vrn, Bar, Gov</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Satvik Guarantee:</span>
                    <span className="font-bold text-emerald-700">No Onion, No Garlic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Yatra Voucher:</span>
                    <span className="font-bold text-amber-700">Printable &amp; Verified</span>
                  </div>
                </div>

                <Link
                  href="/account"
                  className="w-full btn-secondary text-xs py-2 flex items-center justify-center text-emerald-950 border-emerald-300 hover:bg-emerald-50"
                >
                  <span>View Devotee Account</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Core Security & Architectural Principles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs mb-1">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Strict Tenant Isolation</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Hotel Admins cannot access or view another hotel’s rooms, revenue, bookings, or guest data.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs mb-1">
                <FileCheck className="w-4 h-4 text-amber-700" />
                <span>Audit Trail Logging</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                All status modifications, approvals, suspensions, and price updates are recorded in immutable audit logs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs mb-1">
                <Database className="w-4 h-4 text-amber-700" />
                <span>Dynamic Calendar Matrix</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                October 2026 interactive calendar matrix with click-to-toggle availability per room category.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Satvik &amp; Darshan Verified</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Custom schema fields for temple darshan shuttle, luggage lockers, and pure satvik kitchen certification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM ADMIN DETAILS */}
      {activeTab === 'system-admin' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-50/70 p-5 rounded-2xl border border-red-200">
            <div>
              <span className="text-xs uppercase font-black text-red-700 tracking-wider">Role 1 Details</span>
              <h3 className="text-xl font-bold font-serif text-neutral-900">System Admin Portal (`/admin`)</h3>
              <p className="text-xs text-neutral-600 mt-1">
                Global authority overseeing 248 total hotels, ₹1,84,500 daily revenue, approvals queue, and fraud prevention.
              </p>
            </div>
            <Link href="/admin" className="btn-primary text-xs py-2.5 px-4 whitespace-nowrap">
              Launch System Admin (`/admin`)
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-2">
              <h4 className="font-bold text-neutral-900 text-sm">Key Capabilities:</h4>
              <ul className="space-y-1.5 text-neutral-600">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Approve / Reject hotel onboardings</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Suspend malicious hotel accounts or users</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Track 10% platform commission on ₹1,84,500 revenue</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Review audit trail history with IP addresses &amp; timestamps</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-2">
              <h4 className="font-bold text-neutral-900 text-sm">Current Platform Statistics:</h4>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-lg font-black text-amber-900 block">248</span>
                  <span className="text-[10px] text-amber-700 font-bold">Total Hotels</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-lg font-black text-emerald-900 block">221</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Active Hotels</span>
                </div>
                <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200">
                  <span className="text-lg font-black text-sky-900 block">18,542</span>
                  <span className="text-[10px] text-sky-700 font-bold">Registered Users</span>
                </div>
                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-lg font-black text-purple-900 block">12</span>
                  <span className="text-[10px] text-purple-700 font-bold">Pending Approvals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HOTEL ADMIN DETAILS */}
      {activeTab === 'hotel-admin' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50/70 p-5 rounded-2xl border border-amber-200">
            <div>
              <span className="text-xs uppercase font-black text-amber-800 tracking-wider">Role 2 Details</span>
              <h3 className="text-xl font-bold font-serif text-neutral-900">Hotel Partner Portal (`/hotel/dashboard`)</h3>
              <p className="text-xs text-neutral-600 mt-1">
                Property management dashboard isolated strictly to the owner&apos;s property with real-time room availability matrix.
              </p>
            </div>
            <Link href="/hotel/dashboard" className="btn-primary text-xs py-2.5 px-4 whitespace-nowrap">
              Launch Hotel Dashboard (`/hotel/dashboard`)
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-2">
              <h4 className="font-bold text-neutral-900 text-sm">Key Capabilities:</h4>
              <ul className="space-y-1.5 text-neutral-600">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Manage rooms: Delux, Executive, Family Satsang Suite</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Update price per night &amp; seasonal Braj festival surges</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Check-in &amp; Check-out yatri bookings with instant badge update</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Interactive October 2026 calendar matrix with click-to-toggle availability</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-2">
              <h4 className="font-bold text-neutral-900 text-sm">Property Live Snapshot (Shri Banke Bihari Palace):</h4>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-lg font-black text-emerald-900 block">27</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Available Rooms</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-lg font-black text-amber-900 block">18</span>
                  <span className="text-[10px] text-amber-700 font-bold">Occupied Rooms</span>
                </div>
                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-lg font-black text-purple-900 block">14</span>
                  <span className="text-[10px] text-purple-700 font-bold">Bookings Today</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-lg font-black text-emerald-900 block">₹32,400</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Today Revenue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER DETAILS */}
      {activeTab === 'customer' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200">
            <div>
              <span className="text-xs uppercase font-black text-emerald-800 tracking-wider">Role 3 Details</span>
              <h3 className="text-xl font-bold font-serif text-neutral-900">Devotee Booking Portal (`/stays`, `/account`)</h3>
              <p className="text-xs text-neutral-600 mt-1">
                Devotee search, filter by temple landmark proximity, pure satvik food assurance, and print booking vouchers.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/stays" className="btn-primary text-xs py-2.5 px-4 whitespace-nowrap">
                Browse Stays (`/stays`)
              </Link>
              <Link href="/account" className="btn-secondary text-xs py-2.5 px-4 whitespace-nowrap">
                My Bookings (`/account`)
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-2">
              <h4 className="font-bold text-neutral-900 text-sm">Customer Journey Features:</h4>
              <ul className="space-y-1.5 text-neutral-600">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Search by landmark: Banke Bihari, Janmasthan, Radha Rani, Govardhan Parikrama</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> 100% Satvik pure veg toggle (strictly no onion, no garlic)</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Darshan pass assistance &amp; temple shuttle service requests</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Download &amp; print clean pilgrimage booking vouchers with QR codes</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-2">
              <h4 className="font-bold text-neutral-900 text-sm">Devotee Protection:</h4>
              <ul className="space-y-2 text-neutral-600">
                <li className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-950 block">Guaranteed Walking Proximity</span>
                  <span className="text-[11px] text-emerald-800">Clear meters distance to sanctum sanctorums avoiding misleading claims.</span>
                </li>
                <li className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-950 block">Verified Satvik Kitchens</span>
                  <span className="text-[11px] text-amber-800">Brijnidhi team physically verifies kitchen compliance before onboarding.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
