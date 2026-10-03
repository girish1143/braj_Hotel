'use client';

import React from 'react';
import { X, Clock, MapPin, Sparkles } from 'lucide-react';

interface DarshanScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DarshanScheduleModal({ isOpen, onClose }: DarshanScheduleModalProps) {
  if (!isOpen) return null;

  const schedules = [
    {
      temple: 'Shri Banke Bihari Ji Mandir, Vrindavan',
      summerMorning: '07:45 AM - 12:00 PM (Shringar: 08:00 AM, Rajbhog: 11:55 AM)',
      summerEvening: '05:30 PM - 09:30 PM (Shayan Aarti: 09:25 PM)',
      winterMorning: '08:45 AM - 01:00 PM',
      winterEvening: '04:30 PM - 08:30 PM (Shayan Aarti: 08:25 PM)',
      rules: 'Frequent curtain draw (Parda). No direct continuous staring. Guard your spectacles from monkeys.'
    },
    {
      temple: 'Shri Krishna Janmasthan, Mathura',
      summerMorning: '05:00 AM - 12:00 PM (Mangala: 05:30 AM)',
      summerEvening: '04:00 PM - 09:30 PM (Makhan Bhog & Sandhya Aarti: 06:30 PM)',
      winterMorning: '05:30 AM - 12:00 PM',
      winterEvening: '03:00 PM - 08:30 PM',
      rules: 'Strict security. Mobile phones, smart watches, belts, and electronic car keys must be kept in cloakroom lockers.'
    },
    {
      temple: 'Prem Mandir, Vrindavan',
      summerMorning: '05:30 AM - 12:00 PM',
      summerEvening: '04:30 PM - 08:30 PM (Musical Fountain & Light Show: 07:00 PM - 07:30 PM)',
      winterMorning: '05:30 AM - 12:00 PM',
      winterEvening: '04:30 PM - 08:30 PM',
      rules: 'Photography allowed in outer gardens. Shoes must be deposited at automated counters.'
    },
    {
      temple: 'Shri Radha Rani Mandir (Shriji), Barsana',
      summerMorning: '05:00 AM - 02:00 PM (Mangala: 05:00 AM)',
      summerEvening: '05:00 PM - 09:00 PM (Shayan: 08:30 PM)',
      winterMorning: '05:30 AM - 02:00 PM',
      winterEvening: '04:30 PM - 08:30 PM',
      rules: 'Ropeway tickets available at base station. Alternatively, climb 250 stairs chanting Radhe Radhe.'
    },
    {
      temple: 'Dan Ghati Giriraj Mandir, Govardhan',
      summerMorning: 'Open 24 Hours for Dudh Abhishek',
      summerEvening: 'Grand Maha Aarti: 07:30 PM',
      winterMorning: 'Open 24 Hours for Dudh Abhishek',
      winterEvening: 'Grand Maha Aarti: 07:00 PM',
      rules: 'Offer pure cow milk. Carry small earthen cups (kulhad). Parikrama can be commenced here.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-amber-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full p-2 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Braj Darshan Sewa Guide</span>
        </div>
        <h2 className="text-2xl font-bold font-serif text-neutral-900 mb-2">
          Daily Temple Darshan & Aarti Schedules
        </h2>
        <p className="text-xs text-neutral-600 mb-6">
          Authentic Aarti and Darshan timings verified by local Brajwasi sevayats. Timings change slightly between Summer (Chaitra to Ashwin) and Winter (Kartik to Phalgun).
        </p>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {schedules.map((s) => (
            <div key={s.temple} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <h3 className="text-base font-bold text-neutral-900 font-serif mb-2 flex items-center">
                <MapPin className="w-4 h-4 text-amber-600 mr-1.5" />
                {s.temple}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="font-semibold text-neutral-800 block mb-1">Morning Darshan & Aarti:</span>
                  <p className="text-neutral-600">{s.summerMorning}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="font-semibold text-neutral-800 block mb-1">Evening Darshan & Shayan:</span>
                  <p className="text-neutral-600">{s.summerEvening}</p>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-amber-900 bg-amber-100/60 p-2 rounded-lg font-medium">
                💡 Yatri Tip: {s.rules}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow"
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
