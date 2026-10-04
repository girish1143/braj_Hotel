'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Utensils, 
  MapPin, 
  Clock, 
  Star, 
  Search, 
  CheckCircle, 
  Heart, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  Users, 
  X, 
  ArrowRight,
  Flame,
  Award,
  Info
} from 'lucide-react';
import { Bhojanalaya, BhojanCategory } from '../../types';
import { fetchBhojanalayas, reserveBhojanThali } from '../../lib/api';

export default function BhojanPage() {
  const [bhojanalayas, setBhojanalayas] = useState<Bhojanalaya[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pureDesiGheeOnly, setPureDesiGheeOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reservation modal state
  const [selectedBhojanalaya, setSelectedBhojanalaya] = useState<Bhojanalaya | null>(null);
  const [reserving, setReserving] = useState<boolean>(false);
  const [reservationSuccess, setReservationSuccess] = useState<{ id: string; message: string } | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Form state
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [thaliCount, setThaliCount] = useState<number>(2);
  const [mealSlot, setMealSlot] = useState<'lunch' | 'dinner' | 'breakfast'>('lunch');
  const [reservationDate, setReservationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [specialRequest, setSpecialRequest] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      setLoading(true);
      const data = await fetchBhojanalayas();
      setBhojanalayas(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Lock body scroll when reservation modal is open
  useEffect(() => {
    if (selectedBhojanalaya) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedBhojanalaya]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBhojanalaya) {
        handleCloseModal();
      }
    };
    if (selectedBhojanalaya) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedBhojanalaya]);

  const destinations = [
    { id: 'all', label: 'All Braj Dham' },
    { id: 'vrindavan', label: 'Vrindavan' },
    { id: 'mathura', label: 'Mathura' },
    { id: 'barsana', label: 'Barsana' },
    { id: 'govardhan', label: 'Govardhan' }
  ];

  const categories = [
    { id: 'all', label: 'All Cuisines & Prasadam' },
    { id: 'thali', label: 'Traditional Braj Thali' },
    { id: 'temple_prasadam', label: 'Temple Mahaprasadam' },
    { id: 'sweets_dairy', label: 'Braj Sweets & Dairy' },
    { id: 'heritage_cafe', label: 'Heritage Satvik Cafe' },
    { id: 'annakshetra', label: 'Community Annakshetra' }
  ];

  const filteredBhojanalayas = useMemo(() => {
    return bhojanalayas.filter((item) => {
      if (selectedDestination !== 'all' && item.destinationSlug !== selectedDestination) {
        return false;
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (pureDesiGheeOnly && !item.pureDesiGhee) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesHindi = item.hindiName ? item.hindiName.includes(q) : false;
        const matchesLandmark = item.nearestLandmark.toLowerCase().includes(q);
        const matchesDishes = item.specialityDishes.some((d) => d.toLowerCase().includes(q));
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesHindi && !matchesLandmark && !matchesDishes && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [bhojanalayas, selectedDestination, selectedCategory, pureDesiGheeOnly, searchQuery]);

  const handleOpenReservation = (item: Bhojanalaya) => {
    setSelectedBhojanalaya(item);
    setReservationSuccess(null);
  };

  const handleCloseModal = () => {
    setSelectedBhojanalaya(null);
    setReservationSuccess(null);
    setSpecialRequest('');
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBhojanalaya || !guestName || !guestPhone) return;

    setReserving(true);
    const res = await reserveBhojanThali({
      bhojanalayaId: selectedBhojanalaya.id,
      bhojanalayaName: selectedBhojanalaya.name,
      guestName,
      guestPhone,
      date: reservationDate,
      mealTime: mealSlot,
      thaliCount,
      specialRequests: specialRequest
    });
    setReserving(false);
    setReservationSuccess({
      id: res.reservationId || `THAL-${Date.now().toString().slice(-6)}`,
      message: res.message
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-amber-950 via-orange-950 to-amber-900 rounded-3xl text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-amber-800/40">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Utensils className="w-3.5 h-3.5" />
            <span>Sacred Braj Culinary &amp; Prasad Trail</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight leading-tight">
            Divine Satvik Bhojan &amp; Temple Mahaprasadam
          </h1>

          <p className="text-xs sm:text-base text-amber-100/90 leading-relaxed font-medium">
            Food cooked in pure devotional sanctity — strictly <strong>100% Vaishnava Satvik (No Onion, No Garlic)</strong>, 
            prepared in pure desi cow ghee, slow-cooked on sacred chulhas, and offered to the Lord before serving.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5 sm:gap-3 text-xs">
            <div className="flex items-center space-x-1.5 bg-amber-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-700/50">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>100% No Onion / No Garlic</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-amber-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-700/50">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Pure Cow Desi Ghee</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-amber-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-700/50">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Annakshetra Seva Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="card-temple p-6 space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by restaurant name, dish (e.g., Mathura Peda, Bedmi Puri, Dal Baati, Kheer), or landmark..."
            className="input-temple pl-11 pr-10 py-3.5 text-xs sm:text-sm shadow-sm"
          />
          <Search className="w-4 h-4 text-amber-600 absolute left-4 top-4" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer active:scale-90 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Destination Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-black uppercase text-amber-800 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Dham:
          </span>
          {destinations.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDestination(d.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer shrink-0 ${
                selectedDestination === d.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-amber-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Category Pills & Pure Ghee Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'bg-amber-50/80 text-amber-900 border border-amber-200/70 hover:bg-amber-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2 text-xs font-bold text-amber-950 cursor-pointer select-none bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 hover:bg-amber-100/80 transition">
            <input
              type="checkbox"
              checked={pureDesiGheeOnly}
              onChange={(e) => setPureDesiGheeOnly(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
            />
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              Pure Desi Ghee Only
            </span>
          </label>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black font-serif text-neutral-900 flex items-center gap-2">
          <span>Curated Bhojanalayas &amp; Prasad Halls</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {filteredBhojanalayas.length} Options
          </span>
        </h2>
        <span className="text-xs text-neutral-500 hidden sm:inline">
          All kitchens verified for 100% Vaishnava satvik preparation
        </span>
      </div>

      {/* Bhojanalaya Grid */}
      {loading ? (
        <div className="text-center py-20 text-neutral-500">
          <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium">Gathering Braj Bhojan recommendations...</p>
        </div>
      ) : filteredBhojanalayas.length === 0 ? (
        <div className="card-temple p-12 text-center space-y-4">
          <span className="text-3xl">🙏</span>
          <h3 className="text-lg font-bold font-serif text-neutral-900">No Bhojanalayas Match Your Selection</h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Try resetting your search keyword or selecting &quot;All Braj Dham&quot; to explore all sacred dining halls.
          </p>
          <button
            onClick={() => {
              setSelectedDestination('all');
              setSelectedCategory('all');
              setPureDesiGheeOnly(false);
              setSearchQuery('');
            }}
            className="btn-gold text-xs py-2 px-5"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBhojanalayas.map((item) => (
            <div
              key={item.id}
              className="card-temple overflow-hidden flex flex-col group"
            >
              {/* Image banner with Badges */}
              <div className="relative h-56 w-full overflow-hidden bg-neutral-100">
                <Image
                  src={item.images[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop'}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

                {/* Top Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-10">
                  <span className="bg-white/95 backdrop-blur-md text-amber-900 text-[11px] font-black px-3 py-1 rounded-full shadow-md border border-amber-100">
                    {item.categoryName}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {item.pureDesiGhee && (
                      <span className="bg-amber-600/95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center shadow-md border border-amber-400/40">
                        <Flame className="w-3 h-3 mr-1 text-amber-200" />
                        Desi Ghee
                      </span>
                    )}
                    {item.pureSatvik && (
                      <span className="bg-emerald-700/95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center shadow-md border border-emerald-500/40">
                        <ShieldCheck className="w-3 h-3 mr-1 text-emerald-200" />
                        Satvik
                      </span>
                    )}
                  </div>
                </div>

                {/* Distance Badge on Image bottom */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
                  <div className="inline-flex items-center bg-black/80 backdrop-blur-md text-amber-300 text-xs px-3 py-1.5 rounded-xl border border-amber-400/40 shadow-md">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
                    <span className="font-bold">{item.distanceToLandmark}</span>
                    <span className="text-white/80 font-normal ml-1">({item.walkMinutes} min walk)</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {/* Destination & Rating */}
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                    <span className="uppercase tracking-widest font-black text-amber-800 text-[11px]">
                      {item.destinationName}
                    </span>
                    <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/90 text-amber-950 font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
                      <span>{item.ratingScore}</span>
                      <span className="text-neutral-400 font-normal ml-1 text-[11px]">({item.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Title & Hindi Name */}
                  <h3 className="text-xl font-bold font-serif text-neutral-900 group-hover:text-amber-800 transition-colors leading-snug">
                    {item.name}
                  </h3>
                  {item.hindiName && (
                    <p className="text-xs font-serif text-amber-800/80 font-medium mt-0.5">
                      {item.hindiName}
                    </p>
                  )}

                  {/* Timings */}
                  <div className="flex items-center text-xs text-neutral-500 mt-2.5 space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-medium text-neutral-700">{item.timings}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-600 mt-2.5 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {/* Speciality Dishes */}
                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">
                      Speciality Prasadam &amp; Delicacies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.specialityDishes.map((dish, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/80"
                        >
                          {dish}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.features.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 text-neutral-600"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Pricing & CTA */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Estimated Cost
                    </span>
                    <span className="text-sm font-black text-amber-950 font-serif">
                      {item.priceRange}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenReservation(item)}
                    className="btn-gold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-1.5 shadow-sm active:scale-95 transition"
                  >
                    <span>Pre-Book Free Thali</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Educational Guide Section: Sacred Braj Bhojan Traditions */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 rounded-3xl p-8 sm:p-10 border border-amber-200 shadow-sm space-y-6">
        <div className="max-w-3xl">
          <span className="text-xs uppercase font-black tracking-wider text-amber-800">
            Vaishnava Culinary Heritage
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900 mt-1 mb-2">
            The 5 Sacred Delicacies of Braj Dham
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
            In Braj Bhumi, eating is considered a divine devotional service. Every morsel is first offered to Shri Radha Krishna as Bhog before it is received as Mahaprasadam by devotees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="card-temple p-5 space-y-2">
            <span className="text-2xl">🍯</span>
            <h4 className="text-sm font-bold text-amber-950 font-serif">Mathura Ka Peda</h4>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Slow-roasted khoya cooked with fragrant cardamom and bura sugar. Sacred offering at Janmabhoomi &amp; Dwarkadhish.
            </p>
          </div>

          <div className="card-temple p-5 space-y-2">
            <span className="text-2xl">🥣</span>
            <h4 className="text-sm font-bold text-amber-950 font-serif">Makhan Mishri</h4>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Freshly churned white cow butter dusted with raw sugar crystals, loved dearly by Laddu Gopal in Gokul &amp; Vrindavan.
            </p>
          </div>

          <div className="card-temple p-5 space-y-2">
            <span className="text-2xl">🥘</span>
            <h4 className="text-sm font-bold text-amber-950 font-serif">Bedmi Puri &amp; Dubki Aloo</h4>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Urad-dal stuffed crispy puris with tangy hing potato curry. The signature Brajwasi morning breakfast.
            </p>
          </div>

          <div className="card-temple p-5 space-y-2">
            <span className="text-2xl">🥛</span>
            <h4 className="text-sm font-bold text-amber-950 font-serif">Kadhai Malai Milk</h4>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Thick cow milk simmered for hours in giant iron kadhais, served in earthen kulhads with saffron and crushed pistachios.
            </p>
          </div>

          <div className="card-temple p-5 space-y-2">
            <span className="text-2xl">🍱</span>
            <h4 className="text-sm font-bold text-amber-950 font-serif">Chhapan Bhog Thali</h4>
            <p className="text-[11px] text-neutral-600 leading-normal">
              56 sacred preparations offered during festival aartis in Nidhivan, Prem Mandir, and Govardhan Annakshetras.
            </p>
          </div>
        </div>
      </div>

      {/* Pilgrim Guidelines & FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-temple p-6 sm:p-8 space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-serif font-black text-lg">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3>Brijnidhi Satvik Guarantee</h3>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Every dining hall listed on Brijnidhi is personally inspected to uphold the purity codes of Brajwasi tradition. 
            No commercial kitchens using onion, garlic, or chemical food colors are permitted on this directory.
          </p>
          <ul className="text-xs text-neutral-600 space-y-1.5 list-disc pl-4">
            <li>Strictly pure vegetarian (Vaishnava Satvik)</li>
            <li>Filtered RO drinking water at all premises</li>
            <li>Direct proximity to major temple parikrama routes</li>
          </ul>
        </div>

        <div className="card-temple p-6 sm:p-8 space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-serif font-black text-lg">
            <Heart className="w-5 h-5 text-rose-600" />
            <h3>Annakshetra Devotee Seva</h3>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            If you wish to sponsor a day of pure satvik mahaprasadam for walking pilgrims or local Brajwasi sadhus along the Govardhan or Vrindavan parikrama, you can request an Annakshetra Seva token.
          </p>
          <div className="pt-2">
            <a
              href="tel:+919876511003"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Brijnidhi Prasad Seva Helpline: +91 98765 11003</span>
            </a>
          </div>
        </div>
      </div>

      {/* Reservation & Prasad Token Modal (Rendered with React Portal) */}
      {mounted && selectedBhojanalaya && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
          style={{ top: 0, left: 0, width: '100vw', height: '100vh', margin: 0 }}
        >
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border-2 border-amber-300/80 animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-amber-900 text-white p-6 relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Utensils className="w-3 h-3" />
                <span>Thali / Prasad Reservation</span>
              </div>
              <h3 className="text-xl font-black font-serif">
                {selectedBhojanalaya.name}
              </h3>
              <p className="text-xs text-amber-200/90 mt-1">
                {selectedBhojanalaya.nearestLandmark} • {selectedBhojanalaya.destinationName}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {reservationSuccess ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Seva Token Confirmed
                    </span>
                    <h4 className="text-xl font-black font-serif text-neutral-900 mt-1">
                      Token Reference: #{reservationSuccess.id}
                    </h4>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-neutral-700 leading-relaxed text-left space-y-2">
                    <p className="font-semibold text-amber-950">
                      {reservationSuccess.message}
                    </p>
                    <div className="border-t border-amber-200/60 pt-2 space-y-1 text-[11px] text-neutral-600">
                      <div><strong>Devotee:</strong> {guestName} ({guestPhone})</div>
                      <div><strong>Date &amp; Slot:</strong> {reservationDate} ({mealSlot.toUpperCase()})</div>
                      <div><strong>Thalis / Persons:</strong> {thaliCount}</div>
                      <div><strong>Location:</strong> {selectedBhojanalaya.address}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    A WhatsApp SMS confirmation has also been scheduled to your mobile number. Radhe Radhe!
                  </p>
                  <button
                    onClick={handleCloseModal}
                    className="btn-gold text-xs py-2.5 px-6 rounded-xl font-bold w-full"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReservation} className="space-y-4">
                  <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Zero advance payment required. Pre-booking ensures priority seating and guaranteed hot prasadam during peak yatra hours.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-700">Devotee / Yatri Name *</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="input-temple text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-700">WhatsApp / Phone *</label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="input-temple text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-700">Date of Visit</label>
                      <input
                        type="date"
                        value={reservationDate}
                        onChange={(e) => setReservationDate(e.target.value)}
                        className="input-temple text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-700">Meal Slot</label>
                      <select
                        value={mealSlot}
                        onChange={(e) => setMealSlot(e.target.value as 'lunch' | 'dinner' | 'breakfast')}
                        className="select-temple w-full text-xs"
                      >
                        <option value="lunch">Lunch (11:30 AM - 03:00 PM)</option>
                        <option value="dinner">Dinner (07:00 PM - 10:30 PM)</option>
                        <option value="breakfast">Breakfast (07:30 AM - 10:30 AM)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-700">Number of Thalis / Persons</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setThaliCount(Math.max(1, thaliCount - 1))}
                          className="w-9 h-9 rounded-xl bg-amber-100 text-amber-950 font-black hover:bg-amber-200 cursor-pointer transition active:scale-90"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-neutral-900">{thaliCount}</span>
                        <button
                          type="button"
                          onClick={() => setThaliCount(Math.min(20, thaliCount + 1))}
                          className="w-9 h-9 rounded-xl bg-amber-100 text-amber-950 font-black hover:bg-amber-200 cursor-pointer transition active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-700">Special Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      placeholder="e.g. Traveling with elderly, need floor seating / low spice, fast (vrat) food..."
                      className="input-temple text-xs resize-none"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end space-x-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-xs font-bold text-neutral-600 hover:text-neutral-800 px-4 py-2 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reserving}
                      className="btn-gold text-xs py-2.5 px-6 rounded-xl font-bold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                    >
                      <span>{reserving ? 'Reserving...' : 'Confirm Free Thali Token'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
