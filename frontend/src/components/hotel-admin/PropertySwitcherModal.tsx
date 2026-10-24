'use client';

import React from 'react';
import {
  Building2,
  MapPin,
  Check,
  X,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { HotelPMSProperty } from './types';

interface PropertySwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: HotelPMSProperty[];
  activePropertyId: string;
  onSelectProperty: (property: HotelPMSProperty) => void;
}

export default function PropertySwitcherModal({
  isOpen,
  onClose,
  properties,
  activePropertyId,
  onSelectProperty
}: PropertySwitcherModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative border border-amber-200 space-y-5 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-100 border border-amber-300 px-3 py-0.5 rounded-full">
              🏛️ Multi-Property Management
            </span>
            <span className="text-[10px] text-neutral-500 font-medium">
              5 Verified Braj Sanctum Properties
            </span>
          </div>
          <h3 className="font-serif font-black text-neutral-900 text-2xl mt-1">
            Switch Active Hotel Property
          </h3>
          <p className="text-xs text-neutral-600">
            Select a hotel to switch workstation context. Its dedicated room inventory, active staff roster, bookings, and cash registers will be loaded.
          </p>
        </div>

        {/* Properties List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {properties.map(property => {
            const isActive = property.id === activePropertyId;

            return (
              <div
                key={property.id}
                onClick={() => {
                  onSelectProperty(property);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer text-left relative ${
                  isActive
                    ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-white hover:bg-neutral-50 border-neutral-200 hover:border-amber-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-neutral-900 text-amber-300 px-2 py-0.5 rounded border border-neutral-700">
                      {property.propertyCode}
                    </span>
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      {property.destination} • {property.destinationHindi}
                    </span>
                    {property.satvikCertified && (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        100% Satvik
                      </span>
                    )}
                  </div>

                  {isActive ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Active Workstation
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-neutral-400 group-hover:text-amber-700 flex items-center gap-1 self-start sm:self-auto">
                      Switch Property <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-black text-neutral-900 text-base sm:text-lg">
                  {property.name}
                </h4>

                <p className="text-xs text-neutral-600 flex items-center gap-1 mt-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{property.nearestLandmark}</span>
                </p>

                {/* Dedicated Staff Roster Preview for this Hotel */}
                <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Users className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="font-semibold text-[11px]">Staff Roster:</span>
                    <div className="flex flex-wrap gap-1">
                      {property.staff.map(s => (
                        <span
                          key={s.id}
                          className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-medium"
                        >
                          {s.name} ({s.role})
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-neutral-500">
                    {(property.initialRooms || property.rooms || []).length} Rooms • {(property.initialBookings || property.bookings || []).length} Active Stays
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-neutral-200 flex justify-between items-center text-xs text-neutral-500">
          <span>🛡️ Data Isolation: Bookings and shifts are isolated per hotel property.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
