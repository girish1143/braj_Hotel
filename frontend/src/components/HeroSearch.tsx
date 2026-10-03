'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, Search, Sparkles, Navigation, ChevronDown, Check } from 'lucide-react';

interface HeroSearchProps {
  initialDestination?: string;
  initialLandmark?: string;
}

export default function HeroSearch({ initialDestination, initialLandmark }: HeroSearchProps) {
  const router = useRouter();

  const [destination, setDestination] = useState<string>(initialDestination || 'vrindavan');
  const [landmark, setLandmark] = useState<string>(initialLandmark || 'all');
  const [checkIn, setCheckIn] = useState<string>('2026-10-10');
  const [checkOut, setCheckOut] = useState<string>('2026-10-12');
  const [guests, setGuests] = useState<number>(2);
  const [rooms, setRooms] = useState<number>(1);
  const [showGuestDropdown, setShowGuestDropdown] = useState<boolean>(false);

  const destinationLandmarks: Record<string, string[]> = {
    vrindavan: ['Banke Bihari Temple', 'Prem Mandir', 'ISKCON Temple', 'Yamuna Keshi Ghat', 'Nidhivan'],
    mathura: ['Shri Krishna Janmasthan', 'Vishram Ghat', 'Dwarkadhish Temple', 'Gita Mandir'],
    barsana: ['Radha Rani Mandir (Shriji)', 'Rangeeli Mahal', 'Maan Mandir'],
    govardhan: ['Dan Ghati Temple', 'Mansi Ganga Lake', 'Radha Kund', 'Kusum Sarovar']
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (destination && destination !== 'all') query.set('destination', destination);
    if (landmark && landmark !== 'all') query.set('landmark', landmark);
    if (checkIn) query.set('checkIn', checkIn);
    if (checkOut) query.set('checkOut', checkOut);
    query.set('guests', guests.toString());
    query.set('rooms', rooms.toString());

    router.push(`/stays?${query.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Search Widget Container with frosted glass border & glow */}
      <div className="bg-white/95 backdrop-blur-xl p-5 sm:p-8 rounded-3xl shadow-2xl border border-amber-200/90 ring-1 ring-amber-100">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Top Row: Location & Landmark */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Where are you going? */}
            <div className="md:col-span-7 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <label className="flex items-center text-[11px] font-black uppercase tracking-wider text-amber-900 mb-1.5">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
                Where are you going in Braj?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-0.5">
                <div className="relative">
                  <select
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setLandmark('all');
                    }}
                    className="w-full appearance-none bg-white font-bold text-neutral-900 text-xs sm:text-sm py-2.5 pl-3.5 pr-8 rounded-xl border border-amber-200/90 shadow-sm focus:outline-none cursor-pointer"
                  >
                    <option value="vrindavan">Vrindavan (श्री वृन्दावन)</option>
                    <option value="mathura">Mathura (श्री मथुरा)</option>
                    <option value="barsana">Barsana (श्री बरसाना)</option>
                    <option value="govardhan">Govardhan (श्री गोवर्धन)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-600 absolute right-2.5 top-3 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full appearance-none bg-white text-neutral-800 text-xs py-2.5 pl-3 pr-8 rounded-xl border border-amber-200/90 shadow-sm focus:outline-none cursor-pointer"
                  >
                    <option value="all">📍 Stay near any temple</option>
                    {destinationLandmarks[destination]?.map((lm) => (
                      <option key={lm} value={lm}>
                        Near {lm}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-600 absolute right-2.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Guests & Rooms */}
            <div className="md:col-span-5 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 relative">
              <label className="flex items-center text-[11px] font-black uppercase tracking-wider text-amber-900 mb-1.5">
                <Users className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
                Guests &amp; Rooms
              </label>
              <button
                type="button"
                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                className="w-full mt-0.5 bg-white py-2.5 px-3.5 rounded-xl border border-amber-200/90 shadow-sm text-left text-xs sm:text-sm font-bold text-neutral-900 flex justify-between items-center hover:border-amber-400 active:scale-[0.99] transition cursor-pointer"
              >
                <span>
                  {guests} {guests === 1 ? 'Guest' : 'Guests'}, {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                  Select
                </span>
              </button>

              {showGuestDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-neutral-800">Guests</span>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center font-bold text-neutral-700 hover:bg-neutral-100 active:scale-95 transition"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-neutral-900 w-4 text-center">{guests}</span>
                      <button
                        type="button"
                        onClick={() => setGuests(guests + 1)}
                        className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center font-bold text-neutral-700 hover:bg-neutral-100 active:scale-95 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-neutral-800">Rooms</span>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center font-bold text-neutral-700 hover:bg-neutral-100 active:scale-95 transition"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-neutral-900 w-4 text-center">{rooms}</span>
                      <button
                        type="button"
                        onClick={() => setRooms(rooms + 1)}
                        className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center font-bold text-neutral-700 hover:bg-neutral-100 active:scale-95 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuestDropdown(false)}
                    className="w-full mt-2 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Check-in, Check-out and Search Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            {/* Check-in */}
            <div className="md:col-span-4 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
              <label className="flex items-center text-[11px] font-black uppercase tracking-wider text-amber-900 mb-1.5">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
                Check-in Date
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full mt-0.5 bg-white font-bold text-neutral-900 text-xs sm:text-sm py-2 px-3 rounded-xl border border-amber-200/90 shadow-sm focus:outline-none cursor-pointer"
              />
            </div>

            {/* Check-out */}
            <div className="md:col-span-4 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
              <label className="flex items-center text-[11px] font-black uppercase tracking-wider text-amber-900 mb-1.5">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full mt-0.5 bg-white font-bold text-neutral-900 text-xs sm:text-sm py-2 px-3 rounded-xl border border-amber-200/90 shadow-sm focus:outline-none cursor-pointer"
              />
            </div>

            {/* Submit Search Button */}
            <div className="md:col-span-4 h-full flex items-end">
              <button
                type="submit"
                className="w-full btn-primary text-sm sm:text-base py-4 px-6 flex items-center justify-center space-x-2 tracking-wide group shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5 stroke-[2.5] group-hover:scale-110 transition-transform" />
                <span>SEARCH BRAJ STAYS</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Landmark Proximity Chips */}
        <div className="mt-5 pt-4 border-t border-amber-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-amber-900 flex items-center mr-1">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Stay Close to:
          </span>
          {[
            { label: 'Banke Bihari Temple', dest: 'vrindavan', lm: 'Banke Bihari Temple' },
            { label: 'Krishna Janmabhoomi', dest: 'mathura', lm: 'Shri Krishna Janmasthan' },
            { label: 'Prem Mandir', dest: 'vrindavan', lm: 'Prem Mandir' },
            { label: 'Radha Rani Mandir', dest: 'barsana', lm: 'Radha Rani Mandir' },
            { label: 'Govardhan Parikrama Path', dest: 'govardhan', lm: 'Dan Ghati Temple' },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setDestination(chip.dest);
                setLandmark(chip.lm);
                router.push(`/stays?destination=${chip.dest}&landmark=${encodeURIComponent(chip.lm)}`);
              }}
              className="btn-pill text-xs bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-950 border border-amber-200/90 shadow-sm"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
