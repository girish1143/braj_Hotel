'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ExperienceCard from '../../components/ExperienceCard';
import DarshanScheduleModal from '../../components/DarshanScheduleModal';
import { brajExperiences } from '../../lib/data';
import { Sparkles, Clock, Compass, MapPin, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ExperiencesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showDarshanModal, setShowDarshanModal] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Experiences' },
    { id: 'Darshan', label: 'Temple Darshan' },
    { id: 'Parikrama', label: 'Govardhan Parikrama' },
    { id: 'Ghat & Boat', label: 'Yamuna Ghats' },
    { id: 'Spiritual Walk', label: 'Barsana & Hills' },
    { id: 'Prasad & Food', label: 'Satvik Bhojan & Sweets' }
  ];

  const filteredExperiences = brajExperiences.filter((e) => {
    if (activeCategory === 'all') return true;
    return e.category === activeCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-amber-900 rounded-3xl text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-amber-800/40">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spiritual Braj Yatra Companion</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight leading-tight">
            Sacred Experiences of Braj Bhumi
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
            Beyond hotel booking, Brijnidhi helps you immerse in the authentic spiritual heritage — from Banke Bihari Mangala Aarti to the sacred 21-km Govardhan Parikrama.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setShowDarshanModal(true)}
              className="btn-gold text-xs py-2.5 px-5 flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>View Daily Aarti Schedules</span>
            </button>
            <Link
              href="/brijnidhi/govardhan"
              className="btn-secondary text-xs py-2.5 px-5 text-white bg-white/10 hover:bg-white/20 border-white/30 flex items-center space-x-1"
            >
              <span>Parikrama Stays</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-amber-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-neutral-500 font-medium">
          Showing <strong className="text-neutral-900">{filteredExperiences.length}</strong> spiritual experiences
        </span>
      </div>

      {/* Experience Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredExperiences.map((exp) => (
          <ExperienceCard key={exp.id} experience={exp} />
        ))}
      </div>

      {/* Govardhan 21-km Parikrama Deep Dive Guide */}
      <div className="bg-amber-50/80 rounded-3xl p-6 sm:p-10 border border-amber-200 shadow-sm">
        <div className="max-w-3xl">
          <span className="text-xs uppercase font-black tracking-wider text-amber-800">
            Pilgrim Master Guide
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900 mt-1 mb-3">
            The 21-KM Giriraj Govardhan Parikrama
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-6">
            The Parikrama is divided into two halves: the Badi Parikrama (12 km) and Chhoti Parikrama (9 km). Undertaken barefoot by millions every Ekadashi and Purnima, it circumambulates the hill that Bhagwan Krishna held on his finger.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
              <span className="font-bold text-amber-900 block mb-1">1. Dan Ghati Mandir</span>
              <p className="text-neutral-600 text-[11px] leading-relaxed">Continuous dudh abhishek offering. Traditional starting landmark.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
              <span className="font-bold text-amber-900 block mb-1">2. Radha Kund &amp; Shyam Kund</span>
              <p className="text-neutral-600 text-[11px] leading-relaxed">Sacred ponds created by divine love. Chhoti parikrama turning point.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
              <span className="font-bold text-amber-900 block mb-1">3. Kusum Sarovar</span>
              <p className="text-neutral-600 text-[11px] leading-relaxed">Historic sandstone monument with reflection pools and quiet gardens.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/brijnidhi/govardhan"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Book Stay On Parikrama Marg →
            </Link>
          </div>
        </div>
      </div>

      {/* Darshan Modal */}
      <DarshanScheduleModal
        isOpen={showDarshanModal}
        onClose={() => setShowDarshanModal(false)}
      />
    </div>
  );
}
