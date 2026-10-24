'use client';

import React, { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { brajHotels } from '../../../lib/data';
import { API_BASE_URL } from '../../../lib/api';
import { Hotel } from '../../../types';
import BookingModal from '../../../components/BookingModal';
import {
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Users,
  Info,
  Phone,
  ArrowRight
} from 'lucide-react';

export default function HotelDetailPage() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const idOrSlug = (rawId || '').toLowerCase();

  const [hotel, setHotel] = useState<Hotel | null>(() =>
    brajHotels.find(
      (h) => h.id.toLowerCase() === idOrSlug || h.slug.toLowerCase() === idOrSlug
    ) || null
  );
  const [loading, setLoading] = useState<boolean>(!hotel);

  React.useEffect(() => {
    if (!hotel && idOrSlug) {
      fetch(`${API_BASE_URL}/hotels/${idOrSlug}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setHotel(json.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [idOrSlug, hotel]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <p className="text-xs text-neutral-500">Loading stay details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-bold font-serif">Stay Not Found</h1>
        <p className="text-xs text-neutral-600 mt-2">
          The requested pilgrimage accommodation was not found in our directory.
        </p>
        <Link href="/stays" className="mt-4 inline-block btn-primary text-xs">
          View All Stays
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-amber-700 font-medium">Home</Link>
        <span>/</span>
        <Link href={`/brijnidhi/${hotel.destinationSlug}`} className="hover:text-amber-700 uppercase font-bold text-amber-800">
          {hotel.destinationName}
        </Link>
        <span>/</span>
        <span className="text-neutral-900 font-bold truncate max-w-xs">{hotel.name}</span>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-amber-100 text-amber-950 font-black text-xs px-3 py-1 rounded-full uppercase border border-amber-200">
              {hotel.destinationName} • {hotel.stayType}
            </span>
            {hotel.pureSatvikKitchen && (
              <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full flex items-center border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                100% Satvik Pure Veg
              </span>
            )}
            {hotel.templeDarshanAssistance && (
              <span className="bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs px-3 py-1 rounded-full">
                🙏 Darshan Desk Assistance
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-neutral-900">
            {hotel.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 flex items-center">
            <MapPin className="w-4 h-4 text-amber-600 mr-1.5 shrink-0" />
            <span>{hotel.address}</span>
            <span className="mx-2 text-neutral-300">•</span>
            <span className="text-amber-800 font-bold">{hotel.distanceToMainTemple}</span>
          </p>
        </div>

        {/* Rating and Price Box */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-center justify-end text-xs text-amber-600 font-bold">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500 mr-1" />
              <span className="text-base font-black text-neutral-900">{hotel.ratingScore}</span>
              <span className="text-neutral-500 font-medium ml-1">({hotel.reviewsCount} reviews)</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl sm:text-3xl font-black font-serif text-neutral-900">
                ₹{hotel.pricePerNight.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-neutral-500 font-medium"> / night</span>
            </div>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center space-x-1"
          >
            <span>Reserve Stay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl overflow-hidden shadow-xl border border-amber-200/80 bg-neutral-900">
        <div className="md:col-span-2 relative h-80 sm:h-[420px] w-full">
          <Image
            src={hotel.images[activeImageIndex] || hotel.images[0]}
            alt={hotel.name}
            fill
            priority
            className="object-cover transition-opacity duration-300"
          />
        </div>
        <div className="hidden md:flex flex-col gap-4 p-3 bg-neutral-950/60 justify-center">
          {hotel.images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`relative h-28 w-full rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                activeImageIndex === idx ? 'border-amber-500 scale-[1.02] shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img} alt="preview" fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Details vs Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Temple Proximity Card */}
          <div className="bg-amber-50/80 rounded-3xl p-6 sm:p-7 border border-amber-200 shadow-sm">
            <h3 className="text-lg font-bold font-serif text-neutral-900 flex items-center mb-4">
              <MapPin className="w-5 h-5 text-amber-600 mr-2" />
              Proximity to Braj Temples &amp; Sacred Landmarks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hotel.landmarkDistances.map((ld) => (
                <div key={ld.landmark} className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-neutral-900 block">{ld.landmark}</span>
                    <span className="text-[11px] text-neutral-500 font-medium">{ld.distanceMeters} meters away</span>
                  </div>
                  <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    ⏱️ {ld.walkMinutes} min walk
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* About Stay */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
            <h3 className="text-xl font-bold font-serif text-neutral-900">
              About This Pilgrimage Stay
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              {hotel.description}
            </p>

            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 pt-3">
              Stay Amenities &amp; Services
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {hotel.amenities.map((am) => (
                <div key={am} className="text-xs text-neutral-700 flex items-center space-x-2 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{am}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rooms Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
            <h3 className="text-xl font-bold font-serif text-neutral-900">
              Available Room Categories
            </h3>
            <div className="space-y-4">
              {hotel.rooms.map((room) => (
                <div key={room.id} className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-amber-400 transition">
                  <div>
                    <h4 className="font-bold text-base text-neutral-900 font-serif">{room.name}</h4>
                    <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                      Max Capacity: {room.capacity} Guests • {room.bedType}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {room.features.map((f) => (
                        <span key={f} className="text-[10px] bg-white text-neutral-700 font-medium px-2.5 py-0.5 rounded-md border border-neutral-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-2xl font-black font-serif text-neutral-900">
                      ₹{room.pricePerNight.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-neutral-500 block">/ night</span>
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="mt-2.5 btn-primary text-xs py-2 px-4 shadow"
                    >
                      Book Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pilgrimage Policies */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 text-xs space-y-2">
            <h4 className="font-bold text-neutral-900 uppercase tracking-wide">Pilgrimage Guidelines &amp; Policies</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-neutral-600 pt-1">
              <div>
                <span className="font-bold block text-neutral-800">Check-in / Out</span>
                <span>In: {hotel.policies.checkIn} | Out: {hotel.policies.checkOut}</span>
              </div>
              <div>
                <span className="font-bold block text-neutral-800">Satvik Purity</span>
                <span>Non-veg food &amp; alcohol strictly prohibited in premises.</span>
              </div>
              <div>
                <span className="font-bold block text-neutral-800">Cancellation</span>
                <span>{hotel.policies.cancellation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Booking Box */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-white rounded-3xl p-6 border border-amber-200 shadow-xl space-y-5">
            <div className="border-b border-neutral-100 pb-3.5">
              <span className="text-xs text-neutral-500 block uppercase font-bold tracking-wide">Special Pilgrimage Rate</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-black font-serif text-neutral-900">
                  ₹{hotel.pricePerNight.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-neutral-400 line-through">
                  ₹{hotel.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-neutral-500 font-medium">/ night</span>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/70 text-xs space-y-2">
              <span className="font-bold text-amber-950 block flex items-center">
                <Sparkles className="w-4 h-4 mr-1 text-amber-600" />
                Brijnidhi Devotee Inclusions
              </span>
              <p className="text-[11px] text-neutral-700 leading-relaxed">
                • Verified 100% Satvik Kitchen
              </p>
              <p className="text-[11px] text-neutral-700 leading-relaxed">
                • Early Morning Temple Darshan desk support
              </p>
              <p className="text-[11px] text-neutral-700 leading-relaxed">
                • Safe luggage locker for mobile/electronics security
              </p>
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full btn-primary text-sm py-4 shadow-lg hover:shadow-xl"
            >
              Check Availability &amp; Book
            </button>

            <div className="text-center pt-1">
              <span className="text-[11px] text-neutral-500 block">
                ✓ Instant Confirmation • Pay at Hotel Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal hotel={hotel} onClose={() => setShowBookingModal(false)} />
      )}
    </div>
  );
}
