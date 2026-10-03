import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Destination } from '../types';
import { MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link
      href={`/brijnidhi/${destination.slug}`}
      className="group relative overflow-hidden rounded-3xl bg-neutral-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block"
    >
      {/* Background Image */}
      <div className="relative h-80 w-full overflow-hidden">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Top Badge: Hindi Name & Stay Count */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <span className="bg-amber-600/90 backdrop-blur-md text-amber-50 text-xs font-semibold px-3 py-1 rounded-full border border-amber-400/40">
          {destination.hindiName}
        </span>
        <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/20">
          {destination.popularStaysCount}+ Stays
        </span>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 inset-x-0 p-6 z-10 text-white">
        <h3 className="text-2xl font-bold font-serif group-hover:text-amber-300 transition-colors flex items-center">
          {destination.name}
        </h3>
        <p className="text-xs text-amber-200/90 font-medium line-clamp-1 mt-1">
          {destination.tagline}
        </p>

        {/* Key Landmarks list */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {destination.landmarks.slice(0, 3).map((lm) => (
            <span
              key={lm.name}
              className="text-[10px] bg-white/15 backdrop-blur-sm text-neutral-200 px-2 py-0.5 rounded-md"
            >
              • {lm.name}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-amber-400">
          <span>Explore Stays & Temples</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
