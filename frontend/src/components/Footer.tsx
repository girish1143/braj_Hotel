import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Heart, ShieldCheck, Sun, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t-4 border-amber-600">
      {/* Sacred pilgrimage assurance bar */}
      <div className="bg-neutral-950/60 py-6 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">100% Satvik Verified</h4>
              <p className="text-xs text-neutral-400">Strictly pure vegetarian, onion-garlic free options available</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Stay Close to Temples</h4>
              <p className="text-xs text-neutral-400">Walking distance to Banke Bihari, Janmasthan & Parikrama</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Braj Darshan & Parikrama Sewa</h4>
              <p className="text-xs text-neutral-400">E-rickshaw bookings, elderly darshan passes & local guides</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🕉️</span>
              <span className="text-xl font-bold tracking-wider text-white font-serif">
                BRIJ<span className="text-amber-500">NIDHI</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Brijnidhi is the dedicated pilgrimage hospitality platform for Braj Bhumi. We connect yatris with clean hotels, sacred dharamshalas, ashrams, and spiritual experiences across Mathura, Vrindavan, Barsana, and Govardhan.
            </p>
            <div className="pt-2 text-xs text-amber-400 flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5 fill-amber-400" />
              <span>Dedicated with devotion to Shri Radha Krishna</span>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Sacred Destinations
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/brijnidhi/vrindavan" className="hover:text-amber-400 transition-colors">
                  Vrindavan Stays (Banke Bihari, Prem Mandir)
                </Link>
              </li>
              <li>
                <Link href="/brijnidhi/mathura" className="hover:text-amber-400 transition-colors">
                  Mathura Stays (Krishna Janmasthan, Vishram Ghat)
                </Link>
              </li>
              <li>
                <Link href="/brijnidhi/barsana" className="hover:text-amber-400 transition-colors">
                  Barsana Stays (Radha Rani Mandir, Rangeeli Mahal)
                </Link>
              </li>
              <li>
                <Link href="/brijnidhi/govardhan" className="hover:text-amber-400 transition-colors">
                  Govardhan Stays (Parikrama Route, Dan Ghati)
                </Link>
              </li>
            </ul>
          </div>

          {/* Pilgrimage Stays */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Pilgrimage Stays
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/stays?type=hotel" className="hover:text-amber-400 transition-colors">
                  Braj Heritage Hotels
                </Link>
              </li>
              <li>
                <Link href="/stays?type=dharamshala" className="hover:text-amber-400 transition-colors">
                  Clean Dharamshalas & Bhavans
                </Link>
              </li>
              <li>
                <Link href="/stays?type=ashram" className="hover:text-amber-400 transition-colors">
                  Vaishnava Ashrams & Kutirs
                </Link>
              </li>
              <li>
                <Link href="/stays?type=guesthouse" className="hover:text-amber-400 transition-colors">
                  Ghat-Facing Guest Houses
                </Link>
              </li>
              <li>
                <Link href="/experiences" className="hover:text-amber-400 transition-colors">
                  Temple Aarti Timings & Darshan Pass
                </Link>
              </li>
            </ul>
          </div>

          {/* Helpline & Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Yatri Assistance
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Brijnidhi Yatri Sewa Kendra, Raman Reti, Vrindavan, Mathura UP 281121</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+91 98765 43210 (24x7 Braj Helpline)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>sewa@brijnidhi.org</span>
              </div>
              <div className="mt-3 p-3 bg-neutral-800/80 rounded-xl border border-neutral-700">
                <p className="text-[11px] text-amber-300 font-semibold mb-1">Planning a Parikrama or Large Group Yatra?</p>
                <p className="text-[10px] text-neutral-400">Contact our Brajwasi team for bulk ashram bookings and customized satsang halls.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 space-y-2 md:space-y-0">
          <p>© {new Date().getFullYear()} Brijnidhi. All rights reserved. Dedicated to Braj Dham Tourism & Pilgrimage.</p>
          <div className="flex space-x-6">
            <Link href="/stays" className="hover:text-neutral-400">All Stays</Link>
            <Link href="/destinations" className="hover:text-neutral-400">Destinations</Link>
            <Link href="/experiences" className="hover:text-neutral-400">Experiences</Link>
            <Link href="/offers" className="hover:text-neutral-400">Yatra Offers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
