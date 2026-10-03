'use client';

import React from 'react';
import { Filter, RotateCcw, MapPin, ShieldCheck, Star } from 'lucide-react';

interface FilterSidebarProps {
  destination: string;
  setDestination: (d: string) => void;
  landmark: string;
  setLandmark: (l: string) => void;
  stayType: string;
  setStayType: (t: string) => void;
  maxPrice: number;
  setMaxPrice: (p: number) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  pureSatvikOnly: boolean;
  setPureSatvikOnly: (v: boolean) => void;
  darshanAssistanceOnly: boolean;
  setDarshanAssistanceOnly: (v: boolean) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  destination,
  setDestination,
  landmark,
  setLandmark,
  stayType,
  setStayType,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  pureSatvikOnly,
  setPureSatvikOnly,
  darshanAssistanceOnly,
  setDarshanAssistanceOnly,
  onReset
}: FilterSidebarProps) {
  const landmarksByDest: Record<string, string[]> = {
    all: ['Banke Bihari Temple', 'Prem Mandir', 'Shri Krishna Janmasthan', 'Vishram Ghat', 'Radha Rani Mandir', 'Dan Ghati Temple', 'Radha Kund'],
    vrindavan: ['Banke Bihari Temple', 'Prem Mandir', 'ISKCON Temple', 'Yamuna Keshi Ghat', 'Nidhivan'],
    mathura: ['Shri Krishna Janmasthan', 'Vishram Ghat', 'Dwarkadhish Temple'],
    barsana: ['Radha Rani Mandir (Ladli Ji)', 'Rangeeli Mahal', 'Maan Mandir'],
    govardhan: ['Dan Ghati Temple', 'Mansi Ganga Lake', 'Radha Kund & Shyam Kund', 'Kusum Sarovar']
  };

  const currentLandmarks = landmarksByDest[destination] || landmarksByDest.all;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/90 shadow-md space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-100 pb-3.5">
        <div className="flex items-center space-x-2 text-sm font-black text-neutral-900 font-serif">
          <Filter className="w-4 h-4 text-amber-600" />
          <span>Pilgrimage Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-amber-700 hover:text-amber-950 flex items-center font-bold px-2.5 py-1 rounded-lg hover:bg-amber-50 active:scale-95 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset All
        </button>
      </div>

      {/* Destination Selector */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-amber-950 mb-2">
          Destination Abode
        </label>
        <div className="space-y-1">
          {[
            { id: 'all', label: 'All Braj Bhumi' },
            { id: 'vrindavan', label: 'Vrindavan' },
            { id: 'mathura', label: 'Mathura' },
            { id: 'barsana', label: 'Barsana' },
            { id: 'govardhan', label: 'Govardhan' }
          ].map((d) => (
            <label
              key={d.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition active:scale-[0.98] ${
                destination === d.id
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                  : 'text-neutral-700 hover:bg-amber-50/60'
              }`}
            >
              <span>{d.label}</span>
              <input
                type="radio"
                name="destination"
                checked={destination === d.id}
                onChange={() => {
                  setDestination(d.id);
                  setLandmark('all');
                }}
                className="hidden"
              />
              {destination === d.id && <span className="text-[10px]">●</span>}
            </label>
          ))}
        </div>
      </div>

      {/* Proximity to Key Temple */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-amber-950 mb-2 flex items-center">
          <MapPin className="w-3.5 h-3.5 mr-1 text-amber-600" />
          Stay Near Landmark
        </label>
        <select
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 font-bold text-neutral-800 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
        >
          <option value="all">Any distance / Any temple</option>
          {currentLandmarks.map((lm) => (
            <option key={lm} value={lm}>
              Near {lm}
            </option>
          ))}
        </select>
      </div>

      {/* Stay Type */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-amber-950 mb-2">
          Accommodation Type
        </label>
        <div className="space-y-1">
          {[
            { id: 'all', label: 'All Stays' },
            { id: 'hotel', label: 'Heritage Hotels' },
            { id: 'dharamshala', label: 'Dharamshalas & Bhavans' },
            { id: 'ashram', label: 'Vaishnava Ashrams' },
            { id: 'guesthouse', label: 'Ghat Guesthouses' },
            { id: 'haveli', label: 'Heritage Havelis' }
          ].map((t) => (
            <label
              key={t.id}
              className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition active:scale-[0.98] ${
                stayType === t.id
                  ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>{t.label}</span>
              <input
                type="radio"
                name="stayType"
                checked={stayType === t.id}
                onChange={() => setStayType(t.id)}
                className="hidden"
              />
              {stayType === t.id && <span className="text-amber-800 text-[10px]">✓</span>}
            </label>
          ))}
        </div>
      </div>

      {/* Max Price Range Slider */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[11px] font-black uppercase tracking-wider text-amber-950">
            Max Price / Night
          </label>
          <span className="text-sm font-black text-amber-800 font-serif">
            ₹{maxPrice.toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="5000"
          step="250"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-amber-600 cursor-pointer h-2 bg-neutral-200 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-medium">
          <span>₹500 (Dharamshala)</span>
          <span>₹5,000 (Luxury)</span>
        </div>
      </div>

      {/* Star Rating Buttons */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-amber-950 mb-2">
          Guest Rating
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 4.0, 4.5, 4.8].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setMinRating(score)}
              className={`py-2 text-xs rounded-xl font-bold border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                minRating === score
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              {score === 0 ? 'All' : `${score}+★`}
            </button>
          ))}
        </div>
      </div>

      {/* Pilgrimage Specific Checkboxes */}
      <div className="pt-3 border-t border-amber-100 space-y-3">
        <label className="flex items-start space-x-2.5 p-2 rounded-xl hover:bg-amber-50/50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={pureSatvikOnly}
            onChange={(e) => setPureSatvikOnly(e.target.checked)}
            className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <div>
            <span className="text-xs font-bold text-neutral-900 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              100% Satvik Kitchen
            </span>
            <p className="text-[10px] text-neutral-500">Pure veg, strictly no onion &amp; no garlic</p>
          </div>
        </label>

        <label className="flex items-start space-x-2.5 p-2 rounded-xl hover:bg-amber-50/50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={darshanAssistanceOnly}
            onChange={(e) => setDarshanAssistanceOnly(e.target.checked)}
            className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <div>
            <span className="text-xs font-bold text-neutral-900">
              🙏 Darshan &amp; Locker Desk
            </span>
            <p className="text-[10px] text-neutral-500">Secure mobile lockers &amp; VIP assistance</p>
          </div>
        </label>
      </div>
    </div>
  );
}
