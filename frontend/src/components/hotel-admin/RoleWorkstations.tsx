'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Bed,
  Sparkles,
  Receipt,
  UtensilsCrossed,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
  Search,
  IndianRupee
} from 'lucide-react';
import { StaffRole } from './types';

interface RoleWorkstationsProps {
  role: StaffRole;
  staffName: string;
  hotelName: string;
}

export default function RoleWorkstations({ role, staffName, hotelName }: RoleWorkstationsProps) {
  // 1. RECEPTIONIST WORKSTATION STATE
  const [receptionBookings, setReceptionBookings] = useState<
    { id: string; guest: string; room: string; checkIn: string; nights: number; status: string; city: string }[]
  >([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newRoomNo, setNewRoomNo] = useState('101');

  // 2. HOUSEKEEPING WORKSTATION STATE
  const [roomsList, setRoomsList] = useState([
    { roomNo: '101', type: 'Standard AC', floor: '1st Floor', status: 'Clean', cleaner: 'Kailash' },
    { roomNo: '102', type: 'Deluxe AC', floor: '1st Floor', status: 'In Inspection', cleaner: 'Ramesh' },
    { roomNo: '103', type: 'Deluxe AC', floor: '1st Floor', status: 'Dirty', cleaner: 'Pooja' },
    { roomNo: '201', type: 'Executive Suite', floor: '2nd Floor', status: 'Clean', cleaner: 'Kailash' },
    { roomNo: '202', type: 'Deluxe AC', floor: '2nd Floor', status: 'Dirty', cleaner: 'Ramesh' },
    { roomNo: '203', type: 'Family Pilgrim Suite', floor: '2nd Floor', status: 'Clean', cleaner: 'Pooja' }
  ]);

  // 3. ACCOUNTANT WORKSTATION STATE
  const [cashRegister, setCashRegister] = useState({
    openingFloat: 0,
    cashCollected: 0,
    digitalUpi: 0,
    cashPayouts: 0,
    drawerBalance: 0
  });

  // 4. RESTAURANT STAFF STATE
  const [bhojanOrders, setBhojanOrders] = useState<
    { id: string; room: string; item: string; time: string; status: string; amount: number }[]
  >([]);

  const toggleRoomStatus = (roomNo: string) => {
    setRoomsList(prev =>
      prev.map(r => {
        if (r.roomNo === roomNo) {
          const next = r.status === 'Clean' ? 'Dirty' : r.status === 'Dirty' ? 'In Inspection' : 'Clean';
          return { ...r, status: next };
        }
        return r;
      })
    );
  };

  const handleAddQuickStay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    const newStay = {
      id: `RES-${Date.now().toString().slice(-3)}`,
      guest: newGuestName.trim(),
      room: `${newRoomNo} - Assigned`,
      checkIn: 'Today',
      nights: 2,
      status: 'Checked In',
      city: 'Walk-In Yatri'
    };
    setReceptionBookings([newStay, ...receptionBookings]);
    setNewGuestName('');
  };

  return (
    <div className="space-y-6">
      {/* Role Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            {role} Active Workstation
          </span>
          <h2 className="text-2xl font-serif font-black text-neutral-900 mt-1">
            {role === 'Receptionist' && 'Front Desk & Guest Registrations'}
            {role === 'Housekeeping' && 'Sanitation & Room Cleaning Matrix'}
            {role === 'Accountant' && 'Cash Register & Financial Folios'}
            {role === 'Restaurant Staff' && 'Brij Satvik Kitchen & Dining Orders'}
            {role === 'Manager' && 'Executive Operations & Shift Management'}
            {role === 'Admin' && 'System Overview & Administration'}
          </h2>
          <p className="text-xs text-neutral-500">
            Workstation active for <strong>{staffName}</strong> at <strong>{hotelName}</strong>.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Terminal Live
        </span>
      </div>

      {/* --- 1. RECEPTIONIST VIEW --- */}
      {(role === 'Receptionist' || role === 'Admin' || role === 'Manager') && (
        <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-black text-lg text-neutral-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-600" />
              <span>Today&apos;s Guest Arrivals & Active Registrations</span>
            </h3>
            <span className="text-xs text-neutral-500 font-bold">{receptionBookings.length} Active Stays</span>
          </div>

          {/* Quick Check In Form */}
          <form onSubmit={handleAddQuickStay} className="p-4 rounded-2xl bg-[#fdfbf7] border border-amber-200 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newGuestName}
              onChange={e => setNewGuestName(e.target.value)}
              placeholder="Pilgrim / Guest Full Name..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-xs font-semibold focus:outline-none focus:border-amber-600"
            />
            <select
              value={newRoomNo}
              onChange={e => setNewRoomNo(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-xs font-semibold focus:outline-none focus:border-amber-600"
            >
              <option value="101">Room 101 (Standard AC)</option>
              <option value="102">Room 102 (Deluxe AC)</option>
              <option value="201">Room 201 (Executive Suite)</option>
              <option value="301">Room 301 (Yamuna View)</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Direct Check-In</span>
            </button>
          </form>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fdfbf7] text-neutral-600 font-bold uppercase text-[10px] border-b border-amber-200">
                <tr>
                  <th className="py-2.5 px-3">Booking ID</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-3">Assigned Room</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 font-medium text-neutral-800">
                {receptionBookings.map(b => (
                  <tr key={b.id} className="hover:bg-amber-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-amber-800">{b.id}</td>
                    <td className="py-3 px-3 font-bold text-neutral-900">{b.guest}</td>
                    <td className="py-3 px-3">{b.room}</td>
                    <td className="py-3 px-3 text-neutral-500">{b.city}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {receptionBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400 text-xs">
                      No active guest arrivals registered yet. Use the Direct Check-In form above to check in a guest.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- 2. HOUSEKEEPING VIEW --- */}
      {(role === 'Housekeeping' || role === 'Admin' || role === 'Manager') && (
        <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-black text-lg text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Room Sanitation & Inspection Queue</span>
            </h3>
            <span className="text-xs text-neutral-500 font-bold">Click status to toggle</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {roomsList.map(r => (
              <div key={r.roomNo} className="p-4 rounded-2xl bg-[#fdfbf7] border border-amber-200 space-y-2 text-center">
                <div className="text-2xl font-serif font-black text-neutral-900">
                  Room {r.roomNo}
                </div>
                <div className="text-[11px] text-neutral-500 font-medium">
                  {r.type} • {r.floor}
                </div>
                <button
                  type="button"
                  onClick={() => toggleRoomStatus(r.roomNo)}
                  className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    r.status === 'Clean'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : r.status === 'Dirty'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  ● {r.status}
                </button>
                <div className="text-[10px] text-neutral-400">Assigned: {r.cleaner}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- 3. ACCOUNTANT VIEW --- */}
      {(role === 'Accountant' || role === 'Admin' || role === 'Manager') && (
        <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-black text-lg text-neutral-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-600" />
              <span>Cash Register Shift Balancing & Collections</span>
            </h3>
            <span className="text-xs text-emerald-700 font-bold">Shift Open</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-amber-200">
              <span className="text-[10px] text-neutral-500 font-bold uppercase">Opening Float</span>
              <span className="block text-xl font-mono font-black text-neutral-900 mt-0.5">₹{cashRegister.openingFloat}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-bold uppercase">Cash Collections</span>
              <span className="block text-xl font-mono font-black text-emerald-800 mt-0.5">₹{cashRegister.cashCollected}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200">
              <span className="text-[10px] text-cyan-700 font-bold uppercase">Digital UPI</span>
              <span className="block text-xl font-mono font-black text-cyan-800 mt-0.5">₹{cashRegister.digitalUpi}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300">
              <span className="text-[10px] text-amber-800 font-bold uppercase">Drawer Balance</span>
              <span className="block text-xl font-mono font-black text-amber-900 mt-0.5">₹{cashRegister.drawerBalance}</span>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. RESTAURANT STAFF VIEW --- */}
      {(role === 'Restaurant Staff' || role === 'Admin') && (
        <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-black text-lg text-neutral-900 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" />
              <span>Brij Satvik Kitchen & Dining Room Service Orders</span>
            </h3>
            <span className="text-xs text-neutral-500 font-bold">100% Pure Satvik</span>
          </div>

          <div className="divide-y divide-amber-100">
            {bhojanOrders.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs">
                No active kitchen orders in queue. Orders placed from room service will appear here.
              </div>
            ) : (
              bhojanOrders.map(order => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-800">{order.id}</span>
                      <span className="font-bold text-neutral-900">{order.room}</span>
                    </div>
                    <span className="text-neutral-600 block mt-0.5">{order.item}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-neutral-900 block">₹{order.amount}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
