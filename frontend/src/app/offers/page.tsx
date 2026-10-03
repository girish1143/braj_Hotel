'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tag, Sparkles, Calendar, ShieldCheck, Copy, Check, ArrowRight } from 'lucide-react';

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  interface OfferItem {
    code: string;
    title: string;
    discount: string;
    description: string;
    validity: string;
    badge: string;
  }

  const offers: OfferItem[] = [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
          <Tag className="w-3.5 h-3.5 text-amber-600" />
          <span>Braj Pilgrimage Privileges</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-neutral-900 tracking-tight">
          Exclusive Yatra Offers &amp; Blessings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
          Special discounted rates, free parikrama shuttle passes, and complimentary satvik meals for pious pilgrims visiting Braj Bhumi.
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="card-temple p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl font-serif">
            🏷️
          </div>
          <h3 className="text-xl font-bold font-serif text-neutral-900">
            No Active Promotional Offers
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            There are currently no active seasonal coupons or promotional discount codes. Pilgrimage stays are offered at standard transparent rates without hidden surges.
          </p>
          <div className="pt-2">
            <Link href="/stays" className="btn-primary inline-flex text-xs py-2.5 px-6">
              Explore Verified Stays
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className="card-temple p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    {offer.badge}
                  </span>
                  <span className="text-lg font-black font-serif text-amber-800">
                    {offer.discount}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-serif text-neutral-900 mb-2 group-hover:text-amber-700 transition-colors">
                  {offer.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  {offer.description}
                </p>
                <span className="text-[11px] text-neutral-400 block mb-4">
                  📅 {offer.validity}
                </span>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Promo Code:</span>
                  <div className="flex items-center bg-amber-50 border border-dashed border-amber-400 rounded-xl px-2.5 py-1">
                    <span className="font-mono font-black text-xs text-amber-900 mr-2">{offer.code}</span>
                    <button
                      onClick={() => copyToClipboard(offer.code)}
                      className="p-1 hover:text-amber-700 active:scale-90 transition text-neutral-500 cursor-pointer"
                      title="Copy promo code"
                    >
                      {copiedCode === offer.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {copiedCode === offer.code && (
                    <span className="text-[10px] text-emerald-600 font-bold animate-in fade-in">Copied!</span>
                  )}
                </div>

                <Link
                  href={`/stays?promo=${offer.code}`}
                  className="btn-primary text-xs py-2 px-4 flex items-center justify-center space-x-1.5"
                >
                  <span>Apply On Stays</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
