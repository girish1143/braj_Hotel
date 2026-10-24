'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Building2,
  Users,
  Bed,
  CalendarCheck,
  IndianRupee,
  Sparkles,
  Settings,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  KeyRound,
  LayoutDashboard,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  Utensils,
  Coffee,
  Download,
  Printer,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Check,
  X,
  FileText,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  UserPlus,
  SlidersHorizontal,
  Receipt,
  Wrench,
  ChefHat,
  BarChart3
} from 'lucide-react';

import { StaffAccount, StaffRole, HotelPMSProperty } from './types';
import HotelAdminLogin from './HotelAdminLogin';
import StaffManagementModule from './StaffManagementModule';
import ChangePasswordModal from './ChangePasswordModal';
import StaffProfileModal from './StaffProfileModal';
import PropertySwitcherModal from './PropertySwitcherModal';
import { BRAJ_HOTEL_PROPERTIES } from './hotelData';
import RoomInventoryTable, { RoomItem } from './RoomInventoryTable';
import { API_BASE_URL } from '../../lib/api';

const API_BASE = `${API_BASE_URL}/hotel-admin`;

// Types for Hotel Admin Modules

interface BookingItem {
  id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalAmount: number;
  advancePaid: number;
  pendingAmount: number;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID' | 'REFUNDED';
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  specialRequests?: string;
  satvikMealPreference: boolean;
  createdAt: string;
}

interface GuestItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idProofType: string;
  idProofNumber: string;
  city: string;
  totalStays: number;
  totalSpent: number;
  specialRequests?: string;
  createdAt: string;
}

interface PaymentItem {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  bookingReference: string;
  guestName: string;
  amount: number;
  taxAmount: number;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Net Banking';
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'REFUNDED';
  refundAmount?: number;
  notes?: string;
  date: string;
}

interface HousekeepingItem {
  id: string;
  roomNumber: string;
  assignedStaffName?: string;
  taskType: 'Turnover Cleaning' | 'Daily Refresh' | 'Deep Sanitization' | 'Linens Replacement';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'Pending' | 'In Progress' | 'Completed';
  cleanliness: 'Clean' | 'Dirty' | 'Inspected';
  notes?: string;
  updatedAt: string;
}

interface MaintenanceItem {
  id: string;
  roomNumber: string;
  issue: string;
  category: 'Plumbing' | 'Electrical' | 'HVAC/AC' | 'Geyser' | 'Carpentry';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'Open' | 'In Progress' | 'Resolved';
  reportedBy: string;
  createdAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Satvik Thali' | 'Snacks' | 'Beverages' | 'Braj Sweets';
  price: number;
  isSatvik: boolean;
  isAvailable: boolean;
  description: string;
}

