import React from 'react';
import Image from 'next/image';
import { Experience } from '../types';
import { Clock, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <div className="card-temple overflow-hidden flex flex-col group">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
            {experience.category}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center">
          <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400" />
          <span>{experience.destinationName}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold font-serif text-neutral-900 group-hover:text-amber-700 transition-colors">
            {experience.title}
          </h3>

          <div className="flex items-center text-xs text-neutral-500 mt-2 space-x-3">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
              {experience.duration}
            </span>
          </div>

          <p className="text-xs text-neutral-600 mt-2.5 leading-relaxed line-clamp-3">
            {experience.description}
          </p>

          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5">
            {experience.highlights.slice(0, 2).map((hl, idx) => (
              <div key={idx} className="flex items-start text-[11px] text-neutral-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0 mt-0.5" />
                <span>{hl}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100">
          <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200/60">
            <span className="font-semibold">Best Time:</span> {experience.timings}
          </div>
        </div>
      </div>
    </div>
  );
}
