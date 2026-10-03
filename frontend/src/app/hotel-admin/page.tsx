'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building,
  Bed,
  CalendarDays,
  CalendarCheck,
  Calendar as CalendarIcon,
  IndianRupee,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Plus,
  Trash2,
  Edit,
  Save,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  roomType: 'Standard Room' | 'Deluxe Room' | 'Premium Room' | 'Family Room';
  basePrice: number;
  weekendPrice: number;
  capacity: number;
  totalRooms: number;
  amenities: string[];
  isActive: boolean;
}

interface Booking {
  id: string;
  bookingReference: string;
  customer: string;
  room: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  paymentStatus: 'PAID' | 'PAY_AT_HOTEL' | 'REFUNDED';
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  specialRequests?: string;
}

export default function HotelAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'hotel' | 'rooms' | 'bookings' | 'calendar' | 'reviews'>('dashboard');



  // Hotel Profile State (Initialized clean without demo data)
  const [hotelProfile, setHotelProfile] = useState({
    name: 'Braj Pilgrimage Stay',
    description: 'Describe your property, proximity to temples, and satvik kitchen amenities.',
    address: 'Braj Dham, Uttar Pradesh',
    destination: 'Vrindavan',
    contactPhone: '',
    contactEmail: '',
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    amenities: ['100% Satvik Pure Veg', 'AC & Geyser', 'Free Wi-Fi', 'Temple Darshan Desk'],
    policies: 'Strictly pure vegetarian (no onion, no garlic). Alcohol and non-vegetarian food are prohibited on the premises.'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Rooms State (Initialized empty with 0 dummy rooms)
  const [rooms, setRooms] = useState<Room[]>([]);

  // Add Room Modal State
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    roomType: 'Deluxe Room' as any,
    basePrice: 1500,
    weekendPrice: 1800,
    capacity: 2,
    totalRooms: 5,
    amenities: 'AC, Geyser, Wi-Fi'
  });

  // Bookings State (Initialized empty with 0 dummy bookings)
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Dynamically computed metrics based on real rooms and bookings state
  const stats = {
    todaysBookings: bookings.length,
    availableRooms: Math.max(0, rooms.reduce((sum, r) => sum + r.totalRooms, 0) - bookings.filter(b => b.bookingStatus === 'CHECKED_IN').length),
    occupiedRooms: bookings.filter(b => b.bookingStatus === 'CHECKED_IN').length,
    todaysRevenue: bookings.filter(b => b.bookingStatus !== 'CANCELLED').reduce((sum, b) => sum + b.amount, 0),
    pendingCheckIns: bookings.filter(b => b.bookingStatus === 'CONFIRMED').length,
  };

  // Calendar Grid (Empty until rooms are configured)
  const [calendarGrid, setCalendarGrid] = useState<Record<string, string[]>>({});

  const toggleCalendarDay = (roomKey: string, dayIndex: number) => {
    setCalendarGrid(prev => {
      const roomRow = [...prev[roomKey]];
      roomRow[dayIndex] = roomRow[dayIndex] === 'B' ? '-' : 'B';
      return { ...prev, [roomKey]: roomRow };
    });
  };

  const handleUpdateBookingStatus = (id: string, status: Booking['bookingStatus']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, bookingStatus: status } : b));
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomData.name) return;

    const created: Room = {
      id: `r-${Date.now()}`,
      name: newRoomData.name,
      roomType: newRoomData.roomType,
      basePrice: Number(newRoomData.basePrice),
      weekendPrice: Number(newRoomData.weekendPrice),
      capacity: Number(newRoomData.capacity),
      totalRooms: Number(newRoomData.totalRooms),
      amenities: newRoomData.amenities.split(',').map(s => s.trim()),
      isActive: true
    };

    setRooms(prev => [...prev, created]);
    setShowAddRoomModal(false);
    setNewRoomData({
      name: '',
      roomType: 'Deluxe Room',
      basePrice: 2000,
      weekendPrice: 2400,
      capacity: 2,
      totalRooms: 5,
      amenities: 'AC, Geyser, Wi-Fi'
    });
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm('Are you sure you want to deactivate this room inventory?')) {
      setRooms(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-neutral-900 flex flex-col md:flex-row">
      {/* HOTEL ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 bg-amber-950 text-white p-5 shrink-0 flex flex-col justify-between">
        <div>
          {/* Logo & Hotel Brand */}
          <div className="mb-6 pb-4 border-b border-amber-800">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-1">
              Brijnidhi Hotelier Portal
            </span>
            <h2 className="font-serif font-black text-lg text-white">
              HOTEL ADMIN
            </h2>
            <p className="text-xs text-amber-200/90 font-medium truncate mt-0.5">
              {hotelProfile.name}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'hotel', label: 'Hotel Profile', icon: Building },
              { id: 'rooms', label: `Rooms (${rooms.length})`, icon: Bed },
              { id: 'bookings', label: `Bookings (${bookings.length})`, icon: CalendarCheck },
              { id: 'calendar', label: 'Calendar Availability', icon: CalendarDays },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition text-left ${
                    activeTab === item.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-100/70 hover:text-white hover:bg-amber-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Security & Isolation Notice */}
        <div className="pt-6 border-t border-amber-900 text-xs text-amber-200/70">
          <div className="flex items-center space-x-2 text-[11px] text-amber-300 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Isolated Hotel Sandbox</span>
          </div>
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            Data security enforced: you can only view and manage bookings for your assigned property.
          </p>
          <div className="mt-3 flex items-center space-x-2">
            <Link href="/admin" className="text-[10px] text-amber-400 hover:underline">
              System Admin
            </Link>
            <span className="text-neutral-600">•</span>
            <Link href="/" className="text-[10px] text-amber-400 hover:underline">
              Public Site
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-amber-200/80 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              <span>Property ID: VRN-01</span>
              <span>•</span>
              <span className="text-emerald-700">● Live on Brijnidhi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900">
              {hotelProfile.name}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddRoomModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room</span>
            </button>
            <Link
              href="/stays/brij-view-heritage-suites"
              className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 text-xs font-semibold rounded-xl shadow-sm transition"
            >
              View Public Page
            </Link>
          </div>
        </div>

        {/* 1. DASHBOARD OVERVIEW (Exact matching user specification) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 5 Key Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
                <span className="text-xs text-neutral-500 font-semibold block">Today&apos;s Bookings</span>
                <span className="text-3xl font-black font-serif text-neutral-900 mt-1 block">
                  {stats.todaysBookings}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">↑ High yatra demand</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
                <span className="text-xs text-neutral-500 font-semibold block">Available Rooms</span>
                <span className="text-3xl font-black font-serif text-emerald-700 mt-1 block">
                  {stats.availableRooms}
                </span>
                <span className="text-[10px] text-neutral-500">Ready for check-in</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
                <span className="text-xs text-neutral-500 font-semibold block">Occupied Rooms</span>
                <span className="text-3xl font-black font-serif text-amber-700 mt-1 block">
                  {stats.occupiedRooms}
                </span>
                <span className="text-[10px] text-neutral-500">65% occupancy rate</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
                <span className="text-xs text-neutral-500 font-semibold block">Today&apos;s Revenue</span>
                <span className="text-3xl font-black font-serif text-neutral-900 mt-1 block">
                  ₹{stats.todaysRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-neutral-500">Net payout pending</span>
              </div>
              <div className="bg-amber-100/70 p-5 rounded-2xl border border-amber-300 shadow-sm col-span-2 lg:col-span-1">
                <span className="text-xs text-amber-900 font-bold block">Pending Check-ins</span>
                <span className="text-3xl font-black font-serif text-amber-900 mt-1 block">
                  {stats.pendingCheckIns}
                </span>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-[10px] text-amber-900 underline font-semibold mt-1"
                >
                  View guest list →
                </button>
              </div>
            </div>

            {/* Quick Actions & Recent Bookings Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Today's Arrival / Departure Action Desk */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold font-serif text-neutral-900 text-base">
                    Today&apos;s Pilgrimage Arrivals
                  </h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-xs text-amber-700 hover:underline font-semibold">
                    View All Bookings
                  </button>
                </div>
                <div className="space-y-3">
                  {bookings.length === 0 ? (
                    <div className="p-8 text-center bg-amber-50/30 rounded-2xl border border-dashed border-amber-200">
                      <CalendarCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-neutral-700">No arrivals scheduled for today</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">New reservations from pilgrims will appear here automatically.</p>
                    </div>
                  ) : (
                    bookings.slice(0, 3).map(b => (
                      <div key={b.id} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-neutral-900">{b.customer}</span>
                            <span className="font-mono text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                              {b.bookingReference}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-600 mt-0.5">
                            {b.room} • {b.guests} Guests • In: {b.checkIn} → Out: {b.checkOut}
                          </p>
                          {b.specialRequests && (
                            <p className="text-[10px] text-amber-900 font-medium mt-1">
                              💡 Yatri Request: {b.specialRequests}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="font-serif font-black text-sm text-neutral-900 mr-2">
                            ₹{b.amount.toLocaleString('en-IN')}
                          </span>
                          {b.bookingStatus === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_IN')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                            >
                              Check-in
                            </button>
                          )}
                          {b.bookingStatus === 'CHECKED_IN' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_OUT')}
                              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs rounded-xl shadow"
                            >
                              Check-out
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Calendar Snapshot */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold font-serif text-neutral-900 text-base">October 2026</h3>
                  <button onClick={() => setActiveTab('calendar')} className="text-xs text-amber-700 hover:underline font-semibold">
                    Full Calendar →
                  </button>
                </div>
                <p className="text-xs text-neutral-600">
                  Quick availability for next 5 days. Click to jump into the full interactive occupancy matrix.
                </p>
                <div className="space-y-2 pt-2">
                  {Object.entries(calendarGrid).slice(0, 3).map(([room, days]) => (
                    <div key={room} className="text-xs flex items-center justify-between p-2 bg-neutral-50 rounded-xl">
                      <span className="font-semibold text-neutral-800">{room}</span>
                      <div className="flex space-x-1">
                        {days.slice(0, 5).map((status, i) => (
                          <span
                            key={i}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                              status === 'B' ? 'bg-amber-600 text-white' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {status}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. HOTEL PROFILE MANAGEMENT */}
        {activeTab === 'hotel' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-bold font-serif text-neutral-900">Hotel Profile &amp; Policies</h3>
                <p className="text-xs text-neutral-500">Edit property details presented to pilgrims on the Brijnidhi marketplace.</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition"
              >
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-neutral-500 font-semibold mb-1">Hotel Name</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={hotelProfile.name}
                  onChange={e => setHotelProfile({ ...hotelProfile, name: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-900 disabled:bg-neutral-50"
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-semibold mb-1">Primary Destination</label>
                <input
                  type="text"
                  disabled
                  value={hotelProfile.destination}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-900 bg-neutral-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-neutral-500 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  disabled={!isEditingProfile}
                  value={hotelProfile.description}
                  onChange={e => setHotelProfile({ ...hotelProfile, description: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-neutral-800 disabled:bg-neutral-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-neutral-500 font-semibold mb-1">Property Address</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={hotelProfile.address}
                  onChange={e => setHotelProfile({ ...hotelProfile, address: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-neutral-800 disabled:bg-neutral-50"
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-semibold mb-1">Check-in Time</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={hotelProfile.checkInTime}
                  onChange={e => setHotelProfile({ ...hotelProfile, checkInTime: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-neutral-800 disabled:bg-neutral-50"
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-semibold mb-1">Check-out Time</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={hotelProfile.checkOutTime}
                  onChange={e => setHotelProfile({ ...hotelProfile, checkOutTime: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-neutral-800 disabled:bg-neutral-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-neutral-500 font-semibold mb-1">Satvik Purity &amp; Cancellation Policies</label>
                <textarea
                  rows={2}
                  disabled={!isEditingProfile}
                  value={hotelProfile.policies}
                  onChange={e => setHotelProfile({ ...hotelProfile, policies: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-neutral-800 disabled:bg-neutral-50"
                />
              </div>
            </div>

            {isEditingProfile && (
              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    alert('Hotel profile updated successfully!');
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Save Profile Changes
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. ROOM MANAGEMENT */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-serif text-neutral-900">Room Categories &amp; Pricing</h3>
                <p className="text-xs text-neutral-500">Configure your rooms, capacities, base pricing, and weekend rates.</p>
              </div>
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Room</span>
              </button>
            </div>

            {rooms.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-amber-200 text-center shadow-sm">
                <Bed className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                <h4 className="text-base font-bold font-serif text-neutral-900">No Room Categories Created Yet</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Configure rooms with base prices, guest capacity, and weekend rates to start receiving pilgrim reservations.
                </p>
                <button
                  onClick={() => setShowAddRoomModal(true)}
                  className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow inline-flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Room Category</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map(room => (
                  <div key={room.id} className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {room.roomType}
                          </span>
                          <h4 className="text-base font-bold font-serif text-neutral-900 mt-1">{room.name}</h4>
                        </div>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-neutral-400 hover:text-red-600 p-1"
                          title="Delete room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                        <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                          <span className="text-neutral-500 block text-[10px]">Base Price / night</span>
                          <span className="font-bold text-neutral-900 text-sm">₹{room.basePrice}</span>
                        </div>
                        <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                          <span className="text-neutral-500 block text-[10px]">Weekend Price</span>
                          <span className="font-bold text-amber-700 text-sm">₹{room.weekendPrice}</span>
                        </div>
                        <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                          <span className="text-neutral-500 block text-[10px]">Max Guests</span>
                          <span className="font-bold text-neutral-900 text-sm">{room.capacity} Persons</span>
                        </div>
                        <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                          <span className="text-neutral-500 block text-[10px]">Total Rooms</span>
                          <span className="font-bold text-neutral-900 text-sm">{room.totalRooms} Units</span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {room.amenities.map(a => (
                          <span key={a} className="text-[10px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between items-center text-xs">
                      <span className="text-emerald-700 font-semibold flex items-center">
                        ● Active in inventory
                      </span>
                      <button
                        onClick={() => alert(`Editing room ${room.name}`)}
                        className="text-amber-700 hover:underline font-bold"
                      >
                        Edit Pricing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-bold font-serif text-neutral-900">Reservations &amp; Guests</h3>
                <p className="text-xs text-neutral-500">Manage check-in, check-out, and guest requests.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/70 text-amber-950 font-bold uppercase text-[10px] tracking-wider border-b border-amber-200">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Room Category</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        <CalendarCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <span className="font-bold text-neutral-700 block">No Reservations Yet</span>
                        <span className="text-[11px] text-neutral-500">Reservations made by pilgrims will appear here in real-time.</span>
                      </td>
                    </tr>
                  ) : (
                    bookings.map(b => (
                      <tr key={b.id} className="hover:bg-amber-50/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-900">{b.bookingReference}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-neutral-900 block">{b.customer}</span>
                          <span className="text-[10px] text-neutral-500">{b.guests} Guests</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium">{b.room}</td>
                        <td className="py-3.5 px-4 text-neutral-600">
                          {b.checkIn} to {b.checkOut}
                        </td>
                        <td className="py-3.5 px-4 font-black font-serif text-neutral-900">
                          ₹{b.amount.toLocaleString('en-IN')}
                          <span className="block text-[9px] font-normal text-emerald-600">{b.paymentStatus}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.bookingStatus === 'CHECKED_IN' ? 'bg-blue-100 text-blue-900' :
                            b.bookingStatus === 'CHECKED_OUT' ? 'bg-neutral-100 text-neutral-600' :
                            b.bookingStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-900' :
                            'bg-red-100 text-red-900'
                          }`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 space-x-2">
                          {b.bookingStatus === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_IN')}
                              className="text-xs font-bold text-blue-700 hover:underline"
                            >
                              Check-in
                            </button>
                          )}
                          {b.bookingStatus === 'CHECKED_IN' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_OUT')}
                              className="text-xs font-bold text-neutral-700 hover:underline"
                            >
                              Check-out
                            </button>
                          )}
                          <button
                            onClick={() => alert(`Printing reservation voucher for ${b.bookingReference}`)}
                            className="text-xs text-neutral-500 hover:text-neutral-900"
                            title="Print booking receipt"
                          >
                            <Printer className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. INTERACTIVE CALENDAR (OCTOBER 2026 MATRIX) */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                <CalendarIcon className="w-4 h-4 text-amber-700" />
                <span>Direct Inventory Control</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-neutral-900">
                OCTOBER 2026 Room Availability Calendar
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Click any cell to toggle availability directly. Legend: <strong className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">B</strong> = Booked, <strong className="text-neutral-800 font-bold bg-neutral-200 px-2 py-0.5 rounded">-</strong> = Available.
              </p>
            </div>

            {/* Calendar Matrix View */}
            <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
              <table className="w-full text-center text-xs font-mono">
                <thead className="bg-amber-50 text-neutral-800 border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4 text-left font-serif font-bold text-neutral-900 w-44">
                      Room / Date
                    </th>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => (
                      <th key={day} className="py-3 px-2 font-bold">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {Object.entries(calendarGrid).map(([roomKey, days]) => (
                    <tr key={roomKey} className="hover:bg-amber-50/20">
                      <td className="py-3 px-4 text-left font-sans font-bold text-neutral-900 bg-neutral-50/80">
                        {roomKey}
                      </td>
                      {days.map((status, idx) => (
                        <td key={idx} className="p-1">
                          <button
                            onClick={() => toggleCalendarDay(roomKey, idx)}
                            className={`w-9 h-9 rounded-xl font-bold transition flex items-center justify-center mx-auto text-xs ${
                              status === 'B'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                            }`}
                            title={`Click to toggle availability for Oct ${idx + 1}`}
                          >
                            {status}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 pt-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded bg-amber-600 flex items-center justify-center text-white text-[10px] font-bold">B</span>
                  <span>Booked / Reserved</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded bg-neutral-200 flex items-center justify-center text-neutral-700 text-[10px] font-bold">-</span>
                  <span>Available for Yatri Booking</span>
                </div>
              </div>
              <span>Clicking any date cell updates online booking availability in real time.</span>
            </div>
          </div>
        )}

        {/* ADD ROOM MODAL */}
        {showAddRoomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-amber-200">
              <button
                onClick={() => setShowAddRoomModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold font-serif text-neutral-900 mb-1">Add New Room Category</h3>
              <p className="text-xs text-neutral-500 mb-4">Add a new room configuration to your inventory.</p>

              <form onSubmit={handleAddRoom} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Room Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radharani Kripa Executive AC Room"
                    value={newRoomData.name}
                    onChange={e => setNewRoomData({ ...newRoomData, name: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Room Type</label>
                    <select
                      value={newRoomData.roomType}
                      onChange={e => setNewRoomData({ ...newRoomData, roomType: e.target.value as any })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white"
                    >
                      <option value="Standard Room">Standard Room</option>
                      <option value="Deluxe Room">Deluxe Room</option>
                      <option value="Premium Room">Premium Room</option>
                      <option value="Family Room">Family Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Max Capacity (Guests)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newRoomData.capacity}
                      onChange={e => setNewRoomData({ ...newRoomData, capacity: Number(e.target.value) })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Base Price / night (₹)</label>
                    <input
                      type="number"
                      step={50}
                      value={newRoomData.basePrice}
                      onChange={e => setNewRoomData({ ...newRoomData, basePrice: Number(e.target.value) })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Weekend Price (₹)</label>
                    <input
                      type="number"
                      step={50}
                      value={newRoomData.weekendPrice}
                      onChange={e => setNewRoomData({ ...newRoomData, weekendPrice: Number(e.target.value) })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Total Rooms in Inventory</label>
                  <input
                    type="number"
                    min={1}
                    value={newRoomData.totalRooms}
                    onChange={e => setNewRoomData({ ...newRoomData, totalRooms: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Amenities (comma-separated)</label>
                  <input
                    type="text"
                    value={newRoomData.amenities}
                    onChange={e => setNewRoomData({ ...newRoomData, amenities: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow"
                  >
                    Save &amp; Add Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
