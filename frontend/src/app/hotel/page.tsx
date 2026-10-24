import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Bed,
  CalendarCheck,
  IndianRupee,
  Sparkles,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Utensils,
  MapPin,
  ChevronRight,
  Award,
  BarChart3,
  Clock,
  HeartHandshake
} from 'lucide-react';

export const metadata = {
  title: 'Hotel Partner Network | Brijnidhi PMS',
  description: 'Join the sacred Braj hospitality network. Modern hotel PMS, direct pilgrim reservations, and Satvik certification for Mathura, Vrindavan, Barsana & Govardhan hotels.',
};

export default function HotelPublicWelcomePage() {
  const hotelPhotos = [
    {
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
      title: 'Heritage Courtyard Suites',
      location: 'Vrindavan Dham'
    },
    {
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
      title: 'Luxury Pilgrimage Rooms',
      location: 'Govardhan Parikrama'
    },
    {
      url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
      title: 'Pure Satvik Dining Hall',
      location: 'Barsana Hill'
    },
    {
      url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop',
      title: 'Devotee Reception & Lounge',
      location: 'Mathura Janmabhoomi'
    }
  ];

  const features = [
    {
      icon: Users,
      title: 'Direct Devotee Bookings',
      desc: 'Connect directly with verified pilgrimage travelers visiting Mathura, Vrindavan, Govardhan, and Barsana without paying unfair OTA commissions.'
    },
    {
      icon: Bed,
      title: 'Room Inventory & Front Desk',
      desc: 'Live tape chart, room availability tracking, rapid guest check-in/check-out, and housekeeping turnovers in one intuitive screen.'
    },
    {
      icon: Utensils,
      title: '100% Satvik Dining & POS',
      desc: 'Integrated satvik kitchen order management, room service billing, and certified pure-vegetarian pilgrim standards.'
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Staff Access',
      desc: 'Dedicated workstations and secure access control for Receptionists, Managers, Housekeepers, Cashiers, and Dining Staff.'
    },
    {
      icon: IndianRupee,
      title: 'Instant Invoicing & Payments',
      desc: 'One-click GST compliant bills, advance tracking, instant UPI QR collections, and settlement audit logs.'
    },
    {
      icon: BarChart3,
      title: 'Live Occupancy & Reports',
      desc: 'Comprehensive analytics on occupancy rates, pilgrim origin demographics, seasonal parikrama revenue, and daily front desk balance sheets.'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      {/* 1. TOP PARTNER HEADER */}
      <header className="bg-stone-950 text-amber-50 px-4 sm:px-8 py-4 border-b border-amber-900/40 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Platform Name */}
          <Link href="/hotel" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-serif font-black text-xl shadow-inner group-hover:scale-105 transition-transform">
              श्री
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-serif font-bold text-amber-100 tracking-wide">
                  Brijnidhi
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                  HOTEL PARTNER
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Braj Pilgrimage Hospitality Network</p>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/hotel/signin"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-850 border border-stone-800 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Hotel Sign In</span>
            </Link>

            <Link
              href="/list-property"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-sm transition-all shadow-amber-900/20"
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Register Your Hotel</span>
              <span className="sm:hidden">Register</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white pt-16 pb-24 px-4 sm:px-8">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Sacred Braj Hospitality Network • Mathura, Vrindavan, Barsana & Govardhan</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-amber-50 leading-[1.15]">
            Empower Your Hotel With Braj&apos;s Premier{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
              Pilgrimage PMS
            </span>{' '}
            & Devotee Network
          </h1>

          <p className="mt-6 text-sm sm:text-base lg:text-lg text-stone-300 max-w-3xl mx-auto leading-relaxed">
            Connect directly with verified yatris and pilgrimage travelers seeking clean, peaceful,
            Satvik accommodations. Seamlessly manage room inventory, staff operations, front desk
            check-ins, dining bills, and reports in one intuitive spiritual hospitality system.
          </p>

          {/* TWO PRIMARY CALL-TO-ACTION BUTTONS */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/list-property"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Building2 className="w-4 h-4 text-stone-950" />
              <span>Register Your Hotel</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </Link>

            <Link
              href="/hotel/signin"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-stone-200 bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-500/40 transition-all"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Hotel Sign In</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 pt-8 border-t border-stone-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-stone-400 text-xs">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>100% Satvik Purity Certified</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Zero Commission Direct Stays</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Instant Staff Role Management</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Live Room Tape Chart</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOTEL PHOTOGRAPHY SHOWCASE */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-stone-200/80">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-amber-700 text-xs font-bold uppercase tracking-wider">
                Exemplary Pilgrimage Stays
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
                Designed for Devotee Comfort & Sanctity
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md">
              From historic temple-side guest suites to riverside Vrindavan dharamshalas and boutique
              pilgrim retreats, our platform caters to spiritual hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotelPhotos.map((photo, i) => (
              <div
                key={i}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100 shadow-xs border border-stone-200/60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex flex-col justify-end p-4 text-white">
                  <div className="text-xs font-semibold text-amber-200">{photo.title}</div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-300">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{photo.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURE CARDS */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-amber-800 text-xs font-bold uppercase tracking-wider">
            Comprehensive Management System
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Built Specifically for Holy Braj Dham Operations
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Every feature is crafted to meet the high standards of front desk operations, housekeeping
            purity, and religious tourism.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 border border-amber-100">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">{feat.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed flex-1">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. WHY PARTNER WITH BRIJNIDHI */}
      <section className="py-16 px-4 sm:px-8 bg-stone-100 border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-stone-900 to-stone-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Partner Advantage
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold mt-2 text-amber-50">
                Why Braj Hoteliers Choose Brijnidhi PMS
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-3 leading-relaxed">
                Generic hotel software does not understand temple parikrama timings, satvik kitchen
                regulations, and pilgrim group check-ins. Brijnidhi is custom-engineered for
                Vrindavan, Mathura, Govardhan, and Barsana stays.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-xs text-stone-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <span>Instant hotel admin account creation with no setup fees</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <span>Full control over room pricing, seasonal weekend rates, and bed capacities</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    ✓
                  </div>
                  <span>Real-time staff management with customized role workstations</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/list-property"
                  className="px-6 py-3 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors inline-flex items-center gap-2"
                >
                  <span>Register Your Hotel Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/hotel/signin"
                  className="px-6 py-3 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-750 transition-colors inline-flex items-center gap-2"
                >
                  <span>Already Registered? Sign In</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOTEL PARTNER FOOTER */}
      <footer className="bg-stone-950 text-stone-400 text-xs py-12 px-4 sm:px-8 border-t border-amber-900/30 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-serif font-black text-sm">
              श्री
            </div>
            <div>
              <div className="text-sm font-serif font-bold text-stone-200">
                Brijnidhi Hotel Partner Portal
              </div>
              <div className="text-[11px] text-stone-500">
                Pious Pilgrimage Management for Holy Braj Dham
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-stone-400">
            <Link href="/hotel" className="hover:text-amber-300 transition-colors">
              Home
            </Link>
            <Link href="/list-property" className="hover:text-amber-300 transition-colors">
              Register Hotel
            </Link>
            <Link href="/hotel/signin" className="hover:text-amber-300 transition-colors">
              Hotel Sign In
            </Link>
            <Link href="/destinations" className="hover:text-amber-300 transition-colors">
              Braj Destinations
            </Link>
          </div>

          <div className="text-center md:text-right text-[11px] text-stone-500">
            <div>© {new Date().getFullYear()} Brijnidhi PMS. All rights reserved.</div>
            <div className="text-amber-500/80 mt-0.5">Strictly 100% Satvik Hospitality Network</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
