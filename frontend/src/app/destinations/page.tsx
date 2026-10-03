import React from 'react';
import Link from 'next/link';
import DestinationCard from '../../components/DestinationCard';
import { brajDestinations } from '../../lib/data';
import { Sparkles, MapPin, Compass } from 'lucide-react';

export default function DestinationsHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          <span>Sacred Geography of Braj</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-serif text-neutral-900">
          The Four Sacred Abodes
        </h1>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
          Explore the divine lands of Krishna &amp; Radha Rani. Each destination has dedicated stays, walking distances to sanctums, and verified satvik hospitality.
        </p>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {brajDestinations.map((dest) => (
          <DestinationCard key={dest.id} destination={dest} />
        ))}
      </div>

      {/* Detailed Destination Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        {brajDestinations.map((dest) => (
          <div
            key={dest.id}
            className="card-temple p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  {dest.hindiName}
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  {dest.popularStaysCount}+ Verified Stays
                </span>
              </div>
              <h3 className="text-2xl font-bold font-serif text-neutral-900 mb-2">
                {dest.name}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                {dest.description}
              </p>

              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wide mb-2">
                Primary Mandirs &amp; Ghats:
              </h4>
              <div className="space-y-1.5 mb-6">
                {dest.landmarks.map((lm) => (
                  <div key={lm.name} className="text-xs text-neutral-700 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold">{lm.name}</span> —{' '}
                      <span className="text-neutral-500 text-[11px]">{lm.distanceInfo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Best Time: <span className="font-medium text-neutral-800">{dest.bestTimeToVisit}</span>
              </span>
              <Link
                href={`/brijnidhi/${dest.slug}`}
                className="btn-primary text-xs"
              >
                Find {dest.name} Stays →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
