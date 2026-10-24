'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit3, Trash2, Bed } from 'lucide-react';

export interface RoomItem {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  pricePerNight: number;
  weekendPrice?: number;
  capacity: number;
  bedType: string;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  amenities: string[];
  imageUrl?: string;
  currentGuestName?: string;
  lastCleanedAt?: string;
}

interface RoomInventoryTableProps {
  rooms: RoomItem[];
  isAdmin?: boolean;
  onAddRoom?: () => void;
  onEditRoom?: (room: RoomItem) => void;
  onDeleteRoom?: (id: string, roomNumber: string) => void;
  onUpdateRoomStatus?: (id: string, newStatus: RoomItem['status']) => void;
}

export default function RoomInventoryTable({
  rooms,
  isAdmin = true,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  onUpdateRoomStatus
}: RoomInventoryTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status counts
  const availableCount = useMemo(() => rooms.filter(r => r.status === 'Available').length, [rooms]);
  const occupiedCount = useMemo(() => rooms.filter(r => r.status === 'Occupied').length, [rooms]);
  const reservedCount = useMemo(() => rooms.filter(r => r.status === 'Reserved').length, [rooms]);
  const maintenanceCount = useMemo(() => rooms.filter(r => r.status === 'Maintenance').length, [rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesStatus = filterStatus === 'ALL' || room.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        room.roomNumber.toLowerCase().includes(q) ||
        room.roomType.toLowerCase().includes(q) ||
        room.bedType.toLowerCase().includes(q) ||
        (room.currentGuestName && room.currentGuestName.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [rooms, filterStatus, searchQuery]);

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Header with Title and Add New Room Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Room Inventory Management
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Add, edit room types, pricing, capacity, and live statuses.
          </p>
        </div>

        {isAdmin && onAddRoom && (
          <button
            onClick={onAddRoom}
            className="self-start sm:self-auto bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        )}
      </div>

      {/* 2. Filter Pills and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            ALL
          </button>

          <button
            onClick={() => setFilterStatus('Available')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'Available'
                ? 'bg-amber-700 text-white font-bold shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Available ({availableCount})
          </button>

          <button
            onClick={() => setFilterStatus('Occupied')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'Occupied'
                ? 'bg-amber-700 text-white font-bold shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Occupied ({occupiedCount})
          </button>

          <button
            onClick={() => setFilterStatus('Reserved')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'Reserved'
                ? 'bg-amber-700 text-white font-bold shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Reserved ({reservedCount})
          </button>

          <button
            onClick={() => setFilterStatus('Maintenance')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'Maintenance'
                ? 'bg-amber-700 text-white font-bold shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Maintenance ({maintenanceCount})
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search room number or type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* 3. Room Inventory Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/40 text-[11px] font-semibold text-stone-400 tracking-wider">
                <th className="py-3.5 px-4">ROOM NO.</th>
                <th className="py-3.5 px-4">TYPE &amp; DETAILS</th>
                <th className="py-3.5 px-4">FLOOR</th>
                <th className="py-3.5 px-4">AMENITIES</th>
                <th className="py-3.5 px-4">GUEST</th>
                <th className="py-3.5 px-4">PRICE / NIGHT</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredRooms.map(room => {
                const amenitiesList = room.amenities || [];
                const firstThreeAmenities = amenitiesList.slice(0, 3);
                const extraAmenitiesCount = amenitiesList.length - 3;

                return (
                  <tr key={room.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* 1. ROOM NO. */}
                    <td className="py-4 px-4 font-serif font-bold text-stone-900 text-sm whitespace-nowrap">
                      Room #{room.roomNumber}
                    </td>

                    {/* 2. TYPE & DETAILS */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-stone-900 text-xs">{room.roomType}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {room.bedType} • Up to {room.capacity} Guests
                      </div>
                    </td>

                    {/* 3. FLOOR */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded text-[11px] font-semibold">
                        Floor {room.floor}
                      </span>
                    </td>

                    {/* 4. AMENITIES */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                        {firstThreeAmenities.map((am, i) => (
                          <span
                            key={i}
                            className="bg-stone-50 border border-stone-200/80 text-stone-600 px-2 py-0.5 rounded text-[10px] whitespace-nowrap"
                          >
                            {am}
                          </span>
                        ))}
                        {extraAmenitiesCount > 0 && (
                          <span className="text-[10px] font-semibold text-stone-400 whitespace-nowrap">
                            +{extraAmenitiesCount} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. GUEST */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {room.currentGuestName ? (
                        <span className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-md text-xs font-bold inline-block shadow-2xs">
                          {room.currentGuestName}
                        </span>
                      ) : (
                        <span className="text-stone-300 font-bold text-sm">—</span>
                      )}
                    </td>

                    {/* 6. PRICE / NIGHT */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-bold text-amber-900 text-sm">₹{room.pricePerNight}</span>{' '}
                      <span className="text-stone-400 font-normal text-xs">/ night</span>
                    </td>

                    {/* 7. STATUS */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-white font-bold text-xs px-3.5 py-1 rounded-full shadow-2xs inline-block ${
                          room.status === 'Available'
                            ? 'bg-emerald-600'
                            : room.status === 'Occupied'
                            ? 'bg-amber-600'
                            : room.status === 'Maintenance'
                            ? 'bg-red-600'
                            : 'bg-blue-600'
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>

                    {/* 8. ACTIONS */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2.5">
                        {onUpdateRoomStatus && (
                          <select
                            value={room.status}
                            onChange={e => onUpdateRoomStatus(room.id, e.target.value as any)}
                            className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1 font-medium text-stone-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                          >
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Maintenance">Maintenance</option>
                          </select>
                        )}

                        {isAdmin && onEditRoom && (
                          <button
                            onClick={() => onEditRoom(room)}
                            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                            title="Edit Room"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {isAdmin && onDeleteRoom && (
                          <button
                            onClick={() => onDeleteRoom(room.id, room.roomNumber)}
                            className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Room"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRooms.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-500">
                    <Bed className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
                    <div className="font-serif font-bold text-stone-700 text-sm">No Rooms Found</div>
                    <div className="text-xs text-stone-400 mt-1">
                      Try selecting a different filter status or clearing your search.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
