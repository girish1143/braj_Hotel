'use client';

import React, { useState, useEffect } from 'react';
import { Hotel, RoomOption, BookingResponse } from '../types';
import { createBooking } from '../lib/api';
import { Check, Calendar, Users, ShieldCheck, Sparkles, X, Phone, User, Mail } from 'lucide-react';

interface BookingModalProps {
  hotel: Hotel | null;
  onClose: () => void;
}

export default function BookingModal({ hotel, onClose }: BookingModalProps) {
  // Lock background body scroll while booking modal is open
  useEffect(() => {
    if (hotel) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [hotel]);

  if (!hotel) return null;

  const [selectedRoom, setSelectedRoom] = useState<RoomOption>(hotel.rooms[0]);
  const [checkInDate, setCheckInDate] = useState('2026-10-10');
  const [checkOutDate, setCheckOutDate] = useState('2026-10-12');
  const [guestsCount, setGuestsCount] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);

  // Pilgrimage Add-ons
  const [darshanPass, setDarshanPass] = useState(true);
  const [parikramaRickshaw, setParikramaRickshaw] = useState(false);
  const [satvikThali, setSatvikThali] = useState(true);

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(null);

  // Calculations
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
  const roomCost = selectedRoom.pricePerNight * nights * roomsCount;
  const darshanCost = darshanPass ? 250 : 0;
  const rickshawCost = parikramaRickshaw ? 800 : 0;
  const mealsCost = satvikThali ? 350 * nights * guestsCount : 0;
  const addOnsTotal = darshanCost + rickshawCost + mealsCost;
  const tax = Math.round(roomCost * 0.12);
  const totalAmount = roomCost + tax + addOnsTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) {
      alert('Please fill your Name and Mobile Number for booking verification.');
      return;
    }

    setLoading(true);
    try {
      const response = await createBooking({
        hotelId: hotel.id,
        hotelName: hotel.name,
        destinationSlug: hotel.destinationSlug,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        checkInDate,
        checkOutDate,
        guestsCount,
        roomsCount,
        guestName,
        guestEmail: guestEmail || `${guestPhone}@braj-yatri.com`,
        guestPhone,
        specialRequests,
        addOns: {
          darshanPassAssistance: darshanPass,
          parikramaERickshaw: parikramaRickshaw,
          satvikBhojanThali: satvikThali,
        }
      });

      setConfirmedBooking(response);

      try {
        const stored = JSON.parse(localStorage.getItem('brijnidhi_my_bookings') || '[]');
        const newBookingRecord = {
          id: response.id || `book-${Date.now()}`,
          bookingReference: response.bookingReference || `BRJ-${Math.floor(100000 + Math.random() * 900000)}`,
          hotelName: response.hotelName || hotel.name,
          destination: hotel.destinationName || 'Vrindavan',
          address: hotel.address || 'Near Principal Temple, Braj Dham',
          hotelPhone: '+91 98765 43210',
          room: response.roomName || selectedRoom.name,
          checkIn: response.checkInDate || checkInDate,
          checkOut: response.checkOutDate || checkOutDate,
          totalNights: response.totalNights || nights,
          guests: response.guestsCount || guestsCount,
          totalAmount: response.grandTotal || (selectedRoom.pricePerNight * nights),
          roomCharges: response.roomCharges || (selectedRoom.pricePerNight * nights),
          taxAmount: response.taxAmount || Math.round((selectedRoom.pricePerNight * nights) * 0.12),
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentMethod: 'Instant UPI / QR',
          cancellationPolicy: hotel.policies?.cancellation || 'Flexible: 100% refund up to 24 hrs before check-in',
          addOns: [
            darshanPass ? 'Temple Darshan Desk Assistance' : '',
            parikramaRickshaw ? 'Govardhan 21-km E-Rickshaw' : '',
            satvikThali ? 'Pure Satvik Mahaprasad Bhojan' : ''
          ].filter(Boolean)
        };
        localStorage.setItem('brijnidhi_my_bookings', JSON.stringify([newBookingRecord, ...stored]));
      } catch (e) {
        console.warn('Booking localStorage note:', e);
      }
    } catch (err) {
      alert('Error creating booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-amber-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full p-2 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedBooking ? (
          /* Confirmation Success Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              🙏 Radhe Radhe! Booking Confirmed
            </span>
            <h2 className="text-2xl font-black font-serif text-neutral-900">
              {hotel.name}
            </h2>
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-amber-200/50 pb-2">
                <span className="text-neutral-600">Booking Reference:</span>
                <span className="font-mono font-bold text-amber-900 text-sm">
                  {confirmedBooking.bookingReference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Devotee Name:</span>
                <span className="font-semibold text-neutral-900">{confirmedBooking.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Dates:</span>
                <span className="font-semibold text-neutral-900">
                  {confirmedBooking.checkInDate} to {confirmedBooking.checkOutDate} ({confirmedBooking.totalNights} Nights)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Room:</span>
                <span className="font-semibold text-neutral-900">{confirmedBooking.roomName}</span>
              </div>
              <div className="flex justify-between border-t border-amber-200/50 pt-2 font-bold text-sm text-neutral-900">
                <span>Grand Total:</span>
                <span className="text-amber-800">₹{confirmedBooking.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              A confirmation SMS and WhatsApp message has been dispatched to {confirmedBooking.guestPhone}. Our Braj Yatri desk has been notified.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow"
              >
                Close & View Braj Guide
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div>
            <div className="border-b border-neutral-100 pb-4 mb-4">
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wide">
                <span>{hotel.destinationName}</span>
                <span>•</span>
                <span>{hotel.nearestLandmark}</span>
              </div>
              <h2 className="text-2xl font-bold font-serif text-neutral-900 mt-1">
                Reserve Stay at {hotel.name}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select Room */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Select Room Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hotel.rooms.map((room) => {
                    const isSelected = selectedRoom.id === room.id;
                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                            : 'border-neutral-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-neutral-900">{room.name}</h4>
                          <span className="font-serif font-black text-amber-700 text-xs">
                            ₹{room.pricePerNight}/nt
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          {room.capacity} Guests • {room.bedType}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dates & Guests */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-xs">
                <div>
                  <span className="text-neutral-500 block mb-1">Check-in</span>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 font-medium"
                  />
                </div>
                <div>
                  <span className="text-neutral-500 block mb-1">Check-out</span>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 font-medium"
                  />
                </div>
                <div>
                  <span className="text-neutral-500 block mb-1">Guests</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 font-medium"
                  />
                </div>
                <div>
                  <span className="text-neutral-500 block mb-1">Rooms</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 font-medium"
                  />
                </div>
              </div>

              {/* Braj Pilgrimage Add-ons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Braj Pilgrimage Special Add-ons
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-amber-200 bg-amber-50/30 text-xs cursor-pointer hover:bg-amber-50">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={darshanPass}
                        onChange={(e) => setDarshanPass(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="font-semibold text-neutral-900">Temple Darshan Pass & Locker Assistance</span>
                        <p className="text-[10px] text-neutral-500">Dedicated assistance for elderly yatris & safe luggage locker</p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-800">+₹250</span>
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-amber-200 bg-amber-50/30 text-xs cursor-pointer hover:bg-amber-50">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={parikramaRickshaw}
                        onChange={(e) => setParikramaRickshaw(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="font-semibold text-neutral-900">Dedicated Electric Rickshaw for Parikrama</span>
                        <p className="text-[10px] text-neutral-500">Verified Brajwasi driver for 21-km Govardhan or Vrindavan Parikrama</p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-800">+₹800</span>
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-amber-200 bg-amber-50/30 text-xs cursor-pointer hover:bg-amber-50">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={satvikThali}
                        onChange={(e) => setSatvikThali(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="font-semibold text-neutral-900">Daily Satvik Bhojan Thali (Pure Desi Ghee)</span>
                        <p className="text-[10px] text-neutral-500">No onion, no garlic, freshly prepared Vaishnava prasad</p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-800">+₹350/day</span>
                  </label>
                </div>
              </div>

              {/* Devotee Contact Information */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Devotee Contact Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name (e.g. Ramesh Chandra)"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="input-temple text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="WhatsApp / Mobile (+91)"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="input-temple text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Price Calculation and CTA */}
              <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left w-full sm:w-auto">
                  <div className="text-[11px] text-neutral-500">
                    {nights} Night(s) • Room: ₹{roomCost} + GST: ₹{tax} + Add-ons: ₹{addOnsTotal}
                  </div>
                  <div className="text-2xl font-black font-serif text-neutral-900">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto btn-primary text-sm py-3.5 px-8 disabled:opacity-50"
                >
                  {loading ? 'Confirming Stay...' : 'Confirm Stay (Pay at Hotel / Online)'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
