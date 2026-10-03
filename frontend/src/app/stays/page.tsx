'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HotelCard from '../../components/HotelCard';
import FilterSidebar from '../../components/FilterSidebar';
import BookingModal from '../../components/BookingModal';
import { brajHotels } from '../../lib/data';
import { Hotel } from '../../types';
import { Search, MapPin, Sparkles, Filter, X } from 'lucide-react';

function StaysContent() {
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState<string>(searchParams.get('destination') || 'all');
  const [landmark, setLandmark] = useState<string>(searchParams.get('landmark') || 'all');
  const [stayType, setStayType] = useState<string>(searchParams.get('type') || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);
  const [pureSatvikOnly, setPureSatvikOnly] = useState<boolean>(searchParams.get('satvik') === 'true');
  const [darshanAssistanceOnly, setDarshanAssistanceOnly] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<Hotel | null>(null);
  const [allHotels, setAllHotels] = useState<Hotel[]>(brajHotels);

  // Fetch hotels from backend on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/hotels')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAllHotels(json.data);
        }
      })
      .catch(() => {
        // clean fallback to brajHotels
      });
  }, []);

  // Sync from URL changes
  useEffect(() => {
    const dest = searchParams.get('destination');
    const lm = searchParams.get('landmark');
    const type = searchParams.get('type');
    if (dest) setDestination(dest);
    if (lm) setLandmark(lm);
    if (type) setStayType(type);
  }, [searchParams]);

  // Filtered List
  const filteredHotels = useMemo(() => {
    return allHotels.filter((hotel) => {
      if (destination !== 'all' && hotel.destinationSlug.toLowerCase() !== destination.toLowerCase()) {
        return false;
      }
      if (landmark !== 'all') {
        const term = landmark.toLowerCase();
        const matchesLandmark =
          hotel.nearestLandmark.toLowerCase().includes(term) ||
          hotel.landmarkDistances.some((ld) => ld.landmark.toLowerCase().includes(term));
        if (!matchesLandmark) return false;
      }
      if (stayType !== 'all' && hotel.stayType !== stayType) {
        return false;
      }
      if (hotel.pricePerNight > maxPrice) {
        return false;
      }
      if (minRating > 0 && hotel.ratingScore < minRating) {
        return false;
      }
      if (pureSatvikOnly && !hotel.pureSatvikKitchen) {
        return false;
      }
      if (darshanAssistanceOnly && !hotel.templeDarshanAssistance) {
        return false;
      }
      if (searchKeyword.trim() !== '') {
        const q = searchKeyword.toLowerCase();
        const matches =
          hotel.name.toLowerCase().includes(q) ||
          hotel.destinationName.toLowerCase().includes(q) ||
          hotel.address.toLowerCase().includes(q) ||
          hotel.nearestLandmark.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [destination, landmark, stayType, maxPrice, minRating, pureSatvikOnly, darshanAssistanceOnly, searchKeyword]);

  const handleResetFilters = () => {
    setDestination('all');
    setLandmark('all');
    setStayType('all');
    setMaxPrice(5000);
    setMinRating(0);
    setPureSatvikOnly(false);
    setDarshanAssistanceOnly(false);
    setSearchKeyword('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Search bar */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-neutral-900">
          Braj Pilgrimage Stays &amp; Dharamshalas
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Explore authentic hotels, guest houses, and ashrams close to Banke Bihari, Krishna Janmasthan, Radha Rani, and Govardhan Parikrama.
        </p>

        {/* Search input box */}
        <div className="mt-5 max-w-xl relative">
          <input
            type="text"
            placeholder="Search by hotel name, temple name or area (e.g., ISKCON, Keshi Ghat, Dan Ghati)..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="input-temple pl-11 pr-10 py-3.5 text-xs sm:text-sm shadow-sm"
          />
          <Search className="w-4 h-4 text-amber-600 absolute left-4 top-4" />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer active:scale-90 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-3">
          <FilterSidebar
            destination={destination}
            setDestination={setDestination}
            landmark={landmark}
            setLandmark={setLandmark}
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
        </div>

        {/* Right Listings */}
        <div className="lg:col-span-9">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-neutral-600">
              Showing <span className="text-neutral-900 font-bold">{filteredHotels.length}</span> verified stays
            </span>
          </div>

          {filteredHotels.length === 0 ? (
            <div className="card-temple p-12 text-center space-y-4">
              <span className="text-3xl">🙏</span>
              <h3 className="text-lg font-bold font-serif text-neutral-900">
                {allHotels.length === 0 ? 'No Stays Listed Yet' : 'No Stays Match These Filters'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                {allHotels.length === 0
                  ? 'The directory is currently empty. You can add hotels, ashrams, and dharamshalas via the System Admin or Hotel Admin console.'
                  : 'Try clearing search terms or widening your destination or budget selection.'}
              </p>
              <div>
                {allHotels.length === 0 ? (
                  <a
                    href="/admin"
                    className="btn-primary inline-flex text-xs py-2.5 px-6"
                  >
                    Add Hotel in Admin Console
                  </a>
                ) : (
                  <button
                    onClick={handleResetFilters}
                    className="btn-primary text-xs py-2.5 px-6"
                  >
                    Reset Filters
                  </button>
                )}
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

      {/* Interactive Booking Modal */}
      {selectedHotelForBooking && (
        <BookingModal
          hotel={selectedHotelForBooking}
          onClose={() => setSelectedHotelForBooking(null)}
        />
      )}
    </div>
  );
}

export default function StaysPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading Braj stays...</div>}>
      <StaysContent />
    </Suspense>
  );
}
