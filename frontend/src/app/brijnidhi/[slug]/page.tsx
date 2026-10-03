'use client';

import React, { useState, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import HotelCard from '../../../components/HotelCard';
import FilterSidebar from '../../../components/FilterSidebar';
import BookingModal from '../../../components/BookingModal';
import DestinationVideoHero from '../../../components/DestinationVideoHero';
import { brajDestinations, brajHotels } from '../../../lib/data';
import { Hotel } from '../../../types';
import { MapPin, Sparkles, Filter, ChevronRight, Check, ArrowLeft, RotateCcw } from 'lucide-react';

export default function DestinationLandingPage() {
  const params = useParams();
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const slug = (rawSlug || '').toLowerCase();

  const destination = brajDestinations.find((d) => d.slug.toLowerCase() === slug);

  if (!destination) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="text-3xl font-bold font-serif text-neutral-900">Destination Not Found</h1>
        <p className="text-sm text-neutral-600 mt-2">
          The requested Braj destination &apos;{slug}&apos; is not available.
        </p>
        <div className="mt-6 flex justify-center space-x-3">
          <Link href="/brijnidhi/vrindavan" className="btn-primary text-xs">
            Vrindavan
          </Link>
          <Link href="/brijnidhi/mathura" className="btn-primary text-xs">
            Mathura
          </Link>
          <Link href="/brijnidhi/barsana" className="btn-primary text-xs">
            Barsana
          </Link>
          <Link href="/brijnidhi/govardhan" className="btn-primary text-xs">
            Govardhan
          </Link>
        </div>
      </div>
    );
  }

  // State for Filters
  const [selectedLandmark, setSelectedLandmark] = useState<string>('all');
  const [stayType, setStayType] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);
  const [pureSatvikOnly, setPureSatvikOnly] = useState<boolean>(false);
  const [darshanAssistanceOnly, setDarshanAssistanceOnly] = useState<boolean>(false);
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<Hotel | null>(null);
  const [allHotels, setAllHotels] = useState<Hotel[]>(brajHotels);

  React.useEffect(() => {
    fetch('http://localhost:5000/api/hotels')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAllHotels(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter the hotels for this destination
  const filteredHotels = useMemo(() => {
    return allHotels.filter((hotel) => {
      // Must match destination
      if (hotel.destinationSlug.toLowerCase() !== destination.slug) return false;

      // Filter by Landmark
      if (selectedLandmark !== 'all') {
        const term = selectedLandmark.toLowerCase();
        const matchesLandmark =
          hotel.nearestLandmark.toLowerCase().includes(term) ||
          hotel.landmarkDistances.some((ld) => ld.landmark.toLowerCase().includes(term));
        if (!matchesLandmark) return false;
      }

      // Filter by stay type
      if (stayType !== 'all' && hotel.stayType !== stayType) return false;

      // Filter by price
      if (hotel.pricePerNight > maxPrice) return false;

      // Filter by rating
      if (minRating > 0 && hotel.ratingScore < minRating) return false;

      // Filter by satvik
      if (pureSatvikOnly && !hotel.pureSatvikKitchen) return false;

      // Filter by darshan assistance
      if (darshanAssistanceOnly && !hotel.templeDarshanAssistance) return false;

      return true;
    });
  }, [destination.slug, selectedLandmark, stayType, maxPrice, minRating, pureSatvikOnly, darshanAssistanceOnly]);

  const handleResetFilters = () => {
    setSelectedLandmark('all');
    setStayType('all');
    setMaxPrice(5000);
    setMinRating(0);
    setPureSatvikOnly(false);
    setDarshanAssistanceOnly(false);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Original Video Background Hero Header */}
      <DestinationVideoHero destination={destination} />

      {/* "FIND YOUR STAY NEAR" LANDMARK SELECTOR (User Design Requirement) */}
      <div className="bg-amber-100/70 border-b border-amber-200/90 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-amber-950 mb-3">
            <MapPin className="w-4 h-4 text-amber-700" />
            <span>Find your stay near:</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setSelectedLandmark('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                selectedLandmark === 'all'
                  ? 'bg-amber-700 text-white shadow-md ring-2 ring-amber-700/30'
                  : 'bg-white text-neutral-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              [ All {destination.name} ]
            </button>
            {destination.landmarks.map((landmark) => (
              <button
                key={landmark.name}
                onClick={() => setSelectedLandmark(landmark.name)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center space-x-1.5 ${
                  selectedLandmark === landmark.name
                    ? 'bg-amber-700 text-white shadow-md ring-2 ring-amber-700/30'
                    : 'bg-white text-neutral-800 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <span>[ {landmark.name} ]</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA: SIDEBAR + RESULTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Quick Property Type Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-200/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-neutral-800 mr-2 uppercase">Property Type:</span>
            {[
              { id: 'all', label: 'All Stays' },
              { id: 'hotel', label: 'Hotels' },
              { id: 'dharamshala', label: 'Dharamshalas' },
              { id: 'ashram', label: 'Ashrams' },
              { id: 'guesthouse', label: 'Guest Houses' },
              { id: 'haveli', label: 'Havelis' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setStayType(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                  stayType === item.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-amber-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-neutral-500 font-medium">
            Showing <span className="font-bold text-neutral-900">{filteredHotels.length}</span> stays in {destination.name}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-3">
            <FilterSidebar
              destination={destination.slug}
              setDestination={() => {}}
              landmark={selectedLandmark}
              setLandmark={setSelectedLandmark}
              stayType={stayType}
              setStayType={setStayType}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              minRating={minRating}
              setMinRating={setMinRating}
              pureSatvikOnly={pureSatvikOnly}
              setPureSatvikOnly={setPureSatvikOnly}
              darshanAssistanceOnly={darshanAssistanceOnly}
              setDarshanAssistanceOnly={setDarshanAssistanceOnly}
              onReset={handleResetFilters}
            />

            {/* Destination Landmark Timings Card */}
            <div className="mt-6 bg-amber-50/80 p-5 rounded-3xl border border-amber-200 text-xs shadow-sm">
              <h4 className="font-bold font-serif text-amber-950 text-sm mb-3">
                Key Landmarks in {destination.name}
              </h4>
              <div className="space-y-3">
                {destination.landmarks.map((lm) => (
                  <div key={lm.name} className="border-b border-amber-200/60 pb-2">
                    <span className="font-bold text-neutral-900 block">{lm.name}</span>
                    <span className="text-[11px] text-amber-800 font-medium block">{lm.distanceInfo}</span>
                    {lm.aartiTimings && (
                      <span className="text-[10px] text-neutral-600 block mt-0.5">
                        ⏱️ {lm.aartiTimings}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Hotel Cards */}
          <div className="lg:col-span-9">
            {filteredHotels.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-amber-200 shadow-sm space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                  🕉️
                </div>
                <h3 className="text-xl font-bold font-serif text-neutral-900">
                  {allHotels.some((h) => h.destinationSlug.toLowerCase() === destination.slug)
                    ? 'No Stays Found Matching Filters'
                    : `No Stays Listed in ${destination.name} Yet`}
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                  {allHotels.some((h) => h.destinationSlug.toLowerCase() === destination.slug)
                    ? 'Try adjusting the maximum price, selecting All landmarks, or resetting your filter preferences.'
                    : `We are starting with a clean verified directory. Properties added in ${destination.name} will appear here.`}
                </p>
                <div>
                  <button
                    onClick={handleResetFilters}
                    className="btn-primary text-xs py-2.5 px-6"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onSelectBooking={(h) => setSelectedHotelForBooking(h)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedHotelForBooking && (
        <BookingModal
          hotel={selectedHotelForBooking}
          onClose={() => setSelectedHotelForBooking(null)}
        />
      )}
    </div>
  );
}
