'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroSearch from '../components/HeroSearch';
import DestinationCard from '../components/DestinationCard';
import HotelCard from '../components/HotelCard';
import ExperienceCard from '../components/ExperienceCard';
import BookingModal from '../components/BookingModal';
import DarshanScheduleModal from '../components/DarshanScheduleModal';
import Braj3DBackground from '../components/Braj3DBackground';
import LoginModal from '../components/LoginModal';
import { brajDestinations, brajHotels, brajExperiences } from '../lib/data';
import { Hotel } from '../types';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  MapPin,
  Clock,
  Heart,
  CalendarCheck,
  PhoneCall,
  Sun
} from 'lucide-react';

export default function HomePage() {
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<Hotel | null>(null);
  const [showDarshanModal, setShowDarshanModal] = useState<boolean>(false);
  const [activeStayCategory, setActiveStayCategory] = useState<string>('all');
  const [hotelsList, setHotelsList] = useState<Hotel[]>(brajHotels);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  React.useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const loggedIn = typeof window !== 'undefined' && localStorage.getItem('brijnidhi_logged_in') === 'true';
      setIsLoggedIn(loggedIn);
      // If user is not logged in, trigger login popup
      if (!loggedIn) {
        setShowLoginModal(true);
      } else {
        setShowLoginModal(false);
      }
    };

    checkAuth();

    window.addEventListener('brijnidhi_auth_change', checkAuth);
    return () => window.removeEventListener('brijnidhi_auth_change', checkAuth);
  }, []);

  React.useEffect(() => {
    const fetchHotels = () => {
      fetch('http://localhost:5000/api/hotels')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setHotelsList(json.data);
          }
        })
        .catch(() => {
          // fallback to brajHotels
        });
    };

    fetchHotels();
    window.addEventListener('focus', fetchHotels);
    window.addEventListener('storage', fetchHotels);
    return () => {
      window.removeEventListener('focus', fetchHotels);
      window.removeEventListener('storage', fetchHotels);
    };
  }, []);

  // Filter popular stays according to category
  const filteredPopularStays = hotelsList.filter((hotel) => {
    if (activeStayCategory === 'all') return true;
    return hotel.stayType === activeStayCategory;
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION WITH INTERACTIVE 3D BRAJ DHAM BACKGROUND */}
      <section className="relative min-h-[88vh] pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden flex items-center">
        {/* Interactive 3D Canvas of Braj Dham */}
        <Braj3DBackground />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {/* Sacred Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 animate-subtle-float">
            <span>🦚</span>
            <span>Brijnidhi • Dedicated Braj Pilgrimage Stays</span>
            <span className="hidden sm:inline">• Pure Satvik Hospitality</span>
          </div>

          {/* Main Headline from User Mockup */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-neutral-900 font-serif tracking-tight max-w-4xl mx-auto leading-[1.15]">
            DISCOVER THE HEART OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">BRAJ</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-lg sm:text-2xl text-neutral-700 font-medium max-w-2xl mx-auto font-serif italic">
            Stay close to the places that matter.
          </p>

          <p className="mt-2 text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">
            Banke Bihari • Shri Krishna Janmasthan • Radha Rani Mandir • Govardhan 21-km Parikrama
          </p>

          {/* Pilgrimage Search Box */}
          <div className="mt-10 sm:mt-12">
            <HeroSearch />
          </div>

          {/* Quick Pillar Links */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3 text-xs">
            <button
              onClick={() => setShowDarshanModal(true)}
              className="bg-white/90 hover:bg-white text-amber-950 font-bold px-4 py-2.5 rounded-full border border-amber-200/90 shadow-sm hover:shadow active:scale-95 flex items-center transition cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              Live Aarti &amp; Darshan Timings
            </button>
            <Link
              href="/experiences"
              className="bg-white/90 hover:bg-white text-amber-950 font-bold px-4 py-2.5 rounded-full border border-amber-200/90 shadow-sm hover:shadow active:scale-95 flex items-center transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              Govardhan Parikrama Guide
            </Link>
            <Link
              href="/stays?satvik=true"
              className="bg-white/90 hover:bg-white text-amber-950 font-bold px-4 py-2.5 rounded-full border border-amber-200/90 shadow-sm hover:shadow active:scale-95 flex items-center transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              100% Satvik Pure Veg Stays
            </Link>
          </div>
        </div>
      </section>

      {/* EXPLORE BRAJ DESTINATIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Sacred Abodes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-neutral-900">
              Explore Braj
            </h2>
            <p className="text-sm text-neutral-600 mt-1 max-w-xl">
              Choose your divine pilgrimage destination with dedicated stays steps from the main sanctums.
            </p>
          </div>

          {/* Quick Destination Pill Tabs */}
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {[
              { name: 'Mathura', slug: 'mathura' },
              { name: 'Vrindavan', slug: 'vrindavan' },
              { name: 'Barsana', slug: 'barsana' },
              { name: 'Govardhan', slug: 'govardhan' },
            ].map((d) => (
              <Link
                key={d.slug}
                href={`/brijnidhi/${d.slug}`}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-amber-50 hover:bg-amber-600 text-amber-950 hover:text-white border border-amber-200/90 transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
              >
                [ {d.name} ]
              </Link>
            ))}
          </div>
        </div>

        {/* 4 Primary Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brajDestinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </section>

      {/* THE BRIJNIDHI TRIAD ARCHITECTURE HIGHLIGHT */}
      <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 text-white py-14 px-4 sm:px-6 lg:px-8 my-8 shadow-xl">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
            Built Specifically for Braj Pilgrims
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-black">
            STAYS • DESTINATIONS • EXPERIENCES
          </h2>
          <p className="text-sm text-amber-100/80 max-w-2xl mx-auto leading-relaxed">
            Unlike generic aggregators, Brijnidhi designs every feature around temple darshans, parikrama routes, satvik diet, and Brajwasi hospitality.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <div className="text-2xl mb-2">🏨</div>
              <h4 className="font-bold text-base text-amber-200 font-serif">1. Pilgrimage Stays</h4>
              <p className="text-xs text-neutral-200 mt-1">
                Heritage Hotels, Pavitra Dharamshalas, Guesthouses & Quiet Vaishnava Ashrams.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <div className="text-2xl mb-2">📍</div>
              <h4 className="font-bold text-base text-amber-200 font-serif">2. Four Destinations</h4>
              <p className="text-xs text-neutral-200 mt-1">
                Mathura (Janmasthan), Vrindavan (Banke Bihari), Barsana (Radha Rani) & Govardhan (Parikrama).
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <div className="text-2xl mb-2">🕉️</div>
              <h4 className="font-bold text-base text-amber-200 font-serif">3. Spiritual Experiences</h4>
              <p className="text-xs text-neutral-200 mt-1">
                Temple Darshan schedules, 21km Parikrama electric rickshaws, Yamuna boat aarti & satvik bhojan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR STAYS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Recommended Accommodations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-neutral-900">
              Popular stays in Braj
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Hand-picked verified stays close to the principal mandirs with transparent pricing.
            </p>
          </div>

          {/* Quick Stay Type Toggle */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Stays' },
              { id: 'hotel', label: 'Hotels' },
              { id: 'dharamshala', label: 'Dharamshalas' },
              { id: 'haveli', label: 'Havelis' },
              { id: 'ashram', label: 'Ashrams' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStayCategory(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  activeStayCategory === tab.id
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hotel Grid */}
        {filteredPopularStays.length === 0 ? (
          <div className="card-temple p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl font-serif">
              🏨
            </div>
            <h3 className="text-xl font-bold font-serif text-neutral-900">
              No Stays Listed Yet
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
              We are starting with a clean verified directory. Are you a hotel, ashram, or dharamshala owner in Braj? Register and onboard your property to welcome yatris.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {isLoggedIn ? (
                <>
                  <Link href="/destinations" className="btn-primary text-xs py-2.5 px-5">
                    Explore Sacred Destinations
                  </Link>
                  <Link href="/experiences" className="btn-secondary text-xs py-2.5 px-5">
                    Live Darshan Timings
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/list-property" className="btn-primary text-xs py-2.5 px-5">
                    List Your Property
                  </Link>
                  <Link href="/account" className="btn-secondary text-xs py-2.5 px-5">
                    Devotee Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPopularStays.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onSelectBooking={(h) => setSelectedHotelForBooking(h)}
              />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/stays"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-white hover:bg-amber-600 hover:text-white text-amber-950 border border-amber-300 font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            <span>View All Braj Stays &amp; Dharamshalas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* EXPERIENCE BRAJ SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-amber-200/60 pt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Spiritual Journey</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-serif text-neutral-900">
                Experience Braj
              </h2>
              <p className="text-sm text-neutral-600 mt-1 max-w-xl">
                Temple Darshan | Govardhan Parikrama | Yamuna Ghats | Barsana | Local Food | Spiritual Experiences
              </p>
            </div>
            <Link
              href="/experiences"
              className="mt-4 md:mt-0 text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center"
            >
              <span>Explore Complete Guide & Timings</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {brajExperiences.slice(0, 3).map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </div>
      </section>

      {/* BRAJ PILGRIMAGE FAQ & YATRI ADVICE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/80 rounded-3xl p-6 sm:p-10 border border-amber-200">
          <h3 className="text-2xl font-bold font-serif text-neutral-900 text-center mb-6">
            Important Braj Yatra Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-700">
            <div className="space-y-2">
              <h4 className="font-bold text-amber-900 text-sm">🐒 Monkey Caution in Vrindavan</h4>
              <p className="leading-relaxed">
                Vrindavan monkeys target spectacles, eyeglasses, mobile phones, and plastic bags. Always store spectacles in deep pockets and keep phones tucked away inside temple galis.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-amber-900 text-sm">🥗 100% Satvik Bhojan Assurance</h4>
              <p className="leading-relaxed">
                All Brijnidhi partner kitchens serve strictly vegetarian meals prepared without onions and garlic, using authentic desi ghee and dairy from local cow shelters.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-amber-900 text-sm">🛺 Govardhan 21-KM Parikrama</h4>
              <p className="leading-relaxed">
                Can be performed barefoot, with soft cotton socks, or on authorized electric rickshaws. Brijnidhi stays offer early morning drop-offs to Dan Ghati.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-amber-900 text-sm">🛂 Janmasthan Security Check</h4>
              <p className="leading-relaxed">
                Electronic items, fitness bands, remotes, and tobacco are prohibited inside Shri Krishna Janmasthan. Book stays offering verified secure lockers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Booking Modal */}
      {selectedHotelForBooking && (
        <BookingModal
          hotel={selectedHotelForBooking}
          onClose={() => setSelectedHotelForBooking(null)}
        />
      )}

      {/* Darshan & Aarti Schedule Modal */}
      <DarshanScheduleModal
        isOpen={showDarshanModal}
        onClose={() => setShowDarshanModal(false)}
      />

      {/* Devotee Login PopUp: shows popup if user is not logged in */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setShowLoginModal(false);
        }}
        canClose={true}
      />
    </div>
  );
}
