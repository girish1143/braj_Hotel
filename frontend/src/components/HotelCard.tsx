'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Hotel } from '../types';
import { Star, MapPin, ShieldCheck, ArrowRight, Heart } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  onSelectBooking?: (hotel: Hotel) => void;
}

export default function HotelCard({ hotel, onSelectBooking }: HotelCardProps) {
  const stayTypeLabel: Record<string, string> = {
    hotel: 'Heritage Hotel',
    dharamshala: 'Pavitra Dharamshala',
    ashram: 'Spiritual Ashram',
    guesthouse: 'Ghat Guesthouse',
    haveli: 'Braj Haveli'
  };

  return (
    <div className="card-temple overflow-hidden flex flex-col group">
      {/* Image & Badges */}
      <div className="relative h-60 w-full overflow-hidden bg-neutral-100">
        <Image
          src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop'}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-10">
          <span className="bg-white/95 backdrop-blur-md text-amber-900 text-[11px] font-black px-3 py-1 rounded-full shadow-md border border-amber-100">
            {stayTypeLabel[hotel.stayType] || 'Stay'}
          </span>
          {hotel.pureSatvikKitchen && (
            <span className="bg-emerald-700/95 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center shadow-md border border-emerald-500/40">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-200" />
              100% Satvik
            </span>
          )}
        </div>

        {/* Distance Badge on Image bottom */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
          <div className="inline-flex items-center bg-black/80 backdrop-blur-md text-amber-300 text-xs px-3 py-1.5 rounded-xl border border-amber-400/40 shadow-md">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
            <span className="font-bold">{hotel.distanceToMainTemple}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Destination and Rating */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="uppercase tracking-widest font-black text-amber-800 text-[11px]">
              {hotel.destinationName}
            </span>
            <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/90 text-amber-950 font-black">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
              <span>{hotel.ratingScore}</span>
              <span className="text-neutral-400 font-normal ml-1 text-[11px]">({hotel.reviewsCount})</span>
            </div>
          </div>

          {/* Hotel Name */}
          <Link href={`/stays/${hotel.slug}`} className="block group-hover:text-amber-700 transition-colors">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 font-serif line-clamp-1">
              {hotel.name}
            </h3>
          </Link>

          <p className="text-xs text-neutral-600 line-clamp-2 mt-2 leading-relaxed">
            {hotel.shortDescription}
          </p>

          {/* Proximity Highlights */}
          <div className="mt-3.5 py-2.5 border-y border-amber-100/80 space-y-1.5">
            {hotel.landmarkDistances.slice(0, 2).map((ld) => (
              <div key={ld.landmark} className="flex items-center text-xs text-neutral-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 shrink-0" />
                <span className="font-bold text-neutral-900">{ld.walkMinutes} min walk</span>
                <span className="text-neutral-400 mx-1">to</span>
                <span className="truncate font-medium">{ld.landmark}</span>
              </div>
            ))}
          </div>

          {/* Key Amenities */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-[10px] bg-neutral-100 text-neutral-700 font-medium px-2.5 py-0.5 rounded-md"
              >
                {amenity}
              </span>
            ))}
            {hotel.templeDarshanAssistance && (
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                🙏 Darshan Desk
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase font-semibold">Starting from</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-neutral-900 font-serif">
                ₹{hotel.pricePerNight.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-neutral-400 line-through">
                ₹{hotel.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">/ nt</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/stays/${hotel.slug}`}
              className="btn-secondary text-xs py-2 px-3"
            >
              Details
            </Link>
            <button
              onClick={() => onSelectBooking ? onSelectBooking(hotel) : null}
              className="btn-primary text-xs py-2 px-3.5 flex items-center space-x-1"
            >
              <span>Book Stay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
