'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  QrCode,
  Scan,
  Wrench,
  Receipt,
  Search,
  KeyRound,
  Wifi,
  WifiOff,
  UserCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

import {
  PMSRoom,
  PMSBooking,
  FolioItem,
  HousekeepingTask,
  MaintenanceTicket,
  ShiftCashRecord,
  OperatorSession,
  AuditActionLog,
  RoomStatus
} from '../../components/hotel-admin/types';

import HighSpeedFrontDesk from '../../components/hotel-admin/HighSpeedFrontDesk';
import LiveTapeChart from '../../components/hotel-admin/LiveTapeChart';
import HousekeepingAutomation from '../../components/hotel-admin/HousekeepingAutomation';
import BillingFolioPOS from '../../components/hotel-admin/BillingFolioPOS';
import GlobalCommandBar from '../../components/hotel-admin/GlobalCommandBar';
import PinSwitchModal from '../../components/hotel-admin/PinSwitchModal';
import AuditLogsViewer from '../../components/hotel-admin/AuditLogsViewer';

export default function HotelAdminDashboard() {
  // Navigation Tabs: 5 Modules + Profile & Rooms
  const [activeTab, setActiveTab] = useState<string>('front_desk');

  // Network Offline / Online State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // Active Operator Session (Module 5)
  const [currentOperator, setCurrentOperator] = useState<OperatorSession>({
    id: 'op-1',
    pin: '1001',
    name: 'Rakesh Sharma',
    role: 'Desk Lead',
    shift: 'Morning (06:00 - 14:00)'
  });

  // Hotel Profile State
  const [hotelProfile, setHotelProfile] = useState({
    name: 'Brijnidhi Braj Dham Heritage Suites',
    description: 'Premier pilgrimage hospitality overlooking Sri Bankey Bihari & Sri Radha Vallabh temples in Vrindavan.',
    address: 'Near Raman Reti, Parikrama Marg, Vrindavan, Mathura, UP - 281121',
    destination: 'Vrindavan',
    contactPhone: '+91 98765 43210',
    contactEmail: 'reception@brijnidhi.org',
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    amenities: ['100% Satvik Pure Veg Kitchen', '24x7 Hot Water Geyser', 'Free Wi-Fi', 'VIP Temple Darshan Desk'],
    policies: 'Strictly Satvik pure vegetarian (no onion, no garlic). Alcohol and non-vegetarian food strictly prohibited.'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // 1. Rooms State (Initialized with standard Braj pilgrimage layout)
  const [rooms, setRooms] = useState<PMSRoom[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brijnidhi_pms_rooms');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 'rm-101',
        roomNumber: '101',
        floor: 1,
        category: 'Standard AC',
        basePrice: 1800,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Ground Floor', 'Accessible', 'Twin Bed'],
        lastCleanedAt: 'Today, 10:30 AM'
      },
      {
        id: 'rm-102',
        roomNumber: '102',
        floor: 1,
        category: 'Deluxe AC',
        basePrice: 2400,
        status: 'OCCUPIED',
        currentBookingId: 'bk-102',
        guestName: 'Rameshwar Sharma',
        isEmergencyLocked: false,
        tags: ['Ground Floor', 'Temple View'],
        lastCleanedAt: 'Yesterday, 04:00 PM'
      },
      {
        id: 'rm-103',
        roomNumber: '103',
        floor: 1,
        category: 'Deluxe AC',
        basePrice: 2400,
        status: 'DIRTY',
        isEmergencyLocked: false,
        tags: ['Ground Floor', 'Quiet Wing'],
        lastCleanedAt: 'Pending Inspection'
      },
      {
        id: 'rm-201',
        roomNumber: '201',
        floor: 2,
        category: 'Executive Suite',
        basePrice: 3500,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Temple View', 'King Bed', 'Balcony'],
        lastCleanedAt: 'Today, 09:15 AM'
      },
      {
        id: 'rm-202',
        roomNumber: '202',
        floor: 2,
        category: 'Deluxe AC',
        basePrice: 2500,
        status: 'OCCUPIED',
        currentBookingId: 'bk-202',
        guestName: 'Sunita Devi Agrawal',
        isEmergencyLocked: false,
        tags: ['Quiet Wing', 'Balcony'],
        lastCleanedAt: 'Yesterday, 02:00 PM'
      },
      {
        id: 'rm-203',
        roomNumber: '203',
        floor: 2,
        category: 'Family Dham Suite',
        basePrice: 4200,
        status: 'BLOCKED',
        isEmergencyLocked: true,
        lockReason: 'Geyser Pipeline Repair',
        tags: ['Family Suite', '4 Beds', 'Temple View'],
        lastCleanedAt: '08 Oct 2026'
      },
      {
        id: 'rm-301',
        roomNumber: '301',
        floor: 3,
        category: 'Executive Suite',
        basePrice: 3800,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Yamuna View', 'Rooftop Access'],
        lastCleanedAt: 'Today, 11:00 AM'
      },
      {
        id: 'rm-302',
        roomNumber: '302',
        floor: 3,
        category: 'Deluxe AC',
        basePrice: 2600,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Temple View', 'King Bed'],
        lastCleanedAt: 'Today, 08:30 AM'
      }
    ];
  });

  // 2. Bookings State (Preloaded active pilgrimages for instant workable experience)
  const [bookings, setBookings] = useState<PMSBooking[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brijnidhi_pms_bookings');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return [
      {
        id: 'bk-102',
        bookingReference: 'YATRA-701',
        customer: 'Rameshwar Sharma',
        phone: '9876543210',
        idProofType: 'Aadhaar',
        idProofNumber: '8492 4819 9281',
        guestCity: 'Jaipur, Rajasthan',
        roomId: 'rm-102',
        roomNumber: '102',
        checkIn: todayStr,
        checkOut: tomorrowStr,
        guests: 2,
        roomRate: 2400,
        bookingStatus: 'CHECKED_IN',
        specialRequests: 'Ground floor room required for elderly mataji'
      },
      {
        id: 'bk-202',
        bookingReference: 'RADHA-552',
        customer: 'Sunita Devi Agrawal',
        phone: '9811223344',
        idProofType: 'Aadhaar',
        idProofNumber: '7391 1928 4421',
        guestCity: 'Indore, MP',
        roomId: 'rm-202',
        roomNumber: '202',
        checkIn: todayStr,
        checkOut: tomorrowStr,
        guests: 3,
        roomRate: 2500,
        bookingStatus: 'CHECKED_IN',
        specialRequests: 'Quiet wing requested for daily japa meditation'
      },
      {
        id: 'bk-arr-1',
        bookingReference: 'BN-VRN-884',
        customer: 'Gaurav Khandelwal',
        phone: '9928374650',
        idProofType: 'Aadhaar',
        idProofNumber: '9281 3344 1102',
        guestCity: 'New Delhi',
        roomId: 'rm-101',
        roomNumber: '101',
        checkIn: todayStr,
        checkOut: tomorrowStr,
        guests: 2,
        roomRate: 1800,
        bookingStatus: 'CONFIRMED',
        specialRequests: 'Arriving by car via Yamuna Expressway at 02:00 PM'
      },
      {
        id: 'bk-arr-2',
        bookingReference: 'BN-VRN-912',
        customer: 'Ananya Mathur',
        phone: '9412398765',
        idProofType: 'Passport',
        idProofNumber: 'Z8291049',
        guestCity: 'Mumbai',
        roomId: 'rm-201',
        roomNumber: '201',
        checkIn: todayStr,
        checkOut: tomorrowStr,
        guests: 2,
        roomRate: 3500,
        bookingStatus: 'CONFIRMED',
        specialRequests: 'Temple view room preferred for evening aarti'
      }
    ];
  });

  // 3. Folios State
  const [folios, setFolios] = useState<FolioItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brijnidhi_pms_folios');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 'fol-1',
        bookingId: 'bk-102',
        roomNumber: '102',
        description: 'Satvik Desi Ghee Thali x2',
        category: 'RESTAURANT',
        amount: 500,
        timestamp: '12:30 PM',
        paid: false
      },
      {
        id: 'fol-2',
        bookingId: 'bk-102',
        roomNumber: '102',
        description: 'Braj Matka Rabdi & Peda Box',
        category: 'RESTAURANT',
        amount: 200,
        timestamp: '01:15 PM',
        paid: false
      },
      {
        id: 'fol-3',
        bookingId: 'bk-202',
        roomNumber: '202',
        description: 'Bankey Bihari VIP Darshan Escort Pass',
        category: 'DARSHAN_PASS',
        amount: 500,
        timestamp: '09:00 AM',
        paid: false
      }
    ];
  });

  // 4. Housekeeping Tasks State (Module 3)
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brijnidhi_pms_housekeeping');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 'hk-103',
        roomNumber: '103',
        floor: 1,
        dispatchedAt: '11:15 AM',
        assignedStaff: 'Kailash (Housekeeper)',
        status: 'IN_PROGRESS',
        checklist: {
          linenBedding: true,
          bathroomSanitized: false,
          satvikAmenities: false,
          acGeyserInspected: true,
          floorCleaned: false
        }
      }
    ];
  });

  // 5. Maintenance Tickets State (Module 3)
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brijnidhi_pms_tickets');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 'tkt-203',
        roomNumber: '203',
        category: 'Plumbing / Geyser',
        description: 'Hot water geyser pressure valve leaking. Needs immediate gasket replacement.',
        urgency: 'Urgent',
        reportedAt: '10:00 AM',
        assignedTechnician: 'Mukesh Sharma (Sr. Technician)',
        status: 'In Progress'
      }
    ];
  });

  // 6. Cash Shift Balancing State (Module 4)
  const [shiftRecord, setShiftRecord] = useState<ShiftCashRecord>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brijnidhi_pms_shift');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      operatorId: 'op-1',
      operatorName: 'Rakesh Sharma',
      shiftType: 'Morning (06:00 - 14:00)',
      openedAt: '06:00 AM',
      openingFloat: 5000,
      cashCollections: 4200,
      digitalCollections: 7500,
      cashPayouts: 300,
      actualDrawerCount: 8900,
      discrepancy: 0,
      isClosed: false
    };
  });

  // 7. Audit Action Logs State (Module 5)
  const [auditLogs, setAuditLogs] = useState<AuditActionLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brijnidhi_pms_audit');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      {
        id: 'aud-1',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        operatorName: 'Rakesh Sharma (1001)',
        action: 'SHIFT_OPENED',
        module: 'Shift Balance',
        details: 'Opened morning drawer with ₹5,000 opening float reserve.'
      },
      {
        id: 'aud-2',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        operatorName: 'Rakesh Sharma (1001)',
        action: 'EMERGENCY_LOCK',
        module: 'Tape Chart',
        details: 'Locked Room 203 for Urgent Geyser Pipeline repair.'
      }
    ];
  });

  // Offline-First Local Storage Auto-Sync (Module 5)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('brijnidhi_pms_rooms', JSON.stringify(rooms));
    localStorage.setItem('brijnidhi_pms_bookings', JSON.stringify(bookings));
    localStorage.setItem('brijnidhi_pms_folios', JSON.stringify(folios));
    localStorage.setItem('brijnidhi_pms_housekeeping', JSON.stringify(housekeepingTasks));
    localStorage.setItem('brijnidhi_pms_tickets', JSON.stringify(maintenanceTickets));
    localStorage.setItem('brijnidhi_pms_shift', JSON.stringify(shiftRecord));
    localStorage.setItem('brijnidhi_pms_audit', JSON.stringify(auditLogs));
  }, [rooms, bookings, folios, housekeepingTasks, maintenanceTickets, shiftRecord, auditLogs]);

  // Global Command Bar Keyboard Shortcut Listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandBarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper: Log Audit Action
  const logAudit = (action: string, module: AuditActionLog['module'], details: string) => {
    const newLog: AuditActionLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operatorName: `${currentOperator.name} (${currentOperator.pin})`,
      action,
      module,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- ACTIONS ---

  // Check In Guest (Module 1)
  const handleCheckIn = (bookingId: string, assignedRoomId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    const room = rooms.find(r => r.id === assignedRoomId);
    if (!booking || !room) return;

    // Update Room to OCCUPIED
    setRooms(prev =>
      prev.map(r =>
        r.id === assignedRoomId
          ? {
              ...r,
              status: 'OCCUPIED',
              currentBookingId: booking.id,
              guestName: booking.customer
            }
          : r
      )
    );

    // Update Booking Status
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              bookingStatus: 'CHECKED_IN',
              roomId: room.id,
              roomNumber: room.roomNumber
            }
          : b
      )
    );

    logAudit('GUEST_CHECKED_IN', 'Front Desk', `Checked in ${booking.customer} into Room ${room.roomNumber}`);
  };

  // 1-Click Digital Check Out (Module 1 -> Trigger-based Auto-dispatch to Housekeeping Module 3)
  const handleCheckOut = (bookingId: string, finalFolioTotal: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // 1. Mark Room DIRTY
    setRooms(prev =>
      prev.map(r =>
        r.roomNumber === booking.roomNumber
          ? {
              ...r,
              status: 'DIRTY',
              currentBookingId: undefined,
              guestName: undefined
            }
          : r
      )
    );

    // 2. Mark Booking CHECKED_OUT
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, bookingStatus: 'CHECKED_OUT' } : b))
    );

    // 3. TRIGGER-BASED AUTO-DISPATCH to Housekeeping
    const newTask: HousekeepingTask = {
      id: `hk-${Date.now()}`,
      roomNumber: booking.roomNumber,
      floor: Number(booking.roomNumber.charAt(0)) || 1,
      dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assignedStaff: 'Express Turnover Team',
      status: 'IN_PROGRESS',
      checklist: {
        linenBedding: false,
        bathroomSanitized: false,
        satvikAmenities: false,
        acGeyserInspected: false,
        floorCleaned: false
      }
    };
    setHousekeepingTasks(prev => [newTask, ...prev]);

    // 4. Update Shift Cash Record
    setShiftRecord(prev => ({
      ...prev,
      cashCollections: prev.cashCollections + finalFolioTotal
    }));

    logAudit(
      'GUEST_CHECKED_OUT',
      'Front Desk',
      `Checked out ${booking.customer} from Room ${booking.roomNumber}. Folio ₹${finalFolioTotal} settled. Auto-dispatched room cleaning.`
    );
  };

  // Walk-In Check In (Module 1 & 4)
  const handleWalkInCheckIn = (newBooking: PMSBooking, assignedRoomId: string) => {
    setBookings(prev => [newBooking, ...prev]);
    setRooms(prev =>
      prev.map(r =>
        r.id === assignedRoomId
          ? {
              ...r,
              status: 'OCCUPIED',
              currentBookingId: newBooking.id,
              guestName: newBooking.customer
            }
          : r
      )
    );
    logAudit('WALKIN_CHECKIN', 'Front Desk', `Walk-in registration for ${newBooking.customer} in Room ${newBooking.roomNumber}`);
  };

  // Toggle Emergency Lock (Module 2)
  const handleToggleEmergencyLock = (roomId: string, reason?: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const willLock = !room.isEmergencyLocked;
    setRooms(prev =>
      prev.map(r =>
        r.id === roomId
          ? {
              ...r,
              isEmergencyLocked: willLock,
              status: willLock ? 'BLOCKED' : 'CLEAN',
              lockReason: willLock ? reason || 'Emergency Hold' : undefined
            }
          : r
      )
    );

    logAudit(
      willLock ? 'EMERGENCY_LOCK_ENGAGED' : 'EMERGENCY_LOCK_RELEASED',
      'Tape Chart',
      `${willLock ? 'Engaged emergency hold on' : 'Unlocked'} Room ${room.roomNumber}. Reason: ${reason || 'N/A'}`
    );
  };

  // Move Stay between Rooms (Module 2)
  const handleMoveStay = (bookingId: string, fromRoomId: string, toRoomId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    const toRoom = rooms.find(r => r.id === toRoomId);
    if (!booking || !toRoom) return;

    // Release old room (set to DIRTY)
    setRooms(prev =>
      prev.map(r => {
        if (r.id === fromRoomId) {
          return { ...r, status: 'DIRTY', currentBookingId: undefined, guestName: undefined };
        }
        if (r.id === toRoomId) {
          return { ...r, status: 'OCCUPIED', currentBookingId: booking.id, guestName: booking.customer };
        }
        return r;
      })
    );

    // Update booking room assignment
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId ? { ...b, roomId: toRoom.id, roomNumber: toRoom.roomNumber } : b
      )
    );

    logAudit(
      'ROOM_SWITCHED',
      'Tape Chart',
      `Transferred guest ${booking.customer} from Room ${booking.roomNumber} to Room ${toRoom.roomNumber}`
    );
  };

  // Extend Stay (Module 2)
  const handleExtendStay = (bookingId: string, additionalDays: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const currentOut = new Date(booking.checkOut);
    currentOut.setDate(currentOut.getDate() + additionalDays);
    const newOutStr = currentOut.toISOString().split('T')[0];

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, checkOut: newOutStr } : b))
    );

    // Add extra nights charge to Folio
    const extraCharge = booking.roomRate * additionalDays;
    const folioItem: FolioItem = {
      id: `fol-ext-${Date.now()}`,
      bookingId: booking.id,
      roomNumber: booking.roomNumber,
      description: `Extended Stay (+${additionalDays} nights)`,
      category: 'ROOM_CHARGE',
      amount: extraCharge,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paid: false
    };
    setFolios(prev => [...prev, folioItem]);

    logAudit(
      'STAY_EXTENDED',
      'Tape Chart',
      `Extended stay for ${booking.customer} in Room ${booking.roomNumber} by ${additionalDays} days. Added ₹${extraCharge} to folio.`
    );
  };

  // Set Direct Room Status (Module 2)
  const handleSetRoomStatus = (roomId: string, status: RoomStatus) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    setRooms(prev => prev.map(r => (r.id === roomId ? { ...r, status } : r)));
    logAudit('ROOM_STATUS_CHANGED', 'Tape Chart', `Changed Room ${room.roomNumber} status to ${status}`);
  };

  // Housekeeping: Update Checklist Item (Module 3)
  const handleUpdateChecklist = (
    taskId: string,
    key: keyof HousekeepingTask['checklist'],
    value: boolean
  ) => {
    setHousekeepingTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              checklist: { ...t.checklist, [key]: value }
            }
          : t
      )
    );
  };

  // Housekeeping: Photo Verification Gate (Module 3)
  const handleSubmitPhotoAndVerify = (taskId: string, photoUrl: string) => {
    const task = housekeepingTasks.find(t => t.id === taskId);
    if (!task) return;

    // 1. Mark task INSPECTED_CLEAN
    setHousekeepingTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: 'INSPECTED_CLEAN',
              completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              photoEvidence: photoUrl
            }
          : t
      )
    );

    // 2. Flip Room Status to CLEAN (🟢)
    setRooms(prev =>
      prev.map(r =>
        r.roomNumber === task.roomNumber
          ? {
              ...r,
              status: 'CLEAN',
              lastCleanedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            }
          : r
      )
    );

    logAudit(
      'HOUSEKEEPING_INSPECTED',
      'Housekeeping',
      `Supervisor verified photo evidence for Room ${task.roomNumber}. Status flipped to CLEAN 🟢 and available for front desk.`
    );
  };

  // Maintenance: Create Ticket (Module 3)
  const handleCreateMaintenanceTicket = (ticket: MaintenanceTicket) => {
    setMaintenanceTickets(prev => [ticket, ...prev]);
    // If urgent, block room
    if (ticket.urgency === 'Urgent') {
      handleToggleEmergencyLock(
        rooms.find(r => r.roomNumber === ticket.roomNumber)?.id || '',
        `Maintenance: ${ticket.category}`
      );
    }
    logAudit('TICKET_CREATED', 'Housekeeping', `Logged ${ticket.urgency} ticket for Room ${ticket.roomNumber}: ${ticket.description}`);
  };

  // Maintenance: Resolve Ticket (Module 3)
  const handleResolveTicket = (ticketId: string) => {
    setMaintenanceTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status: 'Resolved' } : t))
    );
    logAudit('TICKET_RESOLVED', 'Housekeeping', `Resolved maintenance ticket ${ticketId}`);
  };

  // Billing: Add Folio Item (Module 4)
  const handleAddFolioItem = (item: FolioItem) => {
    setFolios(prev => [...prev, item]);
    logAudit('FOLIO_ITEM_ADDED', 'POS & Billing', `Added ${item.description} (₹${item.amount}) to Room ${item.roomNumber}`);
  };

  // Billing: Settle Folio (Module 4)
  const handleSettleFolio = (bookingId: string, method: 'UPI' | 'CASH' | 'CARD') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setFolios(prev =>
      prev.map(f => (f.bookingId === bookingId ? { ...f, paid: true } : f))
    );

    logAudit(
      'FOLIO_SETTLED',
      'POS & Billing',
      `Settled all running folio items for Room ${booking.roomNumber} (${booking.customer}) via ${method}`
    );
    alert(`Folio successfully marked as PAID via ${method}!`);
  };

  // Shift: Update Actual Cash Count (Module 4)
  const handleUpdateShiftBalance = (actualCashCount: number, notes?: string) => {
    const expected = shiftRecord.openingFloat + shiftRecord.cashCollections - shiftRecord.cashPayouts;
    const discrepancy = actualCashCount - expected;
    setShiftRecord(prev => ({
      ...prev,
      actualDrawerCount: actualCashCount,
      discrepancy,
      notes: notes || prev.notes
    }));
  };

  // Shift: Close Shift (Module 4)
  const handleCloseShift = () => {
    setShiftRecord(prev => ({
      ...prev,
      isClosed: true,
      closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
    logAudit('SHIFT_CLOSED', 'Shift Balance', `Shift closed by ${currentOperator.name}. Drawer count: ₹${shiftRecord.actualDrawerCount}`);
  };

  // Navigation Tabs Definition matching spreadsheet
  const navItems = [
    { id: 'front_desk', label: '1. High-Speed Front Desk', icon: UserCheck, badge: bookings.filter(b => b.bookingStatus === 'CONFIRMED').length },
    { id: 'tape_chart', label: '2. Live Tape Chart Matrix', icon: Bed, badge: rooms.filter(r => r.status === 'CLEAN').length },
    { id: 'housekeeping', label: '3. Housekeeping & Facility', icon: Sparkles, badge: housekeepingTasks.filter(t => t.status !== 'INSPECTED_CLEAN').length },
    { id: 'billing_pos', label: '4. Billing, POS & Register', icon: Receipt, badge: folios.filter(f => !f.paid).length },
    { id: 'audit_logs', label: '5. Audit Action Logs', icon: ShieldCheck, badge: auditLogs.length },
    { id: 'hotel_profile', label: 'Hotel Profile & Policies', icon: Building, badge: null }
  ];

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-neutral-900 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-amber-950 text-white p-5 shrink-0 flex flex-col justify-between border-r border-amber-900 shadow-2xl">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="pb-4 border-b border-amber-800">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-0.5">
              Brijnidhi PMS Enterprise
            </span>
            <h2 className="font-serif font-black text-xl text-white">
              HOTELIER PORTAL
            </h2>
            <p className="text-xs text-amber-200/90 font-medium truncate mt-0.5">
              {hotelProfile.name}
            </p>
          </div>

          {/* Module Navigation List */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition text-left ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md font-bold'
                      : 'text-amber-100/75 hover:text-white hover:bg-amber-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge > 0 && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-amber-900' : 'bg-amber-900 text-amber-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Operator Badge & Quick Links */}
        <div className="pt-6 border-t border-amber-900 text-xs space-y-3">
          {/* Active Operator Pill */}
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="w-full p-2.5 rounded-2xl bg-amber-900/70 hover:bg-amber-800 border border-amber-700/60 text-left transition flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-xs">
                {currentOperator.name.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-white text-[11px] block">{currentOperator.name}</span>
                <span className="text-[9px] text-amber-300 font-mono">{currentOperator.role} (PIN: {currentOperator.pin})</span>
              </div>
            </div>
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* System Links */}
          <div className="flex items-center justify-between text-[10px] text-amber-300/80 pt-1">
            <Link href="/admin" className="hover:underline flex items-center space-x-1">
              <span>Super Admin</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
            <span>•</span>
            <Link href="/" className="hover:underline">
              Public Site
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN PMS OPERATIONS WORKSPACE */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
        {/* TOP COMMAND BAR & STATUS HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <span>Property: VRN-01</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">● 100% Satvik Purity Certified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900">
              {hotelProfile.name}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Command Bar Trigger Button (Cmd+K) */}
            <button
              onClick={() => setIsCommandBarOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50/60 border border-amber-300 text-xs font-semibold text-neutral-800 shadow-sm transition flex items-center space-x-2"
            >
              <Search className="w-3.5 h-3.5 text-amber-700" />
              <span>Universal Search</span>
              <span className="font-mono text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-200">
                ⌘K
              </span>
            </button>

            {/* Offline-First Sync Pill (Module 5) */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border shadow-sm ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
              title="Click to toggle offline mode simulation"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Online (Synced)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>Offline (Local Cache)</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* 1. MODULE 1: HIGH-SPEED FRONT DESK */}
        {activeTab === 'front_desk' && (
          <HighSpeedFrontDesk
            rooms={rooms}
            bookings={bookings}
            folios={folios}
            operatorName={currentOperator.name}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onWalkInCheckIn={handleWalkInCheckIn}
            onLogAudit={logAudit}
          />
        )}

        {/* 2. MODULE 2: LIVE ROOM INVENTORY & VISUAL GRID */}
        {activeTab === 'tape_chart' && (
          <LiveTapeChart
            rooms={rooms}
            bookings={bookings}
            onToggleEmergencyLock={handleToggleEmergencyLock}
            onMoveStay={handleMoveStay}
            onExtendStay={handleExtendStay}
            onSetRoomStatus={handleSetRoomStatus}
            onLogAudit={logAudit}
          />
        )}

        {/* 3. MODULE 3: HOUSEKEEPING & MAINTENANCE AUTOMATION */}
        {activeTab === 'housekeeping' && (
          <HousekeepingAutomation
            tasks={housekeepingTasks}
            tickets={maintenanceTickets}
            rooms={rooms}
            operatorName={currentOperator.name}
            onUpdateChecklist={handleUpdateChecklist}
            onSubmitPhotoAndVerify={handleSubmitPhotoAndVerify}
            onCreateMaintenanceTicket={handleCreateMaintenanceTicket}
            onResolveTicket={handleResolveTicket}
            onLogAudit={logAudit}
          />
        )}

        {/* 4. MODULE 4: BILLING, POS & CASH RECONCILIATION */}
        {activeTab === 'billing_pos' && (
          <BillingFolioPOS
            folios={folios}
            bookings={bookings}
            rooms={rooms}
            shiftRecord={shiftRecord}
            operatorName={currentOperator.name}
            onAddFolioItem={handleAddFolioItem}
            onSettleFolio={handleSettleFolio}
            onUpdateShiftBalance={handleUpdateShiftBalance}
            onCloseShift={handleCloseShift}
            onLogAudit={logAudit}
          />
        )}

        {/* 5. MODULE 5: AUDIT ACTION LOGS */}
        {activeTab === 'audit_logs' && (
          <AuditLogsViewer logs={auditLogs} />
        )}

        {/* 6. HOTEL PROFILE & POLICIES */}
        {activeTab === 'hotel_profile' && (
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
                    logAudit('HOTEL_PROFILE_UPDATED', 'Front Desk', 'Updated hotel profile and contact information');
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
      </main>

      {/* GLOBAL COMMAND BAR MODAL (Cmd+K / Ctrl+K) */}
      <GlobalCommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        bookings={bookings}
        rooms={rooms}
        onSelectBooking={booking => {
          setActiveTab('billing_pos');
        }}
        onSelectRoom={room => {
          setActiveTab('tape_chart');
        }}
        onNavigateTab={tabId => setActiveTab(tabId)}
      />

      {/* FAST PIN SHIFT SWITCHING MODAL (Module 5) */}
      <PinSwitchModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentOperator={currentOperator}
        onSwitchOperator={newOp => {
          setCurrentOperator(newOp);
          logAudit('SHIFT_OPERATOR_SWITCHED', 'Shift Balance', `Shift operator switched to ${newOp.name} (${newOp.role})`);
        }}
      />
    </div>
  );
}
