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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
            <span>Sacred Braj Culinary & Prasad Trail</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight leading-tight">
            Divine Satvik Bhojan & Temple Mahaprasadam
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
      <div className="space-y-4 bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by restaurant name, dish (e.g., Mathura Peda, Bedmi Puri, Dal Baati, Kheer), or landmark..."
            className="w-full pl-12 pr-4 py-3 text-sm bg-neutral-50 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Destination Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-black uppercase text-amber-800 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Dham:
          </span>
          {destinations.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDestination(d.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedDestination === d.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Category Pills & Pure Ghee Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200/60 hover:bg-amber-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2 text-xs font-bold text-amber-950 cursor-pointer select-none bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <input
              type="checkbox"
              checked={pureDesiGheeOnly}
              onChange={(e) => setPureDesiGheeOnly(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
            />
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              Pure Desi Ghee Only
            </span>
          </label>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black font-serif text-neutral-900 flex items-center gap-2">
          <span>Curated Bhojanalayas & Prasad Halls</span>
          <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {filteredBhojanalayas.length} Options
          </span>
        </h2>
        <span className="text-xs text-neutral-500 hidden sm:inline">
          All kitchens verified for 100% satvik preparation
        </span>
      </div>

      {/* Bhojanalaya Grid */}
      {loading ? (
        <div className="text-center py-20 text-neutral-500">
          <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium">Gathering Braj Bhojan recommendations...</p>
        </div>
      ) : filteredBhojanalayas.length === 0 ? (
        <div className="bg-amber-50/60 rounded-3xl p-12 text-center border border-amber-200">
          <Utensils className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-neutral-900">No Bhojanalayas Match Your Selection</h3>
          <p className="text-sm text-neutral-600 max-w-md mx-auto mt-1 mb-4">
            Try resetting your search query or selecting &quot;All Braj Dham&quot; to see all curated satvik dining halls.
          </p>
          <button
            onClick={() => {
              setSelectedDestination('all');
              setSelectedCategory('all');
              setPureDesiGheeOnly(false);
              setSearchQuery('');
            }}
            className="btn-gold text-xs py-2 px-4"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBhojanalayas.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-amber-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image banner */}
              <div className="relative h-52 w-full overflow-hidden bg-neutral-100">
                <Image
                  src={item.images[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop'}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-sm">
                    {item.categoryName}
                  </span>
                  {item.pureDesiGhee && (
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-amber-950 backdrop-blur-sm flex items-center gap-1 shadow-sm">
                      <Flame className="w-3 h-3 text-amber-900" />
                      Desi Ghee
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-xl flex items-center space-x-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-black text-neutral-900">{item.ratingScore}</span>
                  <span className="text-[10px] text-neutral-500">({item.reviewsCount})</span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-medium text-amber-200">
                    {item.destinationName} • {item.nearestLandmark}
                  </span>
                  <h3 className="text-lg font-black font-serif drop-shadow-sm leading-tight">
                    {item.name}
                  </h3>
                  {item.hindiName && (
                    <p className="text-xs text-amber-100 font-serif opacity-90">
                      {item.hindiName}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Distance & Timings */}
                <div className="space-y-1.5 text-xs text-neutral-600 border-b border-neutral-100 pb-3">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{item.distanceToLandmark} ({item.walkMinutes} min walk)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-neutral-500">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{item.timings}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Speciality Dishes Tags */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1.5">
                    Speciality Prasadam & Delicacies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.specialityDishes.map((dish, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/60"
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5">
                  {item.features.slice(0, 3).map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 text-neutral-600"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>

                {/* Footer Pricing & CTA */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Estimated Cost:
                    </span>
                    <span className="text-xs font-black text-amber-900">
                      {item.priceRange}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenReservation(item)}
                    className="btn-gold text-xs py-2 px-3.5 rounded-xl font-bold flex items-center space-x-1 shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <span>Pre-Book Thali</span>
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
          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-2">
            <span className="text-2xl">🍯</span>
            <h4 className="text-sm font-bold text-amber-950 font-serif">Mathura Ka Peda</h4>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Slow-roasted khoya cooked with fragrant cardamom and bura sugar. Sacred offering at Janmabhoomi & Dwarkadhish.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-2">
            <span className="text-2xl">🥣</span>
            <h4 className="text-sm font-bold text-amber-950 font-serif">Makhan Mishri</h4>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Freshly churned white cow butter dusted with raw sugar crystals, loved dearly by Laddu Gopal in Gokul & Vrindavan.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-2">
            <span className="text-2xl">🥘</span>
            <h4 className="text-sm font-bold text-amber-950 font-serif">Bedmi Puri & Dubki Aloo</h4>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Urad-dal stuffed crispy puris with tangy hing potato curry. The signature Brajwasi morning breakfast.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-2">
            <span className="text-2xl">🥛</span>
            <h4 className="text-sm font-bold text-amber-950 font-serif">Kadhai Malai Milk</h4>
            <p className="text-[11px] text-neutral-600 leading-normal">
              Thick cow milk simmered for hours in giant iron kadhais, served in earthen kulhads with saffron and crushed pistachios.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-2">
            <span className="text-2xl">🍱</span>
            <h4 className="text-sm font-bold text-amber-950 font-serif">Chhapan Bhog Thali</h4>
            <p className="text-[11px] text-neutral-600 leading-normal">
              56 sacred preparations offered during festival aartis in Nidhivan, Prem Mandir, and Govardhan Annakshetras.
            </p>
          </div>
        </div>
      </div>

      {/* Pilgrim Guidelines & FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl border border-neutral-200">
        <div className="space-y-3">
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

        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-serif font-black text-lg">
            <Heart className="w-5 h-5 text-rose-600" />
            <h3>Annakshetra Devotee Seva</h3>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            If you wish to sponsor a day of pure satvik mahaprasadam for walking pilgrims or local Brajwasi sadhus along the Govardhan or Vrindavan parikrama, you can request an Annakshetra Seva token.
          </p>
          <div className="pt-1">
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
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-300 relative animate-scale-up">
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
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              {reservationSuccess ? (
                <div className="text-center py-6 space-y-4">
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
                      <div><strong>Date & Slot:</strong> {reservationDate} ({mealSlot.toUpperCase()})</div>
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
                      className="w-full px-3.5 py-2 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                        className="w-full px-3.5 py-2 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-700">Date of Visit</label>
                      <input
                        type="date"
                        value={reservationDate}
                        onChange={(e) => setReservationDate(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-700">Meal Slot</label>
                      <select
                        value={mealSlot}
                        onChange={(e) => setMealSlot(e.target.value as 'lunch' | 'dinner' | 'breakfast')}
                        className="w-full px-3.5 py-2 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                          className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-800 font-bold hover:bg-neutral-300 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-sm">{thaliCount}</span>
                        <button
                          type="button"
                          onClick={() => setThaliCount(Math.min(20, thaliCount + 1))}
                          className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-800 font-bold hover:bg-neutral-300 cursor-pointer"
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
                      className="w-full px-3.5 py-2 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-xs font-bold text-neutral-600 hover:text-neutral-800 px-4 py-2"
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
