'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  Move,
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  CalendarDays,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { PMSRoom, PMSBooking, RoomStatus } from './types';

interface LiveTapeChartProps {
  rooms: PMSRoom[];
  bookings: PMSBooking[];
  onToggleEmergencyLock: (roomId: string, reason?: string) => void;
  onMoveStay: (bookingId: string, fromRoomId: string, toRoomId: string) => void;
  onExtendStay: (bookingId: string, additionalDays: number) => void;
  onSetRoomStatus: (roomId: string, status: RoomStatus) => void;
  onLogAudit: (action: string, module: 'Front Desk' | 'Tape Chart' | 'Housekeeping' | 'POS & Billing' | 'Shift Balance', details: string) => void;
}

export default function LiveTapeChart({
  rooms,
  bookings,
  onToggleEmergencyLock,
  onMoveStay,
  onExtendStay,
  onSetRoomStatus,
  onLogAudit
}: LiveTapeChartProps) {
  // Calendar Dates: 10 days starting today
  const [dateOffset, setDateOffset] = useState(0);
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Interactive Reassignment / Extend Stay Modal State
  const [actionModalBooking, setActionModalBooking] = useState<{
    booking: PMSBooking;
    room: PMSRoom;
  } | null>(null);
  const [targetRoomId, setTargetRoomId] = useState<string>('');
  const [additionalDays, setAdditionalDays] = useState<number>(1);

  // Emergency Lock Reason Prompt
  const [emergencyLockModalRoom, setEmergencyLockModalRoom] = useState<PMSRoom | null>(null);
  const [lockReason, setLockReason] = useState<string>('Plumbing / AC Maintenance');

  // Generate 10 days array
  const today = new Date();
  today.setDate(today.getDate() + dateOffset);

  const dates: { fullDate: string; dayNum: number; dayName: string; isToday: boolean }[] = [];
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dayStr = d.toISOString().split('T')[0];
    const isToday = i === 0 && dateOffset === 0;
    dates.push({
      fullDate: dayStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday
    });
  }

  // Filter Rooms
  const filteredRooms = rooms.filter(r => {
    if (selectedFloor !== 'ALL' && r.floor !== selectedFloor) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    return true;
  });

  // Calculate Status Summary
  const countClean = rooms.filter(r => r.status === 'CLEAN' && !r.isEmergencyLocked).length;
  const countOccupied = rooms.filter(r => r.status === 'OCCUPIED').length;
  const countDirty = rooms.filter(r => r.status === 'DIRTY').length;
  const countBlocked = rooms.filter(r => r.status === 'BLOCKED' || r.isEmergencyLocked).length;

  return (
    <div className="space-y-6">
      {/* Tape Chart Header & Visual KPI Summary */}
      <div className="bg-gradient-to-r from-neutral-900 via-amber-950 to-neutral-950 text-white rounded-3xl p-6 shadow-xl border border-neutral-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <CalendarDays className="w-4 h-4 text-amber-400" />
              <span>Module 2 • Live Room Inventory &amp; Visual Grid</span>
              <span className="text-amber-500">•</span>
              <span className="text-emerald-400 font-mono">Zero Double-Bookings</span>
            </div>
            <h2 className="text-2xl font-serif font-black text-white">
              Interactive PMS Tape Chart Matrix
            </h2>
            <p className="text-xs text-amber-200/80 mt-1 max-w-xl">
              High-speed calendar matrix of room numbers × calendar dates with instant color-coded states, drag-and-drop stay extensions, and global emergency locks.
            </p>
          </div>

          {/* Color-Coded Status Legend Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <div className="flex items-center space-x-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Clean ({countClean})</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-amber-950/80 text-amber-300 border border-amber-800 px-3 py-1.5 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Occupied ({countOccupied})</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-rose-950/80 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Dirty ({countDirty})</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-purple-950/80 text-purple-300 border border-purple-800 px-3 py-1.5 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Blocked ({countBlocked})</span>
            </div>
          </div>
        </div>

        {/* Toolbar & Date Navigation */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDateOffset(prev => prev - 7)}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition text-neutral-300"
              title="Previous 7 Days"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDateOffset(0)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow"
            >
              Jump to Today
            </button>
            <button
              onClick={() => setDateOffset(prev => prev + 7)}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition text-neutral-300"
              title="Next 7 Days"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-amber-300 ml-2">
              Viewing: {dates[0]?.fullDate} to {dates[dates.length - 1]?.fullDate}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {/* Floor Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-neutral-400">Floor:</span>
              <select
                value={selectedFloor}
                onChange={e => setSelectedFloor(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-xl px-2.5 py-1.5 font-bold"
              >
                <option value="ALL">All Floors</option>
                <option value={1}>1st Floor (Ground)</option>
                <option value={2}>2nd Floor</option>
                <option value={3}>3rd Floor</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-neutral-400">Status:</span>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-xl px-2.5 py-1.5 font-bold"
              >
                <option value="ALL">All States</option>
                <option value="CLEAN">Clean (🟢)</option>
                <option value="OCCUPIED">Occupied (🟡)</option>
                <option value="DIRTY">Dirty (🔴)</option>
                <option value="BLOCKED">Blocked (🟣)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TAPE CHART MATRIX TABLE */}
      <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-amber-50/80 border-b border-amber-200 text-xs">
                {/* Room Info Header */}
                <th className="py-4 px-4 text-left font-serif font-black text-neutral-900 w-52 border-r border-amber-200">
                  Room / Category
                </th>

                {/* Date Columns */}
                {dates.map((d, idx) => (
                  <th
                    key={idx}
                    className={`py-3 px-2 min-w-[90px] border-r border-amber-100 font-bold ${
                      d.isToday ? 'bg-amber-100/80 text-amber-950 font-black' : 'text-neutral-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase block tracking-wider text-neutral-500">
                      {d.dayName}
                    </span>
                    <span className="text-sm font-mono block">
                      {d.dayNum}
                    </span>
                    {d.isToday && (
                      <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded-md block mt-0.5">
                        TODAY
                      </span>
                    )}
                  </th>
                ))}

                {/* Emergency Lock Control */}
                <th className="py-4 px-3 text-center font-bold text-neutral-800 w-28 text-[11px]">
                  Lock Desk
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200 text-xs">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={dates.length + 2} className="py-12 text-center text-neutral-400">
                    No rooms match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRooms.map(room => {
                  const assignedBooking = bookings.find(
                    b => b.roomId === room.id && b.bookingStatus === 'CHECKED_IN'
                  );

                  return (
                    <tr key={room.id} className="hover:bg-neutral-50/60 transition">
                      {/* Left Header: Room Card */}
                      <td className="py-3 px-4 text-left border-r border-neutral-200 bg-neutral-50/70">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-sm text-neutral-900">
                            {room.roomNumber}
                          </span>
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              room.isEmergencyLocked
                                ? 'bg-purple-600'
                                : room.status === 'CLEAN'
                                ? 'bg-emerald-500'
                                : room.status === 'OCCUPIED'
                                ? 'bg-amber-500'
                                : room.status === 'DIRTY'
                                ? 'bg-rose-500'
                                : 'bg-purple-500'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-500 block truncate">
                          {room.category} • F{room.floor}
                        </span>
                        <span className="text-[9px] text-amber-800 font-bold block">
                          ₹{room.basePrice}/night
                        </span>
                      </td>

                      {/* Date Cells */}
                      {dates.map((d, dIdx) => {
                        // Check if occupied on this date
                        const isOccupiedDate =
                          assignedBooking &&
                          d.fullDate >= assignedBooking.checkIn &&
                          d.fullDate <= assignedBooking.checkOut;

                        return (
                          <td
                            key={dIdx}
                            className={`p-1.5 border-r border-neutral-100 ${
                              d.isToday ? 'bg-amber-50/30' : ''
                            }`}
                          >
                            {room.isEmergencyLocked ? (
                              <div
                                title={`Emergency Hold: ${room.lockReason || 'Maintenance'}`}
                                className="w-full h-11 bg-purple-100 border border-purple-300 text-purple-900 rounded-xl flex flex-col items-center justify-center p-1"
                              >
                                <Lock className="w-3.5 h-3.5 text-purple-700" />
                                <span className="text-[8px] font-bold uppercase truncate">
                                  {room.lockReason || 'Locked'}
                                </span>
                              </div>
                            ) : isOccupiedDate ? (
                              <button
                                onClick={() =>
                                  setActionModalBooking({
                                    booking: assignedBooking,
                                    room
                                  })
                                }
                                title={`Click to reassign or extend: ${assignedBooking.customer}`}
                                className="w-full h-11 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-neutral-950 font-bold rounded-xl shadow-sm flex flex-col items-center justify-center p-1 text-[10px] transition group"
                              >
                                <span className="truncate w-full block font-black">
                                  {assignedBooking.customer.split(' ')[0]}
                                </span>
                                <span className="text-[8px] opacity-80 group-hover:underline">
                                  Stay Move ⇄
                                </span>
                              </button>
                            ) : room.status === 'DIRTY' ? (
                              <div
                                onClick={() => onSetRoomStatus(room.id, 'CLEAN')}
                                title="Dirty - Awaiting Housekeeping inspection. Click to mark Clean"
                                className="w-full h-11 bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-900 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer"
                              >
                                <span className="text-[9px] font-black uppercase">DIRTY</span>
                                <span className="text-[8px] text-rose-700">Clean →</span>
                              </div>
                            ) : (
                              <div
                                onClick={() => onSetRoomStatus(room.id, 'DIRTY')}
                                title="Clean - Available for instant pilgrim booking. Click to toggle state."
                                className="w-full h-11 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer"
                              >
                                <span className="text-[9px] font-bold uppercase">CLEAN</span>
                                <span className="text-[8px] text-emerald-600">Available</span>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Emergency Lock Toggle Cell */}
                      <td className="py-3 px-3 border-neutral-100 text-center">
                        <button
                          onClick={() => {
                            if (room.isEmergencyLocked) {
                              onToggleEmergencyLock(room.id);
                            } else {
                              setEmergencyLockModalRoom(room);
                            }
                          }}
                          className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center mx-auto ${
                            room.isEmergencyLocked
                              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                              : 'bg-neutral-100 hover:bg-rose-100 text-neutral-700 hover:text-rose-800'
                          }`}
                          title={room.isEmergencyLocked ? 'Unlock Room' : 'Trigger Emergency Hold'}
                        >
                          {room.isEmergencyLocked ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STAY REASSIGNMENT & EXTENSION MODAL */}
      {actionModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-amber-200 space-y-5">
            <button
              onClick={() => setActionModalBooking(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Stay Control &amp; Room Switch
              </span>
              <h3 className="text-xl font-bold font-serif text-neutral-900 mt-1">
                Manage Stay for {actionModalBooking.booking.customer}
              </h3>
              <p className="text-xs text-neutral-500">
                Currently in <strong className="text-neutral-900">Room {actionModalBooking.room.roomNumber}</strong> ({actionModalBooking.room.category})
              </p>
            </div>

            {/* ACTION 1: SWITCH / MOVE ROOM */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
              <span className="text-xs font-bold text-neutral-800 flex items-center space-x-1.5">
                <Move className="w-4 h-4 text-amber-700" />
                <span>Move to Another Room (Instant Reassignment)</span>
              </span>
              <div className="flex items-center space-x-3">
                <select
                  value={targetRoomId}
                  onChange={e => setTargetRoomId(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-neutral-300 font-bold text-xs bg-white text-neutral-900"
                >
                  <option value="">-- Choose New Clean Room --</option>
                  {rooms
                    .filter(r => r.id !== actionModalBooking.room.id && r.status === 'CLEAN' && !r.isEmergencyLocked)
                    .map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} ({r.category} • Floor {r.floor})
                      </option>
                    ))}
                </select>
                <button
                  disabled={!targetRoomId}
                  onClick={() => {
                    onMoveStay(actionModalBooking.booking.id, actionModalBooking.room.id, targetRoomId);
                    setActionModalBooking(null);
                  }}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition"
                >
                  Confirm Move
                </button>
              </div>
            </div>

            {/* ACTION 2: EXTEND STAY */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
              <span className="text-xs font-bold text-neutral-800 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Extend Pilgrim Stay (Add Days)</span>
              </span>
              <div className="flex items-center space-x-3">
                <select
                  value={additionalDays}
                  onChange={e => setAdditionalDays(Number(e.target.value))}
                  className="flex-1 p-2.5 rounded-xl border border-neutral-300 font-bold text-xs bg-white text-neutral-900"
                >
                  <option value={1}>+ 1 Night (Tariff +₹{actionModalBooking.booking.roomRate})</option>
                  <option value={2}>+ 2 Nights (Tariff +₹{actionModalBooking.booking.roomRate * 2})</option>
                  <option value={3}>+ 3 Nights (Tariff +₹{actionModalBooking.booking.roomRate * 3})</option>
                </select>
                <button
                  onClick={() => {
                    onExtendStay(actionModalBooking.booking.id, additionalDays);
                    setActionModalBooking(null);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition"
                >
                  Extend Stay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY LOCK MODAL */}
      {emergencyLockModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-rose-200 space-y-4">
            <button
              onClick={() => setEmergencyLockModalRoom(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-neutral-900 text-lg">
                Instant Emergency Lock
              </h3>
              <p className="text-xs text-neutral-500">
                Trigger global emergency hold for <strong className="text-neutral-900">Room {emergencyLockModalRoom.roomNumber}</strong> across all online &amp; offline channels.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-600 font-semibold block mb-1">Reason for Lockout</label>
                <input
                  type="text"
                  value={lockReason}
                  onChange={e => setLockReason(e.target.value)}
                  placeholder="e.g. Broken Geyser, Deep Sanitization, VIP Ashram delegation"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-900"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                ⚠️ When locked, online booking portals (Brijnidhi marketplace) and offline front desk systems will reject any reservations for this unit until unlocked.
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setEmergencyLockModalRoom(null)}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onToggleEmergencyLock(emergencyLockModalRoom.id, lockReason);
                    setEmergencyLockModalRoom(null);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow"
                >
                  Confirm Emergency Lock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