interface FoodOrder {
  id: string;
  orderNumber: string;
  orderType: 'Room Service' | 'Dine In';
  targetLocation: string;
  items: { itemId: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'Received' | 'Preparing' | 'Delivered' | 'Settled';
  createdAt: string;
}

export const TAB_ROUTE_MAP: Record<string, string> = {
  '': 'dashboard',
  'dashboard': 'dashboard',
  'rooms': 'room_management',
  'bookings': 'booking_management',
  'guests': 'guest_management',
  'staff': 'staff_management',
  'payments': 'payments_billing',
  'housekeeping': 'housekeeping_management',
  'restaurant': 'restaurant_management',
  'reports': 'reports_analytics',
  'settings': 'settings_security',
};

export const TAB_TO_SLUG: Record<string, string> = {
  'dashboard': 'dashboard',
  'room_management': 'rooms',
  'booking_management': 'bookings',
  'guest_management': 'guests',
  'staff_management': 'staff',
  'payments_billing': 'payments',
  'housekeeping_management': 'housekeeping',
  'restaurant_management': 'restaurant',
  'reports_analytics': 'reports',
  'settings_security': 'settings',
};

export function resolveTabSlug(slug?: string): string {
  if (!slug) return 'dashboard';
  const clean = slug.toLowerCase().trim();
  return TAB_ROUTE_MAP[clean] || 'dashboard';
}

export function getRouteSlug(tabId: string): string {
  return TAB_TO_SLUG[tabId] || tabId;
}

interface HotelAdminClientProps {
  initialRoute?: string;
  basePath?: string;
}

export default function HotelAdminMasterPage({ initialRoute = 'dashboard', basePath }: HotelAdminClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Detect base path: '/hotel/dashboard' or '/hotel/admin'
  const activeBasePath = useMemo(() => {
    if (basePath) return basePath;
    if (pathname?.startsWith('/hotel/dashboard')) return '/hotel/dashboard';
    return '/hotel/admin';
  }, [basePath, pathname]);

  // 1. ACTIVE PROPERTY STATE (Braj Pilgrimage Properties)
  const [activePropertyId, setActivePropertyId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brijnidhi_pms_active_property_id');
      if (saved && BRAJ_HOTEL_PROPERTIES.some(p => p.id === saved)) {
        return saved;
      }
    }
    return BRAJ_HOTEL_PROPERTIES[0].id;
  });

  const activeProperty = useMemo(() => {
    return BRAJ_HOTEL_PROPERTIES.find(p => p.id === activePropertyId) || BRAJ_HOTEL_PROPERTIES[0];
  }, [activePropertyId]);

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

  // 2. AUTHENTICATION & SESSION STATE
  const [currentStaff, setCurrentStaff] = useState<StaffAccount | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brijnidhi_hotel_admin_staff');
      const isLoggedOut = localStorage.getItem('brijnidhi_hotel_admin_logged_out');
      if (saved && isLoggedOut !== 'true') {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.fullName && parsed.role) return parsed;
        } catch {}
      }
    }
    return null;
  });

  const [authChecking, setAuthChecking] = useState(true);

  // Server-side session verification & protection
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('brijnidhi_hotel_admin_token') : null;
      const isLoggedOut = typeof window !== 'undefined' ? localStorage.getItem('brijnidhi_hotel_admin_logged_out') : null;

      if (!storedToken || isLoggedOut === 'true') {
        setCurrentStaff(null);
        setAuthChecking(false);
        if (pathname?.startsWith('/hotel/dashboard')) {
          router.replace('/hotel/signin');
        }
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'x-brijnidhi-staff-token': storedToken,
            'Authorization': `Bearer ${storedToken}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success && data.data?.profile) {
          setCurrentStaff(data.data.profile);
          if (typeof window !== 'undefined') {
            localStorage.setItem('brijnidhi_hotel_admin_staff', JSON.stringify(data.data.profile));
          }
        } else {
          // Token is invalid on server
          if (typeof window !== 'undefined') {
            localStorage.removeItem('brijnidhi_hotel_admin_token');
            localStorage.removeItem('brijnidhi_hotel_admin_staff');
          }
          setCurrentStaff(null);
          if (pathname?.startsWith('/hotel/dashboard')) {
            router.replace('/hotel/signin');
          }
        }
      } catch {
        // Network resilience: if local staff was saved, keep session
        const localSaved = typeof window !== 'undefined' ? localStorage.getItem('brijnidhi_hotel_admin_staff') : null;
        if (!localSaved && pathname?.startsWith('/hotel/dashboard')) {
          router.replace('/hotel/signin');
        }
      } finally {
        setAuthChecking(false);
      }
    };

    verifySession();
  }, [pathname, router]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('brijnidhi_hotel_admin_token') || '' : '';

  // Auth Modals
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Active Tab Module state
  const [activeTab, setActiveTab] = useState<string>(() => {
    return resolveTabSlug(initialRoute);
  });

  // Role
  const currentRole = (currentStaff?.role as StaffRole) || 'Admin';
  const isAdmin = currentRole === 'Admin';

  // Role permissions navigation
  const allowedTabsByRole: Record<StaffRole, string[]> = {
    Admin: [
      'dashboard',
      'staff_management',
      'room_management',
      'booking_management',
      'guest_management',
      'payments_billing',
      'housekeeping_management',
      'restaurant_management',
      'reports_analytics',
      'settings_security'
    ],
    Manager: [
      'dashboard',
      'staff_management',
      'room_management',
      'booking_management',
      'guest_management',
      'payments_billing',
      'housekeeping_management',
      'restaurant_management',
      'reports_analytics'
    ],
    Receptionist: [
      'dashboard',
      'room_management',
      'booking_management',
      'guest_management',
      'payments_billing'
    ],
    Housekeeping: [
      'dashboard',
      'room_management',
      'housekeeping_management'
    ],
    Accountant: [
      'dashboard',
      'booking_management',
      'payments_billing',
      'reports_analytics'
    ],
    'Restaurant Staff': [
      'dashboard',
      'restaurant_management'
    ]
  };

  const navItems = [
    { id: 'dashboard', slug: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'staff_management', slug: 'staff', label: 'Staff Management', icon: Users, adminOnly: true },
    { id: 'room_management', slug: 'rooms', label: 'Room Management', icon: Bed },
    { id: 'booking_management', slug: 'bookings', label: 'Booking Management', icon: CalendarCheck },
    { id: 'guest_management', slug: 'guests', label: 'Guest Management', icon: UserCheck },
    { id: 'payments_billing', slug: 'payments', label: 'Payments & Billing', icon: IndianRupee },
    { id: 'housekeeping_management', slug: 'housekeeping', label: 'Housekeeping', icon: Wrench },
    { id: 'restaurant_management', slug: 'restaurant', label: 'Restaurant & Dining', icon: Utensils },
    { id: 'reports_analytics', slug: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings_security', slug: 'settings', label: 'Settings & Security', icon: Settings, adminOnly: true }
  ];

  const visibleNavItems = navItems.filter(item => {
    const roleAllowed = (allowedTabsByRole[currentRole] || allowedTabsByRole.Admin).includes(item.id);
    return roleAllowed;
  });

  // Auto redirect if tab not allowed
  useEffect(() => {
    const allowed = allowedTabsByRole[currentRole] || [];
    if (!allowed.includes(activeTab)) {
      setActiveTab(allowed[0] || 'dashboard');
    }
  }, [currentRole, activeTab]);

  // Logout handler
  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      const tok = localStorage.getItem('brijnidhi_hotel_admin_token');
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-brijnidhi-staff-token': tok || ''
          },
          body: JSON.stringify({
            staffId: currentStaff?.id,
            staffName: currentStaff?.fullName
          })
        });
      } catch {}

      localStorage.setItem('brijnidhi_hotel_admin_logged_out', 'true');
      localStorage.removeItem('brijnidhi_hotel_admin_staff');
      localStorage.removeItem('brijnidhi_hotel_admin_token');
    }
    setCurrentStaff(null);
    setShowLogoutConfirm(false);
    router.push('/hotel/signin');
  };

  // --- STATE FOR ALL 11 MODULES ---
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [housekeeping, setHousekeeping] = useState<HousekeepingItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [hotelSettings, setHotelSettings] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper fetch with headers
  const authHeaders = useMemo(() => {
    return {
      'Content-Type': 'application/json',
      'x-brijnidhi-role': 'HOTEL_ADMIN',
      'x-brijnidhi-staff-token': token,
      'Authorization': `Bearer ${token}`
    };
  }, [token]);

  // Load all data
  const loadModuleData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Dashboard
      const dashRes = await fetch(`${API_BASE}/dashboard`, { headers: authHeaders });
      if (dashRes.ok) {
        const d = await dashRes.json();
        setDashboardData(d.data);
      }

      // 2. Rooms
      const roomsRes = await fetch(`${API_BASE}/rooms`, { headers: authHeaders });
      if (roomsRes.ok) {
        const r = await roomsRes.json();
        setRooms(r.data || []);
      }

      // 3. Bookings
      const bookRes = await fetch(`${API_BASE}/bookings`, { headers: authHeaders });
      if (bookRes.ok) {
        const b = await bookRes.json();
        setBookings(b.data || []);
      }

      // 4. Guests
      const gstRes = await fetch(`${API_BASE}/guests`, { headers: authHeaders });
      if (gstRes.ok) {
        const g = await gstRes.json();
        setGuests(g.data || []);
      }

      // 5. Payments
      const payRes = await fetch(`${API_BASE}/payments`, { headers: authHeaders });
      if (payRes.ok) {
        const p = await payRes.json();
        setPayments(p.data || []);
      }

      // 6. Housekeeping
      const hkRes = await fetch(`${API_BASE}/housekeeping`, { headers: authHeaders });
      if (hkRes.ok) {
        const hk = await hkRes.json();
        setHousekeeping(hk.tasks || []);
        setMaintenance(hk.maintenance || []);
      }

      // 7. Restaurant
      const menuRes = await fetch(`${API_BASE}/restaurant/menu`, { headers: authHeaders });
      if (menuRes.ok) {
        const m = await menuRes.json();
        setMenuItems(m.data || []);
      }
      const ordRes = await fetch(`${API_BASE}/restaurant/orders`, { headers: authHeaders });
      if (ordRes.ok) {
        const o = await ordRes.json();
        setOrders(o.data || []);
      }

      // 8. Reports
      const repRes = await fetch(`${API_BASE}/reports`, { headers: authHeaders });
      if (repRes.ok) {
        const rp = await repRes.json();
        setReports(rp.data || null);
      }

      // 9. Settings
      const setRes = await fetch(`${API_BASE}/settings`, { headers: authHeaders });
      if (setRes.ok) {
        const s = await setRes.json();
        setHotelSettings(s.data || null);
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (currentStaff) {
      loadModuleData();
    }
  }, [currentStaff, loadModuleData]);

  // Flash feedback auto-clear
  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  // ===================== MODALS STATE =====================
  // Room Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [roomFormData, setRoomFormData] = useState<{
    roomNumber: string;
    floor: number;
    roomType: string;
    pricePerNight: number;
    weekendPrice: number;
    capacity: number;
    bedType: string;
    status: RoomItem['status'];
    amenities: string[];
    imageUrl: string;
  }>({
    roomNumber: '',
    floor: 1,
    roomType: 'Deluxe AC',
    pricePerNight: 2400,
    weekendPrice: 2800,
    capacity: 2,
    bedType: 'King Bed',
    status: 'Available',
    amenities: ['Air Conditioning', 'Geyser Hot Water', 'Wi-Fi'],
    imageUrl: ''
  });

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    roomNumber: '101',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    adults: 2,
    children: 0,
    totalAmount: 4800,
    advancePaid: 2400,
    specialRequests: '',
    satvikMealPreference: true
  });

  // Guest Modal
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const [guestFormData, setGuestFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
    city: '',
    specialRequests: ''
  });

  // Payment Record Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    bookingReference: '',
    guestName: '',
    amount: 2400,
    paymentMethod: 'UPI' as const,
    notes: 'Settled at hotel desk.'
  });

  // Refund Modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundTargetPayment, setRefundTargetPayment] = useState<PaymentItem | null>(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('Guest requested cancellation');

  // Housekeeping Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    roomNumber: '101',
    assignedStaffName: 'Kailash Yadav',
    taskType: 'Turnover Cleaning' as const,
    priority: 'MEDIUM' as const,
    notes: ''
  });

  // Maintenance Modal
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    roomNumber: '101',
    category: 'Plumbing' as const,
    issue: '',
    priority: 'HIGH' as const
  });

  // Menu Item Modal
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuFormData, setMenuFormData] = useState<{
    name: string;
    category: MenuItem['category'];
    price: number;
    description: string;
    isSatvik: boolean;
    isAvailable: boolean;
  }>({
    name: '',
    category: 'Satvik Thali',
    price: 250,
    description: '',
    isSatvik: true,
    isAvailable: true
  });

  // Food Order Modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    orderType: 'Room Service' as const,
    targetLocation: 'Room 101',
    selectedItems: [] as { itemId: string; name: string; quantity: number; price: number }[]
  });

  // Invoice Printable View Modal
  const [activeInvoice, setActiveInvoice] = useState<PaymentItem | null>(null);

  // Filters & Search States
  const [roomFilterStatus, setRoomFilterStatus] = useState<string>('ALL');
  const [roomSearch, setRoomSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('ALL');
  const [bookingSearch, setBookingSearch] = useState('');
  const [guestSearch, setGuestSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [hkFilterStatus, setHkFilterStatus] = useState<string>('ALL');

  // ===================== CRUD ACTIONS =====================

  // ROOM ACTIONS
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      roomNumber: '',
      floor: 1,
      roomType: 'Deluxe AC',
      pricePerNight: 2400,
      weekendPrice: 2800,
      capacity: 2,
      bedType: 'King Bed',
      status: 'Available',
      amenities: ['Air Conditioning', 'Geyser Hot Water', 'Wi-Fi'],
      imageUrl: ''
    });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: RoomItem) => {
    setEditingRoom(room);
    setRoomFormData({
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      weekendPrice: room.weekendPrice || Math.round(room.pricePerNight * 1.15),
      capacity: room.capacity,
      bedType: room.bedType,
      status: room.status,
      amenities: room.amenities || [],
      imageUrl: room.imageUrl || ''
    });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomFormData.roomNumber || !roomFormData.pricePerNight) return;

    try {
      if (editingRoom) {
        const res = await fetch(`${API_BASE}/rooms/${editingRoom.id}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify(roomFormData)
        });
        const data = await res.json();
        if (data.success) {
          setRooms(prev => prev.map(r => r.id === editingRoom.id ? data.data : r));
          setFeedbackMsg({ type: 'success', text: `Room ${roomFormData.roomNumber} updated.` });
          setIsRoomModalOpen(false);
        } else {
          setFeedbackMsg({ type: 'error', text: data.message || 'Failed to update room.' });
        }
      } else {
        const res = await fetch(`${API_BASE}/rooms`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(roomFormData)
        });
        const data = await res.json();
        if (data.success) {
          setRooms(prev => [data.data, ...prev]);
          setFeedbackMsg({ type: 'success', text: `Room ${data.data.roomNumber} added to inventory.` });
          setIsRoomModalOpen(false);
        } else {
          setFeedbackMsg({ type: 'error', text: data.message || 'Failed to add room.' });
        }
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Network error saving room.' });
    }
  };

  const handleDeleteRoom = async (id: string, roomNum: string) => {
    if (!confirm(`Are you sure you want to delete room ${roomNum}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/rooms/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        setRooms(prev => prev.filter(r => r.id !== id));
        setFeedbackMsg({ type: 'success', text: `Room ${roomNum} deleted.` });
      } else {
        setFeedbackMsg({ type: 'error', text: data.message });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error deleting room.' });
    }
  };

  const handleUpdateRoomStatus = async (id: string, newStatus: RoomItem['status']) => {
    try {
      const res = await fetch(`${API_BASE}/rooms/${id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setRooms(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        setFeedbackMsg({ type: 'success', text: `Room status changed to ${newStatus}.` });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to update status.' });
    }
  };

  // BOOKING ACTIONS
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingFormData.guestName || !bookingFormData.guestPhone) return;

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(bookingFormData)
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => [data.data, ...prev]);
        setFeedbackMsg({ type: 'success', text: `Booking ${data.data.bookingReference} confirmed!` });
        setIsBookingModalOpen(false);
        loadModuleData(); // refresh dashboard counters and rooms
      } else {
        setFeedbackMsg({ type: 'error', text: data.message });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error saving booking.' });
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingItem['bookingStatus']) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, bookingStatus: status } : b));
        setFeedbackMsg({ type: 'success', text: `Booking marked as ${status}.` });
        loadModuleData();
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to update booking status.' });
    }
  };

  // GUEST ACTIONS
  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestFormData.fullName || !guestFormData.phone) return;

    try {
      if (editingGuest) {
        const res = await fetch(`${API_BASE}/guests/${editingGuest.id}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify(guestFormData)
        });
        const data = await res.json();
        if (data.success) {
          setGuests(prev => prev.map(g => g.id === editingGuest.id ? data.data : g));
          setFeedbackMsg({ type: 'success', text: `Guest ${guestFormData.fullName} updated.` });
          setIsGuestModalOpen(false);
        }
      } else {
        const res = await fetch(`${API_BASE}/guests`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(guestFormData)
        });
        const data = await res.json();
        if (data.success) {
          setGuests(prev => [data.data, ...prev]);
          setFeedbackMsg({ type: 'success', text: `Guest profile created.` });
          setIsGuestModalOpen(false);
        }
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error saving guest.' });
    }
  };

  // PAYMENT ACTIONS
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFormData.amount) return;

    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(paymentFormData)
      });
      const data = await res.json();
      if (data.success) {
        setPayments(prev => [data.data, ...prev]);
        setFeedbackMsg({ type: 'success', text: `Invoice ${data.data.invoiceNumber} recorded!` });
        setIsPaymentModalOpen(false);
        loadModuleData();
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error recording payment.' });
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTargetPayment) return;

    try {
      const res = await fetch(`${API_BASE}/payments/${refundTargetPayment.id}/refund`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ refundAmount, reason: refundReason })
      });
      const data = await res.json();
      if (data.success) {
        setPayments(prev => prev.map(p => p.id === refundTargetPayment.id ? data.data : p));
        setFeedbackMsg({ type: 'success', text: `Refund of ₹${refundAmount} processed.` });
        setIsRefundModalOpen(false);
        loadModuleData();
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error processing refund.' });
    }
  };

  // HOUSEKEEPING ACTIONS
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/housekeeping`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(taskFormData)
      });
      const data = await res.json();
      if (data.success) {
        setHousekeeping(prev => [data.data, ...prev]);
        setFeedbackMsg({ type: 'success', text: `Cleaning task assigned for room ${taskFormData.roomNumber}.` });
        setIsTaskModalOpen(false);
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error assigning task.' });
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: HousekeepingItem['status']) => {
    try {
      const res = await fetch(`${API_BASE}/housekeeping/${id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status, cleanliness: status === 'Completed' ? 'Clean' : 'In Progress' })
      });
      const data = await res.json();
      if (data.success) {
        setHousekeeping(prev => prev.map(t => t.id === id ? data.data : t));
        setFeedbackMsg({ type: 'success', text: 'Task status updated.' });
        loadModuleData();
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error updating task.' });
    }
  };

  const handleLogMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/housekeeping/maintenance`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(maintenanceFormData)
      });
      const data = await res.json();
      if (data.success) {
        setMaintenance(prev => [data.data, ...prev]);
        setFeedbackMsg({ type: 'success', text: `Maintenance logged for room ${maintenanceFormData.roomNumber}.` });
        setIsMaintenanceModalOpen(false);
        loadModuleData();
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error logging maintenance.' });
    }
  };

  // RESTAURANT ACTIONS
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMenuItem) {
        const res = await fetch(`${API_BASE}/restaurant/menu/${editingMenuItem.id}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify(menuFormData)
        });
        const data = await res.json();
        if (data.success) {
          setMenuItems(prev => prev.map(m => m.id === editingMenuItem.id ? data.data : m));
          setFeedbackMsg({ type: 'success', text: `Menu item updated.` });
          setIsMenuModalOpen(false);
        }
      } else {
        const res = await fetch(`${API_BASE}/restaurant/menu`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(menuFormData)
        });
        const data = await res.json();
        if (data.success) {
          setMenuItems(prev => [data.data, ...prev]);
          setFeedbackMsg({ type: 'success', text: `Item '${data.data.name}' added to menu.` });
          setIsMenuModalOpen(false);
        }
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error saving menu item.' });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderFormData.selectedItems.length) {
      alert('Please select at least one dish.');
      return;
    }
    const total = orderFormData.selectedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    try {
      const res = await fetch(`${API_BASE}/restaurant/orders`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          orderType: orderFormData.orderType,
          targetLocation: orderFormData.targetLocation,
          items: orderFormData.selectedItems,
          totalAmount: total
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => [data.data, ...prev]);
        setFeedbackMsg({ type: 'success', text: `Order ${data.data.orderNumber} placed!` });
        setIsOrderModalOpen(false);
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error placing order.' });
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: FoodOrder['status']) => {
    try {
      const res = await fetch(`${API_BASE}/restaurant/orders/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        setFeedbackMsg({ type: 'success', text: `Order status set to ${status}.` });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error updating order status.' });
    }
  };

  // SETTINGS SAVE
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(hotelSettings)
      });
      const data = await res.json();
      if (data.success) {
        setHotelSettings(data.data);
        setFeedbackMsg({ type: 'success', text: 'Hotel settings & policies saved successfully.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Error saving settings.' });
    }
  };

  // EXPORT TO CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Booking Reference,Guest Name,Phone,Room Number,Check-In,Check-Out,Total Amount,Status\n' +
      bookings
        .map(
          b =>
            `"${b.bookingReference}","${b.guestName}","${b.guestPhone}","${b.roomNumber}","${b.checkInDate}","${b.checkOutDate}","₹${b.totalAmount}","${b.bookingStatus}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brijnidhi_hotel_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedbackMsg({ type: 'success', text: 'Report exported to CSV successfully.' });
  };

  // ===================== RENDER: UNAUTHENTICATED OR CHECKING =====================
  if (authChecking) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-amber-100 p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-serif font-black text-xl mb-4 animate-pulse">
          श्री
        </div>
        <div className="text-sm font-semibold tracking-wide">Verifying Hotel Partner Credentials...</div>
        <div className="text-xs text-stone-400 mt-1">Authenticating session with Brijnidhi PMS Core</div>
      </div>
    );
  }

  if (!currentStaff) {
    if (activeBasePath === '/hotel/dashboard') {
      return (
        <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl text-stone-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-serif font-bold text-amber-50">Protected Dashboard Area</h2>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              You must be an authenticated hotel administrator or staff member to view and manage operational hotel data.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/hotel/signin"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md"
              >
                Sign In to Hotel Dashboard
              </Link>
              <Link
                href="/list-property"
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
              >
                Register a New Hotel
              </Link>
              <Link
                href="/hotel"
                className="text-[11px] text-amber-400/80 hover:text-amber-300 transition-colors mt-2"
              >
                ← Back to Hotel Partner Welcome Page
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <HotelAdminLogin
        hotelName={activeProperty.name}
        propertyCode={activeProperty.propertyCode}
        destination={activeProperty.destination}
        onLoginSuccess={(staff, tok) => {
          setCurrentStaff(staff);
          if (typeof window !== 'undefined') {
            localStorage.setItem('brijnidhi_hotel_admin_staff', JSON.stringify(staff));
            localStorage.setItem('brijnidhi_hotel_admin_token', tok);
            localStorage.removeItem('brijnidhi_hotel_admin_logged_out');
          }
        }}
        onSwitchProperty={() => setIsPropertyModalOpen(true)}
      />
    );
  }

  // ===================== RENDER: MAIN ADMIN PORTAL =====================
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      {/* 1. TOP STATUS BAR & HEADER */}
      <header className="bg-stone-900 text-amber-50 px-4 lg:px-8 py-3.5 border-b border-amber-900/40 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand & Property */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-serif font-black text-xl shadow-inner">
                श्री
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-serif font-bold text-amber-100 tracking-wide">
                    {activeProperty.name}
                  </h1>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-400/30">
                    {activeProperty.propertyCode}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>{activeProperty.destination} Dham</span>
                  <span className="text-stone-600">•</span>
                  <span className="text-amber-300/80 font-medium">Hotel Admin Panel</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsPropertyModalOpen(true)}
              className="text-xs bg-stone-800 hover:bg-stone-700 text-amber-200 px-2.5 py-1.5 rounded-lg border border-amber-800/40 transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Switch Hotel</span>
            </button>
          </div>

          {/* Quick Stats Banner & Admin Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Live operational chips */}
            <div className="hidden xl:flex items-center gap-2 text-xs bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {rooms.filter(r => r.status === 'Available').length} Rooms Free
              </span>
              <span className="text-stone-600">|</span>
              <span className="text-amber-300">
                {bookings.filter(b => b.bookingStatus === 'CHECKED_IN').length} Checked In
              </span>
            </div>

            {/* User Profile Chip */}
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-750 px-3 py-1.5 rounded-lg border border-stone-700 cursor-pointer transition-colors"
              title="Click to view & edit your profile"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/30">
                {currentStaff.fullName.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-stone-200 leading-tight">
                  {currentStaff.fullName}
                </div>
                <div className="text-[10px] text-amber-400 font-medium">
                  {currentStaff.role} {isAdmin && '★'}
                </div>
              </div>
            </div>

            {/* Change Password */}
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="p-2 bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-amber-200 rounded-lg border border-stone-700 transition-colors"
              title="Change Password"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 px-3 py-1.5 rounded-lg border border-red-800/50 text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. FEEDBACK BANNER */}
      {feedbackMsg && (
        <div
          className={`px-4 py-2.5 text-center text-xs font-medium transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border-b border-emerald-200'
              : 'bg-red-100 text-red-900 border-b border-red-200'
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* 3. MAIN WORKSPACE WITH SIDEBAR NAVIGATION */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 lg:p-6 gap-6">
        {/* SIDEBAR */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-stone-200/80 sticky top-24">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Management Modules
            </div>

            <nav className="space-y-1 mt-1">
              {visibleNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200 shadow-xs'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.adminOnly && (
                      <span className="text-[9px] bg-stone-100 text-stone-500 px-1 py-0.5 rounded font-mono">
                        ADM
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Summary Card */}
            <div className="mt-6 pt-4 border-t border-stone-100 px-3">
              <div className="text-[11px] font-semibold text-stone-600 mb-2">Live Status</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Occupancy</span>
                  <span className="font-semibold text-stone-800">
                    {rooms.length > 0
                      ? Math.round((rooms.filter(r => r.status === 'Occupied').length / rooms.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Cleanliness</span>
                  <span className="font-semibold text-emerald-700">98% Pious</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Satvik Kitchen</span>
                  <span className="font-semibold text-amber-800">100% Certified</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {/* Mobile Tab Selector */}
          <div className="lg:hidden mb-4">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {visibleNavItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* ===================== TAB 1: DASHBOARD OVERVIEW ===================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-2xl p-6 shadow-sm">
                <div>
                  <div className="text-amber-200 text-xs font-medium tracking-wide uppercase">
                    Admin Operational Control
                  </div>
                  <h2 className="text-2xl font-serif font-bold mt-1">
                    Radhe Radhe, {currentStaff.fullName}
                  </h2>
                  <p className="text-amber-100/80 text-xs mt-1">
                    Overview of guest stays, room occupancy, and daily front desk operations.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="bg-white text-stone-900 hover:bg-amber-50 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    New Reservation
                  </button>
                  {isAdmin && (
                    <button
                      onClick={handleOpenAddRoom}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Bed className="w-3.5 h-3.5" />
                      Add Room
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Metric Counter Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Rooms Card */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                    <span>Total Rooms</span>
                    <Bed className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-stone-900 mt-2">
                    {rooms.length}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] mt-2 text-stone-600">
                    <span className="text-emerald-700 font-semibold">
                      {rooms.filter(r => r.status === 'Available').length} Available
                    </span>
                    <span>•</span>
                    <span className="text-amber-700 font-semibold">
                      {rooms.filter(r => r.status === 'Occupied').length} Occupied
                    </span>
                  </div>
                </div>

                {/* Guests & Bookings */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                    <span>Active Bookings</span>
                    <CalendarCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-stone-900 mt-2">
                    {bookings.filter(b => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN').length}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-2">
                    Total Registered Guests: <span className="font-semibold text-stone-800">{guests.length}</span>
                  </div>
                </div>

                {/* Today Operations */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                    <span>Today Check-ins</span>
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-stone-900 mt-2">
                    {bookings.filter(b => b.bookingStatus === 'CHECKED_IN').length}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-2">
                    Check-outs: <span className="font-semibold text-stone-800">{bookings.filter(b => b.bookingStatus === 'CHECKED_OUT').length}</span>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                    <span>Total Revenue</span>
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-emerald-800 mt-2">
                    ₹{payments.reduce((acc, p) => acc + (p.status !== 'REFUNDED' ? p.amount : 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-2">
                    Pending: <span className="text-amber-800 font-semibold">₹{bookings.reduce((acc, b) => acc + (b.pendingAmount || 0), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">Recent Pilgrimage Bookings</h3>
                    <p className="text-xs text-stone-500">Live reservations currently managed at front desk</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('booking_management')}
                    className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-100 text-stone-400 font-medium">
                        <th className="pb-2.5">Reference</th>
                        <th className="pb-2.5">Guest Name</th>
                        <th className="pb-2.5">Room</th>
                        <th className="pb-2.5">Dates</th>
                        <th className="pb-2.5">Amount</th>
                        <th className="pb-2.5">Payment</th>
                        <th className="pb-2.5">Status</th>
                        <th className="pb-2.5 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {bookings.slice(0, 5).map(b => (
                        <tr key={b.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-3 font-mono font-bold text-stone-700">{b.bookingReference}</td>
                          <td className="py-3 font-medium text-stone-900">{b.guestName}</td>
                          <td className="py-3">
                            <span className="font-semibold text-amber-800">#{b.roomNumber}</span>{' '}
                            <span className="text-stone-400 text-[11px]">({b.roomType})</span>
                          </td>
                          <td className="py-3 text-stone-600">
                            {b.checkInDate} to {b.checkOutDate}
                          </td>
                          <td className="py-3 font-semibold text-stone-900">₹{b.totalAmount}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                b.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.paymentStatus === 'PARTIALLY_PAID'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {b.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                b.bookingStatus === 'CHECKED_IN'
                                  ? 'bg-blue-100 text-blue-800'
                                  : b.bookingStatus === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {b.bookingStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {b.bookingStatus === 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_IN')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-medium"
                              >
                                Check-In
                              </button>
                            )}
                            {b.bookingStatus === 'CHECKED_IN' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_OUT')}
                                className="bg-stone-800 hover:bg-stone-900 text-white px-2.5 py-1 rounded text-[11px] font-medium"
                              >
                                Check-Out
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Maintenance & Room Health Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                  <h3 className="font-serif font-bold text-stone-900 text-sm mb-3">Room Cleanliness Snapshot</h3>
                  <div className="space-y-3">
                    {housekeeping.slice(0, 3).map(hk => (
                      <div key={hk.id} className="flex items-center justify-between text-xs p-2.5 bg-stone-50 rounded-xl">
                        <div>
                          <div className="font-semibold text-stone-800">Room #{hk.roomNumber} - {hk.taskType}</div>
                          <div className="text-[11px] text-stone-500">Staff: {hk.assignedStaffName || 'Unassigned'}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          hk.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {hk.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                  <h3 className="font-serif font-bold text-stone-900 text-sm mb-3">Satvik Bhojan Service</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map(o => (
                      <div key={o.id} className="flex items-center justify-between text-xs p-2.5 bg-stone-50 rounded-xl">
                        <div>
                          <div className="font-semibold text-stone-800">{o.orderNumber} ({o.targetLocation})</div>
                          <div className="text-[11px] text-stone-500">{o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                        </div>
                        <span className="font-bold text-emerald-800">₹{o.totalAmount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: STAFF MANAGEMENT ===================== */}
          {activeTab === 'staff_management' && (
            <div>
              <StaffManagementModule
                currentStaffRole={currentRole}
                currentStaffName={currentStaff.fullName}
                hotelId={activeProperty.id}
                hotelName={activeProperty.name}
              />
            </div>
          )}

          {/* ===================== TAB 3: ROOM MANAGEMENT ===================== */}
          {activeTab === 'room_management' && (
            <RoomInventoryTable
              rooms={rooms}
              isAdmin={isAdmin}
              onAddRoom={handleOpenAddRoom}
              onEditRoom={handleOpenEditRoom}
              onDeleteRoom={handleDeleteRoom}
              onUpdateRoomStatus={handleUpdateRoomStatus}
            />
          )}

          {/* ===================== TAB 4: BOOKING MANAGEMENT ===================== */}
          {activeTab === 'booking_management' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">Reservations & Bookings</h2>
                  <p className="text-xs text-stone-500">Manage check-in, check-out, cancellations and guest stay folios.</p>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Create Reservation
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map(st => (
                    <button
                      key={st}
                      onClick={() => setBookingFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        bookingFilterStatus === st
                          ? 'bg-amber-700 text-white font-semibold'
                          : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      {st} {st !== 'ALL' && `(${bookings.filter(b => b.bookingStatus === st).length})`}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search guest or ref..."
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Booking Ref</th>
                        <th className="py-3 px-4">Guest Details</th>
                        <th className="py-3 px-4">Room</th>
                        <th className="py-3 px-4">Check-In / Out</th>
                        <th className="py-3 px-4">Tariff</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {bookings
                        .filter(b => bookingFilterStatus === 'ALL' || b.bookingStatus === bookingFilterStatus)
                        .filter(
                          b =>
                            bookingSearch === '' ||
                            b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.bookingReference.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                            b.guestPhone.includes(bookingSearch)
                        )
                        .map(b => (
                          <tr key={b.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                              {b.bookingReference}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-stone-900">{b.guestName}</div>
                              <div className="text-[11px] text-stone-500">{b.guestPhone}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-stone-800">#{b.roomNumber}</span>
                              <div className="text-[10px] text-stone-500">{b.roomType}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div>{b.checkInDate}</div>
                              <div className="text-stone-400 text-[10px]">to {b.checkOutDate}</div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-stone-900">
                              ₹{b.totalAmount}
                              {b.pendingAmount > 0 && (
                                <div className="text-[10px] text-amber-700">Due: ₹{b.pendingAmount}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  b.paymentStatus === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : b.paymentStatus === 'PARTIALLY_PAID'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {b.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  b.bookingStatus === 'CHECKED_IN'
                                    ? 'bg-blue-100 text-blue-800'
                                    : b.bookingStatus === 'CONFIRMED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : b.bookingStatus === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-stone-100 text-stone-700'
                                }`}
                              >
                                {b.bookingStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {b.bookingStatus === 'CONFIRMED' && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_IN')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-semibold"
                                  >
                                    Check In
                                  </button>
                                )}
                                {b.bookingStatus === 'CHECKED_IN' && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_OUT')}
                                    className="bg-stone-900 hover:bg-stone-800 text-white px-2.5 py-1 rounded text-xs font-semibold"
                                  >
                                    Check Out
                                  </button>
                                )}
                                {b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'CHECKED_OUT' && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                                    className="text-red-600 hover:text-red-800 text-[11px] font-medium px-2 py-1 rounded hover:bg-red-50"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}

                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-stone-500">
                            <CalendarCheck className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
                            <div className="font-serif font-bold text-stone-700 text-sm">No Reservations Recorded</div>
                            <div className="text-xs text-stone-400 mt-1">
                              Click &ldquo;New Reservation&rdquo; above to create a guest stay.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 5: GUEST MANAGEMENT ===================== */}
          {activeTab === 'guest_management' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">Guest Directory & Devotee Profiles</h2>
                  <p className="text-xs text-stone-500">Track devotee stay records, ID verifications, and special pilgrimage requests.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingGuest(null);
                    setGuestFormData({
                      fullName: '',
                      phone: '',
                      email: '',
                      idProofType: 'Aadhaar Card',
                      idProofNumber: '',
                      city: '',
                      specialRequests: ''
                    });
                    setIsGuestModalOpen(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" /> Add Guest Profile
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search guest by name, phone or city..."
                  value={guestSearch}
                  onChange={e => setGuestSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Guests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guests
                  .filter(
                    g =>
                      guestSearch === '' ||
                      g.fullName.toLowerCase().includes(guestSearch.toLowerCase()) ||
                      g.phone.includes(guestSearch) ||
                      g.city.toLowerCase().includes(guestSearch.toLowerCase())
                  )
                  .map(guest => (
                    <div
                      key={guest.id}
                      className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                              {guest.fullName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-serif font-bold text-sm text-stone-900">{guest.fullName}</h3>
                              <span className="text-[11px] text-stone-500">{guest.city || 'Pilgrim Devotee'}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200/50">
                            {guest.totalStays} Stays
                          </span>
                        </div>

                        <div className="mt-3 space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <span>{guest.phone}</span>
                          </div>
                          {guest.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-stone-400" />
                              <span className="truncate">{guest.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {guest.idProofType}: <span className="font-mono text-stone-700">{guest.idProofNumber}</span>
                            </span>
                          </div>
                        </div>

                        {guest.specialRequests && (
                          <div className="mt-2.5 bg-stone-50 p-2 rounded-lg text-[11px] text-stone-600 italic">
                            &ldquo;{guest.specialRequests}&rdquo;
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-stone-500">
                          Total Spent: <strong className="text-stone-900">₹{guest.totalSpent.toLocaleString()}</strong>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingGuest(guest);
                              setGuestFormData({
                                fullName: guest.fullName,
                                phone: guest.phone,
                                email: guest.email,
                                idProofType: guest.idProofType,
                                idProofNumber: guest.idProofNumber,
                                city: guest.city,
                                specialRequests: guest.specialRequests || ''
                              });
                              setIsGuestModalOpen(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-stone-100 rounded"
                            title="Edit Guest"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {guests.length === 0 && (
                  <div className="col-span-full py-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200/80 p-8">
                    <UserCheck className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
                    <div className="font-serif font-bold text-stone-700 text-sm">No Registered Guests</div>
                    <div className="text-xs text-stone-400 mt-1">Guest profiles are recorded automatically when reservations are made.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== TAB 6: PAYMENTS & BILLING ===================== */}
          {activeTab === 'payments_billing' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">Payments & Invoicing</h2>
                  <p className="text-xs text-stone-500">Generate bills, track transaction modes, refunds, and daily revenue reports.</p>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Record Payment
                </button>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                  <span className="text-xs text-stone-500 font-medium">Total Paid Volume</span>
                  <div className="text-2xl font-bold font-serif text-emerald-800 mt-1">
                    ₹{payments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-stone-500">{payments.length} transactions recorded</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                  <span className="text-xs text-stone-500 font-medium">Pending Guest Balances</span>
                  <div className="text-2xl font-bold font-serif text-amber-800 mt-1">
                    ₹{bookings.reduce((acc, b) => acc + (b.pendingAmount || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-stone-500">Across active reservations</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                  <span className="text-xs text-stone-500 font-medium">Refunds Issued</span>
                  <div className="text-2xl font-bold font-serif text-red-800 mt-1">
                    ₹{payments.reduce((acc, p) => acc + (p.refundAmount || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-stone-500">Processed back to original mode</span>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Guest & Ref</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {payments.map(p => (
                        <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-900">{p.invoiceNumber}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-stone-900">{p.guestName}</div>
                            <div className="text-[10px] text-stone-400 font-mono">{p.bookingReference}</div>
                          </td>
                          <td className="py-3.5 px-4 text-stone-600">{p.date}</td>
                          <td className="py-3.5 px-4 font-medium text-stone-700">{p.paymentMethod}</td>
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            ₹{p.amount.toLocaleString()}
                            <div className="text-[10px] text-stone-400 font-normal">GST: ₹{p.taxAmount}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'PARTIALLY_PAID'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setActiveInvoice(p)}
                                className="text-stone-600 hover:text-amber-800 text-[11px] font-medium flex items-center gap-1"
                              >
                                <Printer className="w-3.5 h-3.5" /> Bill
                              </button>
                              {p.status !== 'REFUNDED' && (
                                <button
                                  onClick={() => {
                                    setRefundTargetPayment(p);
                                    setRefundAmount(p.amount);
                                    setIsRefundModalOpen(true);
                                  }}
                                  className="text-red-600 hover:text-red-800 text-[11px] font-medium"
                                >
                                  Refund
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {payments.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-stone-500">
                            <Receipt className="w-10 h-10 text-stone-300 mx-auto mb-2.5" />
                            <div className="font-serif font-bold text-stone-700 text-sm">No Payments Recorded</div>
                            <div className="text-xs text-stone-400 mt-1">Click &ldquo;Record Payment&rdquo; above to log an invoice or transaction.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 7: HOUSEKEEPING MANAGEMENT ===================== */}
          {activeTab === 'housekeeping_management' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">Housekeeping & Room Sanitation</h2>
                  <p className="text-xs text-stone-500">Assign cleaning staff, monitor room turnaround, and resolve maintenance tickets.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Assign Cleaning
                  </button>
                  <button
                    onClick={() => setIsMaintenanceModalOpen(true)}
                    className="bg-stone-800 hover:bg-stone-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Wrench className="w-4 h-4" /> Maintenance
                  </button>
                </div>
              </div>

              {/* Tasks Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Column 1: Pending */}
                <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-xs text-stone-700">Pending Turnovers</span>
                    <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                      {housekeeping.filter(t => t.status === 'Pending').length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {housekeeping.filter(t => t.status === 'Pending').length === 0 && (
                      <div className="text-[11px] text-stone-400 text-center py-6 bg-white/60 rounded-xl border border-dashed border-stone-200">
                        No pending room turnovers
                      </div>
                    )}
                    {housekeeping
                      .filter(t => t.status === 'Pending')
                      .map(t => (
                        <div key={t.id} className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-xs text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900">Room #{t.roomNumber}</span>
                            <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-semibold">
                              {t.priority}
                            </span>
                          </div>
                          <div className="text-stone-600 font-medium">{t.taskType}</div>
                          <div className="text-[11px] text-stone-500">Staff: {t.assignedStaffName || 'Kailash'}</div>
                          <button
                            onClick={() => handleUpdateTaskStatus(t.id, 'In Progress')}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            Start Cleaning
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Column 2: In Progress */}
                <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-xs text-stone-700">In Progress</span>
                    <span className="bg-blue-200 text-blue-900 px-2 py-0.5 rounded text-[10px] font-bold">
                      {housekeeping.filter(t => t.status === 'In Progress').length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {housekeeping.filter(t => t.status === 'In Progress').length === 0 && (
                      <div className="text-[11px] text-stone-400 text-center py-6 bg-white/60 rounded-xl border border-dashed border-stone-200">
                        No cleaning in progress
                      </div>
                    )}
                    {housekeeping
                      .filter(t => t.status === 'In Progress')
                      .map(t => (
                        <div key={t.id} className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-xs text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-900">Room #{t.roomNumber}</span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
                              Active
                            </span>
                          </div>
                          <div className="text-stone-600 font-medium">{t.taskType}</div>
                          <div className="text-[11px] text-stone-500">Staff: {t.assignedStaffName || 'Kailash'}</div>
                          <button
                            onClick={() => handleUpdateTaskStatus(t.id, 'Completed')}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            Mark Sanitized & Ready
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Column 3: Completed */}
                <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-xs text-stone-700">Inspected & Ready</span>
                    <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold">
                      {housekeeping.filter(t => t.status === 'Completed').length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {housekeeping.filter(t => t.status === 'Completed').length === 0 && (
                      <div className="text-[11px] text-stone-400 text-center py-6 bg-white/60 rounded-xl border border-dashed border-stone-200">
                        No rooms inspected recently
                      </div>
                    )}
                    {housekeeping
                      .filter(t => t.status === 'Completed')
                      .map(t => (
                        <div key={t.id} className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-xs text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-900">Room #{t.roomNumber}</span>
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="text-stone-600">{t.taskType}</div>
                          <div className="text-[10px] text-stone-400">Inspected at {t.updatedAt}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Maintenance Tickets Section */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                <h3 className="font-serif font-bold text-stone-900 text-sm mb-3">Active Maintenance Tickets</h3>
                <div className="space-y-2">
                  {maintenance.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-xs bg-stone-50 rounded-xl border border-dashed border-stone-200">
                      No active maintenance tickets reported. All facilities operating normally.
                    </div>
                  ) : (
                    maintenance.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl text-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-stone-900">Room #{m.roomNumber} • {m.category}</div>
                            <div className="text-stone-600">{m.issue}</div>
                            <div className="text-[10px] text-stone-400 mt-0.5">Reported by {m.reportedBy} on {m.createdAt}</div>
                          </div>
                        </div>
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded text-[10px] font-bold">
                          {m.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 8: RESTAURANT & DINING ===================== */}
          {activeTab === 'restaurant_management' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">Pure Satvik Restaurant & Room Service</h2>
                  <p className="text-xs text-stone-500">Braj Bhojan menu, kitchen order tickets (KOT), and room delivery management.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOrderModalOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Place Food Order
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditingMenuItem(null);
                        setMenuFormData({
                          name: '',
                          category: 'Satvik Thali',
                          price: 250,
                          description: '',
                          isSatvik: true,
                          isAvailable: true
                        });
                        setIsMenuModalOpen(true);
                      }}
                      className="bg-stone-800 hover:bg-stone-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <ChefHat className="w-4 h-4" /> Add Menu Item
                    </button>
                  )}
                </div>
              </div>

              {/* Kitchen Tickets Pipeline */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                <h3 className="font-serif font-bold text-stone-900 text-sm mb-3">Live Kitchen Order Tickets (KOT)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {orders.length === 0 && (
                    <div className="col-span-full py-8 text-center text-stone-400 text-xs bg-stone-50 rounded-xl border border-dashed border-stone-200">
                      No active kitchen orders in queue. Click &ldquo;Place Food Order&rdquo; to send an order to the kitchen.
                    </div>
                  )}
                  {orders.map(o => (
                    <div key={o.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 font-mono">{o.orderNumber}</span>
                        <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded text-[10px]">
                          {o.targetLocation}
                        </span>
                      </div>
                      <div className="text-stone-700 space-y-0.5">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="font-semibold text-stone-800">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                        <span className="font-bold text-stone-900">Total: ₹{o.totalAmount}</span>
                        <select
                          value={o.status}
                          onChange={e => handleUpdateOrderStatus(o.id, e.target.value as any)}
                          className="text-[11px] bg-white border border-stone-300 rounded px-2 py-0.5 font-semibold text-stone-700"
                        >
                          <option value="Received">Received</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Settled">Settled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food Menu Catalog */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
                <h3 className="font-serif font-bold text-stone-900 text-sm mb-3">Satvik Food Menu Catalog</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {menuItems.map(item => (
                    <div key={item.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                          <span className="font-bold text-amber-900">₹{item.price}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/40 inline-block mt-1">
                          100% Satvik Pure Veg
                        </span>
                        <p className="text-stone-600 text-[11px] mt-1.5 leading-relaxed">{item.description}</p>
                      </div>
                      {isAdmin && (
                        <div className="mt-3 pt-2 border-t border-stone-200/60 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingMenuItem(item);
                              setMenuFormData({
                                name: item.name,
                                category: item.category,
                                price: item.price,
                                description: item.description,
                                isSatvik: item.isSatvik,
                                isAvailable: item.isAvailable
                              });
                              setIsMenuModalOpen(true);
                            }}
                            className="text-stone-600 hover:text-amber-800 text-[11px]"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 9: REPORTS & ANALYTICS ===================== */}
          {activeTab === 'reports_analytics' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">Hotel Operational Reports & Analytics</h2>
                  <p className="text-xs text-stone-500">Comprehensive occupancy, revenue vs expense, and staff performance breakdown.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export CSV / Excel
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-stone-800 hover:bg-stone-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> Print Report
                  </button>
                </div>
              </div>

              {/* 3 Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Occupancy Report */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                  <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Bed className="w-4 h-4 text-amber-600" /> Occupancy Report
                  </h3>
                  <div className="text-3xl font-bold font-serif text-stone-900">
                    {reports?.occupancy?.occupancyPercentage || 75}%
                  </div>
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Total Rooms:</span>
                      <strong className="text-stone-900">{reports?.occupancy?.totalRooms || rooms.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Daily Rate (ADR):</span>
                      <strong className="text-stone-900">₹{reports?.occupancy?.averageDailyRate || 2650}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>RevPAR:</span>
                      <strong className="text-emerald-800">₹{reports?.occupancy?.revPAR || 1980}</strong>
                    </div>
                  </div>
                </div>

                {/* Revenue vs Expense Report */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                  <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600" /> Revenue & Margins
                  </h3>
                  <div className="text-3xl font-bold font-serif text-emerald-800">
                    ₹{(reports?.revenueExpenses?.netProfit || 18450).toLocaleString()}
                  </div>
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Gross Collections:</span>
                      <strong className="text-stone-900">₹{(reports?.revenueExpenses?.grossRevenue || 22700).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Operating Provisions:</span>
                      <strong className="text-red-700">₹{(reports?.revenueExpenses?.operatingExpenses || 4250).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Refunds Issued:</span>
                      <strong className="text-stone-700">₹{(reports?.revenueExpenses?.refundsIssued || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Booking & Cancellation Report */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                  <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-blue-600" /> Booking Health
                  </h3>
                  <div className="text-3xl font-bold font-serif text-stone-900">
                    {reports?.bookings?.totalBookings || bookings.length} Bookings
                  </div>
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Checked-In Active:</span>
                      <strong className="text-blue-800">{reports?.bookings?.checkedIn || 2}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancellations:</span>
                      <strong className="text-stone-900">{reports?.bookings?.cancelled || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancellation Rate:</span>
                      <strong className="text-stone-900">{reports?.bookings?.cancellationRate || 0}%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Performance Table */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5">
                <h3 className="font-serif font-bold text-stone-900 text-sm mb-3">Staff Operational Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-100 text-stone-400 font-semibold">
                        <th className="pb-2">Staff Member</th>
                        <th className="pb-2">Department Role</th>
                        <th className="pb-2">Handled Volume</th>
                        <th className="pb-2">Audit Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(reports?.staffPerformance || []).map((sp: any, idx: number) => (
                        <tr key={idx} className="hover:bg-stone-50/60">
                          <td className="py-2.5 font-semibold text-stone-900">{sp.staffName}</td>
                          <td className="py-2.5 text-stone-600">{sp.role}</td>
                          <td className="py-2.5 font-mono text-stone-800">
                            {sp.checkInsHandled || sp.roomsCleaned || sp.ordersFulfilled} Completed
                          </td>
                          <td className="py-2.5 font-bold text-emerald-800">{sp.rating || sp.inspectionScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 10: SETTINGS & SECURITY ===================== */}
          {activeTab === 'settings_security' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
                <h2 className="text-lg font-serif font-bold text-stone-900">Hotel Profile & Security Policies</h2>
                <p className="text-xs text-stone-500">Configure property metadata, tax rules, staff roles, and audit security.</p>
              </div>

              {/* Hotel Settings Form */}
              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
                  Property Identity & Contact
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Hotel Property Name</label>
                    <input
                      type="text"
                      value={hotelSettings?.name || ''}
                      onChange={e => setHotelSettings({ ...hotelSettings, name: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={hotelSettings?.phone || ''}
                      onChange={e => setHotelSettings({ ...hotelSettings, phone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={hotelSettings?.email || ''}
                      onChange={e => setHotelSettings({ ...hotelSettings, email: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Braj Address</label>
                    <input
                      type="text"
                      value={hotelSettings?.address || ''}
                      onChange={e => setHotelSettings({ ...hotelSettings, address: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Check-In Time</label>
                    <input
                      type="text"
                      value={hotelSettings?.checkInTime || '12:00 PM'}
                      onChange={e => setHotelSettings({ ...hotelSettings, checkInTime: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Check-Out Time</label>
                    <input
                      type="text"
                      value={hotelSettings?.checkOutTime || '11:00 AM'}
                      onChange={e => setHotelSettings({ ...hotelSettings, checkOutTime: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    Save Hotel Changes
                  </button>
                </div>
              </form>

              {/* RBAC Matrix Table */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
                <h3 className="font-serif font-bold text-stone-900 text-sm mb-2">
                  Role-Based Access Control (RBAC) Permissions Matrix
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Backend-enforced roles protecting guest data and administrative functions.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
                    <thead className="bg-stone-50 text-stone-700 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="p-3">Role</th>
                        <th className="p-3">Staff Management</th>
                        <th className="p-3">Rooms & Inventory</th>
                        <th className="p-3">Check-In / Out</th>
                        <th className="p-3">Billing & Folio</th>
                        <th className="p-3">Housekeeping</th>
                        <th className="p-3">Restaurant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      <tr>
                        <td className="p-3 font-bold text-amber-900">Admin</td>
                        <td className="p-3 text-emerald-700">Full Access</td>
                        <td className="p-3 text-emerald-700">Full Access</td>
                        <td className="p-3 text-emerald-700">Full Access</td>
                        <td className="p-3 text-emerald-700">Full Access</td>
                        <td className="p-3 text-emerald-700">Full Access</td>
                        <td className="p-3 text-emerald-700">Full Access</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-stone-900">Manager</td>
                        <td className="p-3 text-stone-500">View Directory</td>
                        <td className="p-3 text-emerald-700">Manage</td>
                        <td className="p-3 text-emerald-700">Manage</td>
                        <td className="p-3 text-emerald-700">Manage</td>
                        <td className="p-3 text-emerald-700">Manage</td>
                        <td className="p-3 text-emerald-700">Manage</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-stone-900">Receptionist</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-500">View Status</td>
                        <td className="p-3 text-emerald-700">Active Check-In</td>
                        <td className="p-3 text-stone-500">Create Folio</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-stone-900">Housekeeping</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-500">View Cleanliness</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-emerald-700">Update Cleaning</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-stone-900">Accountant</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-emerald-700">Invoices & Settle</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-stone-900">Restaurant Staff</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-stone-300">Restricted</td>
                        <td className="p-3 text-emerald-700">Orders & KOT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================== MODAL: CREATE / EDIT ROOM ===================== */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {editingRoom ? `Edit Room #${editingRoom.roomNumber}` : 'Add New Room to Inventory'}
              </h3>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 104"
                    value={roomFormData.roomNumber}
                    onChange={e => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Floor Number</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={roomFormData.floor}
                    onChange={e => setRoomFormData({ ...roomFormData, floor: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Room Type</label>
                  <select
                    value={roomFormData.roomType}
                    onChange={e => setRoomFormData({ ...roomFormData, roomType: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="Standard AC">Standard AC</option>
                    <option value="Deluxe AC">Deluxe AC</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Family Pilgrim Suite">Family Pilgrim Suite</option>
                    <option value="Temple View Suite">Temple View Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Bed Type</label>
                  <select
                    value={roomFormData.bedType}
                    onChange={e => setRoomFormData({ ...roomFormData, bedType: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="Twin Bed">Twin Bed</option>
                    <option value="King Bed">King Bed</option>
                    <option value="Grand King Bed">Grand King Bed</option>
                    <option value="2 King Beds">2 King Beds</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Base Price / Night (₹) *</label>
                  <input
                    type="number"
                    required
                    min="500"
                    value={roomFormData.pricePerNight}
                    onChange={e => setRoomFormData({ ...roomFormData, pricePerNight: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Weekend Price (₹)</label>
                  <input
                    type="number"
                    min="500"
                    value={roomFormData.weekendPrice}
                    onChange={e => setRoomFormData({ ...roomFormData, weekendPrice: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Max Capacity (Devotees)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={roomFormData.capacity}
                    onChange={e => setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Initial Status</label>
                  <select
                    value={roomFormData.status}
                    onChange={e => setRoomFormData({ ...roomFormData, status: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Room Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={roomFormData.imageUrl}
                  onChange={e => setRoomFormData({ ...roomFormData, imageUrl: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
                >
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE RESERVATION ===================== */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">Create New Guest Reservation</h3>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radheshyam Aggarwal"
                  value={bookingFormData.guestName}
                  onChange={e => setBookingFormData({ ...bookingFormData, guestName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98..."
                    value={bookingFormData.guestPhone}
                    onChange={e => setBookingFormData({ ...bookingFormData, guestPhone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@gmail.com"
                    value={bookingFormData.guestEmail}
                    onChange={e => setBookingFormData({ ...bookingFormData, guestEmail: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Select Room *</label>
                  <select
                    value={bookingFormData.roomNumber}
                    onChange={e => setBookingFormData({ ...bookingFormData, roomNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.roomNumber}>
                        Room #{r.roomNumber} - {r.roomType} (₹{r.pricePerNight})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Number of Adults</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={bookingFormData.adults}
                    onChange={e => setBookingFormData({ ...bookingFormData, adults: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Check-in Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingFormData.checkInDate}
                    onChange={e => setBookingFormData({ ...bookingFormData, checkInDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Check-out Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingFormData.checkOutDate}
                    onChange={e => setBookingFormData({ ...bookingFormData, checkOutDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Total Stay Amount (₹)</label>
                  <input
                    type="number"
                    value={bookingFormData.totalAmount}
                    onChange={e => setBookingFormData({ ...bookingFormData, totalAmount: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Advance Deposit (₹)</label>
                  <input
                    type="number"
                    value={bookingFormData.advancePaid}
                    onChange={e => setBookingFormData({ ...bookingFormData, advancePaid: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Special Pilgrim Requests</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ground floor for elderly mother, assistance for morning Yamuna Aarti"
                  value={bookingFormData.specialRequests}
                  onChange={e => setBookingFormData({ ...bookingFormData, specialRequests: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: GUEST PROFILE ===================== */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {editingGuest ? 'Edit Guest Profile' : 'Add Devotee Profile'}
              </h3>
              <button
                onClick={() => setIsGuestModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={guestFormData.fullName}
                  onChange={e => setGuestFormData({ ...guestFormData, fullName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={guestFormData.phone}
                    onChange={e => setGuestFormData({ ...guestFormData, phone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City of Origin</label>
                  <input
                    type="text"
                    value={guestFormData.city}
                    onChange={e => setGuestFormData({ ...guestFormData, city: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ID Proof Type</label>
                  <select
                    value={guestFormData.idProofType}
                    onChange={e => setGuestFormData({ ...guestFormData, idProofType: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    value={guestFormData.idProofNumber}
                    onChange={e => setGuestFormData({ ...guestFormData, idProofNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: RECORD PAYMENT ===================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">Record Hotel Payment</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Booking Reference or Folio</label>
                <select
                  value={paymentFormData.bookingReference}
                  onChange={e => {
                    const sel = bookings.find(b => b.bookingReference === e.target.value);
                    setPaymentFormData({
                      ...paymentFormData,
                      bookingReference: e.target.value,
                      guestName: sel?.guestName || paymentFormData.guestName,
                      amount: sel?.pendingAmount || 2400
                    });
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold"
                >
                  <option value="">Select Booking...</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.bookingReference}>
                      {b.bookingReference} - {b.guestName} (Room #{b.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Guest Name</label>
                <input
                  type="text"
                  value={paymentFormData.guestName}
                  onChange={e => setPaymentFormData({ ...paymentFormData, guestName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Amount to Pay (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentFormData.amount}
                    onChange={e => setPaymentFormData({ ...paymentFormData, amount: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Payment Method</label>
                  <select
                    value={paymentFormData.paymentMethod}
                    onChange={e => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl"
                >
                  Record & Issue Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: REFUND ===================== */}
      {isRefundModalOpen && refundTargetPayment && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">Process Refund</h3>
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-3 mt-4 text-xs">
              <p className="text-stone-600">
                Issue refund for invoice <strong>{refundTargetPayment.invoiceNumber}</strong> ({refundTargetPayment.guestName}).
              </p>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  max={refundTargetPayment.amount}
                  min="1"
                  value={refundAmount}
                  onChange={e => setRefundAmount(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Reason for Refund</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-3 py-1.5 border border-stone-200 rounded-xl text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
                >
                  Confirm Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: INVOICE PRINT VIEW ===================== */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-xl border border-stone-200 text-stone-900">
            <div className="flex justify-between items-start border-b border-stone-200 pb-4">
              <div>
                <div className="text-xs font-mono font-bold text-amber-700">BRIJNIDHI PMS TAX INVOICE</div>
                <h2 className="text-xl font-serif font-bold text-stone-900">{activeProperty.name}</h2>
                <p className="text-xs text-stone-500">{activeProperty.address}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-stone-800">{activeInvoice.invoiceNumber}</span>
                <div className="text-xs text-stone-400">{activeInvoice.date}</div>
              </div>
            </div>

            <div className="my-6 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Billed To (Guest):</span>
                <strong className="text-stone-900">{activeInvoice.guestName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Booking Reference:</span>
                <strong className="font-mono text-stone-800">{activeInvoice.bookingReference}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Payment Mode:</span>
                <span className="font-semibold text-emerald-800">{activeInvoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Net Tariff:</span>
                <span>₹{activeInvoice.amount - activeInvoice.taxAmount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">GST (12%):</span>
                <span>₹{activeInvoice.taxAmount}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold border-t-2 border-stone-800">
                <span>Total Paid:</span>
                <span className="text-emerald-800">₹{activeInvoice.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-200 pt-4">
              <button
                onClick={() => setActiveInvoice(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs text-stone-600 hover:bg-stone-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: HOUSEKEEPING TASK ===================== */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">Assign Cleaning Task</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-stone-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignTask} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Room Number</label>
                <select
                  value={taskFormData.roomNumber}
                  onChange={e => setTaskFormData({ ...taskFormData, roomNumber: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.roomNumber}>
                      Room #{r.roomNumber} ({r.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Housekeeping Staff</label>
                <input
                  type="text"
                  value={taskFormData.assignedStaffName}
                  onChange={e => setTaskFormData({ ...taskFormData, assignedStaffName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Task Type</label>
                <select
                  value={taskFormData.taskType}
                  onChange={e => setTaskFormData({ ...taskFormData, taskType: e.target.value as any })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                >
                  <option value="Turnover Cleaning">Turnover Cleaning</option>
                  <option value="Daily Refresh">Daily Refresh</option>
                  <option value="Deep Sanitization">Deep Sanitization</option>
                  <option value="Linens Replacement">Linens Replacement</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3 py-1.5 border border-stone-200 rounded-xl text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: MAINTENANCE TICKET ===================== */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">Log Maintenance Issue</h3>
              <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-stone-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLogMaintenance} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Room Number</label>
                <select
                  value={maintenanceFormData.roomNumber}
                  onChange={e => setMaintenanceFormData({ ...maintenanceFormData, roomNumber: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.roomNumber}>
                      Room #{r.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={maintenanceFormData.category}
                  onChange={e => setMaintenanceFormData({ ...maintenanceFormData, category: e.target.value as any })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Geyser">Geyser / Hot Water</option>
                  <option value="Electrical">Electrical</option>
                  <option value="HVAC/AC">AC / Cooling</option>
                  <option value="Carpentry">Carpentry & Locks</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Issue Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe the maintenance required..."
                  value={maintenanceFormData.issue}
                  onChange={e => setMaintenanceFormData({ ...maintenanceFormData, issue: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                ></textarea>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="px-3 py-1.5 border border-stone-200 rounded-xl text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: MENU ITEM ===================== */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">
                {editingMenuItem ? 'Edit Satvik Dish' : 'Add Satvik Dish to Menu'}
              </h3>
              <button onClick={() => setIsMenuModalOpen(false)} className="text-stone-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMenuItem} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kadhi Kachori"
                  value={menuFormData.name}
                  onChange={e => setMenuFormData({ ...menuFormData, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={menuFormData.category}
                    onChange={e => setMenuFormData({ ...menuFormData, category: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="Satvik Thali">Satvik Thali</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Braj Sweets">Braj Sweets</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={menuFormData.price}
                    onChange={e => setMenuFormData({ ...menuFormData, price: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={menuFormData.description}
                  onChange={e => setMenuFormData({ ...menuFormData, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-900"
                ></textarea>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-3 py-1.5 border border-stone-200 rounded-xl text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: PLACE FOOD ORDER ===================== */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">Place Satvik Bhojan Order</h3>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-stone-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePlaceOrder} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Service Type</label>
                  <select
                    value={orderFormData.orderType}
                    onChange={e => setOrderFormData({ ...orderFormData, orderType: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="Room Service">Room Service</option>
                    <option value="Dine In">Dine In Restaurant</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Room or Table #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 102 or Table 4"
                    value={orderFormData.targetLocation}
                    onChange={e => setOrderFormData({ ...orderFormData, targetLocation: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Satvik Dishes</label>
                <div className="space-y-2 border border-stone-200 rounded-xl p-3 max-h-48 overflow-y-auto bg-stone-50">
                  {menuItems.map(item => {
                    const existing = orderFormData.selectedItems.find(i => i.itemId === item.id);
                    return (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-200/50">
                        <div>
                          <div className="font-medium text-stone-900">{item.name}</div>
                          <div className="text-[10px] text-amber-800 font-bold">₹{item.price}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {existing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  if (existing.quantity > 1) {
                                    setOrderFormData({
                                      ...orderFormData,
                                      selectedItems: orderFormData.selectedItems.map(i =>
                                        i.itemId === item.id ? { ...i, quantity: i.quantity - 1 } : i
                                      )
                                    });
                                  } else {
                                    setOrderFormData({
                                      ...orderFormData,
                                      selectedItems: orderFormData.selectedItems.filter(i => i.itemId !== item.id)
                                    });
                                  }
                                }}
                                className="w-5 h-5 bg-stone-200 rounded text-stone-800 font-bold flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="font-bold text-stone-900">{existing.quantity}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderFormData({
                                    ...orderFormData,
                                    selectedItems: orderFormData.selectedItems.map(i =>
                                      i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
                                    )
                                  });
                                }}
                                className="w-5 h-5 bg-stone-200 rounded text-stone-800 font-bold flex items-center justify-center"
                              >
                                +
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setOrderFormData({
                                  ...orderFormData,
                                  selectedItems: [
                                    ...orderFormData.selectedItems,
                                    { itemId: item.id, name: item.name, quantity: 1, price: item.price }
                                  ]
                                });
                              }}
                              className="px-2 py-0.5 bg-amber-600 text-white rounded text-[11px] font-semibold"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-right text-sm font-bold text-stone-900">
                Order Total: ₹{orderFormData.selectedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-3 py-1.5 border border-stone-200 rounded-xl text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
                >
                  Send to Kitchen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: LOGOUT CONFIRMATION ===================== */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Sign Out of Admin Panel?</h3>
            <p className="text-xs text-stone-500 mt-1 mb-5">
              Your active hotel session will be terminated and logged in security audit history.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          staffId={currentStaff.id}
          staffName={currentStaff.fullName}
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      )}

      {/* Staff Profile Modal */}
      {isProfileModalOpen && (
        <StaffProfileModal
          staff={currentStaff}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdated={updated => {
            setCurrentStaff(updated);
            if (typeof window !== 'undefined') {
              localStorage.setItem('brijnidhi_hotel_admin_staff', JSON.stringify(updated));
            }
          }}
        />
      )}

      {/* Multi-Hotel Property Switcher Modal */}
      {isPropertyModalOpen && (
        <PropertySwitcherModal
          isOpen={isPropertyModalOpen}
          properties={BRAJ_HOTEL_PROPERTIES}
          activePropertyId={activeProperty.id}
          onClose={() => setIsPropertyModalOpen(false)}
          onSelectProperty={newProp => {
            setActivePropertyId(newProp.id);
            if (typeof window !== 'undefined') {
              localStorage.setItem('brijnidhi_pms_active_property_id', newProp.id);
            }
            setIsPropertyModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
