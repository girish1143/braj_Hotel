'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Command,
  User,
  Phone,
  BedDouble,
  FileText,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { PMSBooking, PMSRoom } from './types';

interface GlobalCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: PMSBooking[];
  rooms: PMSRoom[];
  onSelectBooking: (booking: PMSBooking) => void;
  onSelectRoom: (room: PMSRoom) => void;
  onNavigateTab: (tabId: string) => void;
}

export default function GlobalCommandBar({
  isOpen,
  onClose,
  bookings,
  rooms,
  onSelectBooking,
  onSelectRoom,
  onNavigateTab
}: GlobalCommandBarProps) {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  // Search Bookings
  const matchedBookings = cleanQuery
    ? bookings.filter(
        b =>
          b.customer.toLowerCase().includes(cleanQuery) ||
          b.phone.includes(cleanQuery) ||
          b.bookingReference.toLowerCase().includes(cleanQuery) ||
          b.roomNumber.toLowerCase().includes(cleanQuery)
      )
    : bookings.slice(0, 3);

  // Search Rooms
  const matchedRooms = cleanQuery
    ? rooms.filter(
        r =>
          r.roomNumber.toLowerCase().includes(cleanQuery) ||
          r.category.toLowerCase().includes(cleanQuery) ||
          r.tags.some(t => t.toLowerCase().includes(cleanQuery))
      )
    : rooms.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-300 overflow-hidden space-y-0">
        {/* Search Bar Input */}
        <div className="relative border-b border-neutral-200 flex items-center px-4 py-3 bg-amber-50/40">
          <Search className="w-5 h-5 text-amber-700 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search Guest Name, Phone #, Booking ID, or Room #... (Press Esc to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          <div className="flex items-center space-x-1.5 ml-2">
            <span className="text-[10px] font-mono bg-white border border-neutral-300 px-1.5 py-0.5 rounded text-neutral-600">
              ESC
            </span>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Quick Shortcuts */}
          {!cleanQuery && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Quick Navigation Shortcuts:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Front Desk', tab: 'front_desk', icon: User },
                  { label: 'Tape Chart', tab: 'tape_chart', icon: BedDouble },
                  { label: 'Housekeeping', tab: 'housekeeping', icon: Sparkles },
                  { label: 'Folio & POS', tab: 'billing_pos', icon: FileText }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => {
                        onNavigateTab(item.tab);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-neutral-50 hover:bg-amber-100/60 border border-neutral-200 text-left flex items-center space-x-2 text-neutral-800 transition"
                    >
                      <Icon className="w-4 h-4 text-amber-700" />
                      <span className="font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bookings Match */}
          {matchedBookings.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Matching Reservations &amp; Guests:
              </span>
              <div className="space-y-1.5">
                {matchedBookings.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBooking(b);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-200 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold font-serif">
                        {b.customer.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-neutral-900">{b.customer}</span>
                          <span className="font-mono text-[10px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
                            {b.bookingReference}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500 block">
                          Room {b.roomNumber} • Phone: {b.phone} • Status: {b.bookingStatus}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-800" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rooms Match */}
          {matchedRooms.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Room Inventory &amp; Live Grid:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {matchedRooms.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectRoom(r);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-neutral-50 border border-neutral-200 text-left transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-black text-neutral-900">
                          Room {r.roomNumber}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            r.status === 'CLEAN'
                              ? 'bg-emerald-500'
                              : r.status === 'OCCUPIED'
                              ? 'bg-amber-500'
                              : r.status === 'DIRTY'
                              ? 'bg-rose-500'
                              : 'bg-purple-500'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 block truncate">
                        {r.category} • Floor {r.floor}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-amber-800 text-[11px]">
                      ₹{r.basePrice}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedBookings.length === 0 && matchedRooms.length === 0 && (
            <div className="py-8 text-center text-neutral-400">
              No matching bookings or rooms found for &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 px-4 py-2 border-t border-neutral-200 text-[10px] text-neutral-500 flex justify-between items-center">
          <span>Search index cached locally for zero-latency lookups.</span>
          <span className="font-mono">Cmd+K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
