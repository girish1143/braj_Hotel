'use client';

import React, { useState } from 'react';
import {
  IndianRupee,
  QrCode,
  Receipt,
  Utensils,
  Shirt,
  Compass,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CreditCard,
  Banknote,
  Send,
  Calculator,
  UserCheck,
  Building
} from 'lucide-react';
import { FolioItem, PMSBooking, PMSRoom, ShiftCashRecord } from './types';

interface BillingFolioPOSProps {
  folios: FolioItem[];
  bookings: PMSBooking[];
  rooms: PMSRoom[];
  shiftRecord: ShiftCashRecord;
  operatorName: string;
  onAddFolioItem: (item: FolioItem) => void;
  onSettleFolio: (bookingId: string, method: 'UPI' | 'CASH' | 'CARD') => void;
  onUpdateShiftBalance: (actualCashCount: number, notes?: string) => void;
  onCloseShift: () => void;
  onLogAudit: (action: string, module: 'Front Desk' | 'Tape Chart' | 'Housekeeping' | 'POS & Billing' | 'Shift Balance', details: string) => void;
}

export default function BillingFolioPOS({
  folios,
  bookings,
  rooms,
  shiftRecord,
  operatorName,
  onAddFolioItem,
  onSettleFolio,
  onUpdateShiftBalance,
  onCloseShift,
  onLogAudit
}: BillingFolioPOSProps) {
  const [activeTab, setActiveTab] = useState<'folio' | 'dynamic_qr' | 'shift_balance'>('folio');

  // Currently Selected In-House Guest Folio
  const inHouseBookings = bookings.filter(b => b.bookingStatus === 'CHECKED_IN');
  const [selectedBookingId, setSelectedBookingId] = useState<string>(inHouseBookings[0]?.id || '');

  // Add Item to Folio State
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemData, setNewItemData] = useState<{
    category: FolioItem['category'];
    description: string;
    amount: number;
  }>({
    category: 'RESTAURANT',
    description: 'Special Satvik Thali x2 + Mathura Peda',
    amount: 550
  });

  // Shift Drawer Actual Count Input
  const [inputActualCash, setInputActualCash] = useState<number>(shiftRecord.actualDrawerCount);
  const [shiftNotes, setShiftNotes] = useState<string>('');

  const activeBooking = bookings.find(b => b.id === selectedBookingId);
  const activeFolios = folios.filter(f => f.bookingId === selectedBookingId);
  const roomBaseCharge = activeBooking ? activeBooking.roomRate : 0;
  const extraCharges = activeFolios.reduce((s, f) => s + f.amount, 0);
  const grandTotal = roomBaseCharge + extraCharges;
  const unpaidItems = activeFolios.filter(f => !f.paid);
  const pendingBalance = (activeBooking?.bookingStatus === 'CHECKED_IN' ? roomBaseCharge : 0) + unpaidItems.reduce((s, f) => s + f.amount, 0);

  // Dynamic UPI URL & QR representation
  const upiId = 'brijnidhi@icici';
  const upiUrl = `upi://pay?pa=${upiId}&pn=Brijnidhi%20Dham%20Stay&am=${pendingBalance || grandTotal}&cu=INR&tn=Folio-${activeBooking?.bookingReference || 'POS'}`;

  // Pre-configured Quick POS Items for Braj Yatra
  const quickPosItems = [
    { category: 'RESTAURANT', desc: 'Satvik Desi Ghee Thali (Single)', price: 250 },
    { category: 'RESTAURANT', desc: 'Braj Matka Rabdi & Peda Box', price: 200 },
    { category: 'LAUNDRY', desc: 'Dhobi Steam Ironing & Wash (Set of 4)', price: 180 },
    { category: 'DARSHAN_PASS', desc: 'Bankey Bihari VIP Darshan Escort Pass', price: 500 },
    { category: 'TRANSPORT', desc: 'E-Rickshaw Parikrama 4hr Tour', price: 400 },
  ];

  const handleAddQuickItem = (desc: string, category: any, price: number) => {
    if (!activeBooking) return;
    const item: FolioItem = {
      id: `fol-${Date.now()}`,
      bookingId: activeBooking.id,
      roomNumber: activeBooking.roomNumber,
      description: desc,
      category,
      amount: price,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paid: false
    };
    onAddFolioItem(item);
  };

  const handleCustomItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;
    const item: FolioItem = {
      id: `fol-${Date.now()}`,
      bookingId: activeBooking.id,
      roomNumber: activeBooking.roomNumber,
      description: newItemData.description,
      category: newItemData.category,
      amount: Number(newItemData.amount),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paid: false
    };
    onAddFolioItem(item);
    setShowAddItemModal(false);
  };

  // Expected Drawer Calculation
  const expectedCashDrawer = shiftRecord.openingFloat + shiftRecord.cashCollections - shiftRecord.cashPayouts;
  const currentDiscrepancy = inputActualCash - expectedCashDrawer;

  return (
    <div className="space-y-6">
      {/* Header & KPI Bar */}
      <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-900 text-white rounded-3xl p-6 shadow-xl border border-amber-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
              <IndianRupee className="w-4 h-4 text-amber-400" />
              <span>Module 4 • Billing, POS &amp; Cash Reconciliation</span>
              <span className="text-amber-500">•</span>
              <span className="text-emerald-400 font-mono">End-of-Day Audit &lt; 1 Click</span>
            </div>
            <h2 className="text-2xl font-serif font-black text-white">
              Unified Room Folio &amp; Smart Cash Register
            </h2>
            <p className="text-xs text-amber-200/80 mt-1 max-w-xl">
              One master running tab for room fees, satvik meals, laundry, and e-rickshaws. Generates dynamic UPI QR codes and balances shift cash drawers with zero leakage.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('folio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'folio'
                  ? 'bg-amber-500 text-neutral-950 shadow-lg'
                  : 'bg-amber-900/60 hover:bg-amber-800 text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Unified Folio ({inHouseBookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dynamic_qr')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'dynamic_qr'
                  ? 'bg-amber-500 text-neutral-950 shadow-lg'
                  : 'bg-amber-900/60 hover:bg-amber-800 text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Dynamic UPI QR</span>
            </button>

            <button
              onClick={() => setActiveTab('shift_balance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'shift_balance'
                  ? 'bg-emerald-500 text-neutral-950 shadow-lg'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Shift Register</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: UNIFIED ROOM FOLIO & POS */}
      {activeTab === 'folio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Room Selector & Quick POS Charge Bar */}
          <div className="lg:col-span-5 space-y-5">
            {/* Guest Selector */}
            <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block">
                Select In-House Room / Guest Folio:
              </label>

              {inHouseBookings.length === 0 ? (
                <div className="p-4 bg-amber-50 text-amber-900 rounded-2xl text-xs text-center border border-amber-200">
                  No active in-house guests right now. Check-in a guest at Front Desk to manage folios.
                </div>
              ) : (
                <div className="space-y-2">
                  {inHouseBookings.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBookingId(b.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition flex justify-between items-center ${
                        b.id === selectedBookingId
                          ? 'bg-amber-50 border-amber-500 shadow-sm'
                          : 'bg-neutral-50/70 hover:bg-neutral-100 border-neutral-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm text-neutral-900">
                            Room {b.roomNumber}
                          </span>
                          <span className="font-bold text-xs text-neutral-800">
                            {b.customer}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 block mt-0.5">
                          Ref: {b.bookingReference} • {b.guests} Guests
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-700" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick POS One-Click Charge Bar */}
            {activeBooking && (
              <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Quick Add to Room {activeBooking.roomNumber}:
                  </span>
                  <button
                    onClick={() => setShowAddItemModal(true)}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Custom Item</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {quickPosItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddQuickItem(item.desc, item.category, item.price)}
                      className="p-2.5 rounded-xl border border-neutral-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition flex justify-between items-center text-xs group"
                    >
                      <div className="flex items-center space-x-2">
                        {item.category === 'RESTAURANT' ? (
                          <Utensils className="w-3.5 h-3.5 text-amber-700" />
                        ) : item.category === 'LAUNDRY' ? (
                          <Shirt className="w-3.5 h-3.5 text-blue-700" />
                        ) : (
                          <Compass className="w-3.5 h-3.5 text-purple-700" />
                        )}
                        <span className="font-semibold text-neutral-800">{item.desc}</span>
                      </div>
                      <span className="font-bold text-neutral-900 group-hover:text-amber-800 font-mono">
                        +₹{item.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Unified Folio Itemized Statement */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6">
            {activeBooking ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                      Live Running Tab
                    </span>
                    <h3 className="text-xl font-bold font-serif text-neutral-900 mt-1">
                      Folio: {activeBooking.customer}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono">
                      Room {activeBooking.roomNumber} • Ref: {activeBooking.bookingReference} • Phone: {activeBooking.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-400 block">Pending Settle</span>
                    <span className="text-2xl font-black font-serif text-amber-950">
                      ₹{pendingBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Folio Items Table */}
                <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-amber-50 text-amber-950 font-bold uppercase text-[10px] tracking-wider border-b border-amber-200">
                      <tr>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-700">
                      {/* Base Room Rate */}
                      <tr className="bg-neutral-50/50 font-semibold">
                        <td className="py-2.5 px-3 text-neutral-900">
                          Room Base Tariff ({activeBooking.checkIn} to {activeBooking.checkOut})
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[9px] bg-neutral-200 px-1.5 py-0.5 rounded font-mono">
                            ROOM
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px]">Check-In</td>
                        <td className="py-2.5 px-3 text-right font-black font-serif text-neutral-900">
                          ₹{activeBooking.roomRate.toLocaleString('en-IN')}
                        </td>
                      </tr>

                      {/* Additional Folio Items */}
                      {activeFolios.map(item => (
                        <tr key={item.id} className="hover:bg-amber-50/40">
                          <td className="py-2.5 px-3 font-medium text-neutral-900">{item.description}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-neutral-500">{item.timestamp}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-neutral-50 font-bold border-t border-neutral-200 text-neutral-900">
                      <tr>
                        <td colSpan={3} className="py-3 px-3 text-right font-serif">
                          Grand Total Balance:
                        </td>
                        <td className="py-3 px-3 text-right font-serif font-black text-base text-amber-950">
                          ₹{grandTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Settle Tab Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setActiveTab('dynamic_qr')}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Show Dynamic UPI QR</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSettleFolio(activeBooking.id, 'CASH')}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow flex items-center space-x-1"
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Settle via Cash</span>
                    </button>

                    <button
                      onClick={() => onSettleFolio(activeBooking.id, 'CARD')}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow flex items-center space-x-1"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Card Swipe</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-neutral-400">
                <Receipt className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                <h4 className="font-serif font-bold text-neutral-900 text-base">Select a Guest Folio</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Click an in-house room from the left to view the itemized folio, add satvik thalis, or settle bill.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC PAYMENT QR CODE GENERATOR */}
      {activeTab === 'dynamic_qr' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm max-w-xl mx-auto space-y-6 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
              Live Bharat UPI Direct
            </span>
            <h3 className="font-serif font-black text-neutral-900 text-2xl mt-2">
              Scan &amp; Pay via UPI
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Supports Google Pay, PhonePe, Paytm, BHIM, and all mobile banking apps.
            </p>
          </div>

          {/* Dynamic SVG / Canvas QR Generator Card */}
          <div className="p-6 bg-amber-50/50 rounded-3xl border-2 border-dashed border-amber-300 inline-block shadow-inner space-y-3">
            <div className="w-56 h-56 bg-white p-3 rounded-2xl border border-neutral-300 mx-auto shadow-md flex items-center justify-center">
              {/* Dynamic QR API with zero dependencies */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`}
                alt="Dynamic UPI Payment QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="font-mono text-xs text-neutral-800">
              <span className="text-neutral-500 block text-[10px]">Merchant VPA:</span>
              <strong className="text-neutral-900 font-bold">{upiId}</strong>
            </div>

            <div className="text-2xl font-black font-serif text-neutral-900 pt-1">
              ₹{(pendingBalance || grandTotal || 2200).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 text-xs">
            <button
              onClick={() => {
                if (activeBooking) {
                  onSettleFolio(activeBooking.id, 'UPI');
                  setActiveTab('folio');
                }
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow transition flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Instant Payment Received</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATED SHIFT BALANCING */}
      {activeTab === 'shift_balance' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="font-serif font-black text-neutral-900 text-lg flex items-center space-x-2">
                <Banknote className="w-5 h-5 text-amber-700" />
                <span>Front Desk Shift Balancing &amp; Drawer Audit</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Operator: <strong className="text-neutral-900">{shiftRecord.operatorName}</strong> ({shiftRecord.shiftType})
              </p>
            </div>

            <span className="text-xs font-bold bg-amber-100 text-amber-950 px-3 py-1 rounded-full font-mono">
              Shift Opened: {shiftRecord.openedAt}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">1. Opening Cash Float</span>
              <span className="text-2xl font-black font-serif text-neutral-900 mt-1 block">
                ₹{shiftRecord.openingFloat.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-neutral-400">Drawer reserve float</span>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
              <span className="text-emerald-800 block text-[10px] uppercase font-bold">+ 2. Cash Collected</span>
              <span className="text-2xl font-black font-serif text-emerald-800 mt-1 block">
                ₹{shiftRecord.cashCollections.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-700">From counter settlements</span>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
              <span className="text-rose-800 block text-[10px] uppercase font-bold">- 3. Petty Cash Out</span>
              <span className="text-2xl font-black font-serif text-rose-800 mt-1 block">
                ₹{shiftRecord.cashPayouts.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-rose-700">Supplies &amp; vendor payouts</span>
            </div>

            <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300">
              <span className="text-amber-900 block text-[10px] uppercase font-bold">= 4. Expected Drawer</span>
              <span className="text-2xl font-black font-serif text-amber-950 mt-1 block">
                ₹{expectedCashDrawer.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-800 font-semibold">Calculated system total</span>
            </div>
          </div>

          {/* Actual Cash Drawer Entry & Discrepancy Gate */}
          <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 space-y-4">
            <h4 className="font-bold text-sm text-neutral-900">
              Shift Closing Reconciliation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-neutral-600 font-semibold block mb-1">
                  Actual Physical Cash Counted in Drawer (₹):
                </label>
                <input
                  type="number"
                  value={inputActualCash}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setInputActualCash(val);
                    onUpdateShiftBalance(val);
                  }}
                  className="w-full p-3 rounded-xl border border-neutral-300 font-mono font-bold text-lg text-neutral-900 bg-white"
                />
              </div>

              <div>
                <label className="text-neutral-600 font-semibold block mb-1">
                  Shift Handover Notes / Audit Remarks:
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹500 change distributed for morning pilgrim thalis"
                  value={shiftNotes}
                  onChange={e => setShiftNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-300 text-neutral-900 bg-white text-xs"
                />
              </div>
            </div>

            {/* Discrepancy Alert Pill */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
              currentDiscrepancy === 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : currentDiscrepancy > 0
                ? 'bg-blue-50 border-blue-300 text-blue-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="flex items-center space-x-2 font-bold">
                {currentDiscrepancy === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <span>
                  {currentDiscrepancy === 0
                    ? '100% Balanced Register — No Discrepancy'
                    : currentDiscrepancy > 0
                    ? `Excess Cash in Drawer: +₹${currentDiscrepancy}`
                    : `Cash Shortfall Alert: -₹${Math.abs(currentDiscrepancy)}`}
                </span>
              </div>

              <span className="font-mono font-bold">
                Difference: ₹{currentDiscrepancy}
              </span>
            </div>

            {/* Close Shift 1-Click Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  onCloseShift();
                  alert(`Shift closed successfully for operator ${operatorName}! EOD Audit Report generated.`);
                }}
                className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl shadow transition text-xs flex items-center space-x-2"
              >
                <Calculator className="w-4 h-4" />
                <span>1-Click Close &amp; Export End-of-Day Shift Audit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM FOLIO ITEM MODAL */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-amber-200 space-y-4">
            <button
              onClick={() => setShowAddItemModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              ✕
            </button>

            <h3 className="font-serif font-black text-neutral-900 text-lg">
              Add Item to Room Folio
            </h3>
            <p className="text-xs text-neutral-500">
              Post charges to <strong className="text-neutral-900">Room {activeBooking?.roomNumber}</strong> ({activeBooking?.customer})
            </p>

            <form onSubmit={handleCustomItemSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-neutral-600 font-semibold block mb-1">Department Category</label>
                <select
                  value={newItemData.category}
                  onChange={e => setNewItemData({ ...newItemData, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold bg-white text-neutral-900"
                >
                  <option value="RESTAURANT">Satvik Bhojanalaya / Food</option>
                  <option value="LAUNDRY">Laundry &amp; Dry Cleaning</option>
                  <option value="DARSHAN_PASS">VIP Darshan &amp; Puja Pass</option>
                  <option value="TRANSPORT">E-Rickshaw / Taxi Booking</option>
                  <option value="TAX">Miscellaneous Service Fee</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-600 font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={newItemData.description}
                  onChange={e => setNewItemData({ ...newItemData, description: e.target.value })}
                  placeholder="e.g. 2x Rabdi Matka + Masala Chai"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-semibold text-neutral-900"
                />
              </div>

              <div>
                <label className="text-neutral-600 font-semibold block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newItemData.amount}
                  onChange={e => setNewItemData({ ...newItemData, amount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono font-bold text-neutral-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow"
                >
                  Post Charge to Room Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
