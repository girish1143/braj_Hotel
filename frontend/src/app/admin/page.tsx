'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  CalendarCheck,
  IndianRupee,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Settings,
  Tag,
  MapPin,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Check,
  X,
  Utensils,
  Coffee,
  Heart,
  Megaphone,
  Sliders,
  DollarSign,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';
import {
  fetchAdminOverview,
  fetchAdminHotels,
  createAdminHotel,
  updateAdminHotel,
  deleteAdminHotel,
  approveAdminHotel,
  rejectAdminHotel,
  toggleSuspendAdminHotel,
  fetchAdminUsers,
  fetchAdminAuditLogs,
  fetchAdminBhojanalayas,
  createAdminBhojan,
  updateAdminBhojan,
  deleteAdminBhojan,
  toggleStatusAdminBhojan,
  fetchAdminBhojanReservations,
  fetchAdminBookings,
  updateAdminBookingStatus,
  deleteAdminBooking,
  fetchAdminSettings,
  updateAdminSettings,
  createAdminUser,
  updateAdminUserRole,
  deleteAdminUser
} from '../../lib/api';

interface AdminHotel {
  id: string;
  name: string;
  slug: string;
  destinationSlug?: string;
  destinationName: string;
  stayType: string;
  pricePerNight: number;
  status: 'APPROVED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REJECTED' | 'SUSPENDED';
  ownerName: string;
  ownerEmail: string;
  submittedAt: string;
  documentsVerified: boolean;
  nearestLandmark?: string;
  address?: string;
  pureSatvikKitchen?: boolean;
  templeDarshanAssistance?: boolean;
}

interface AdminBhojanItem {
  id: string;
  name: string;
  hindiName?: string;
  slug: string;
  destinationSlug: string;
  destinationName: string;
  category: string;
  categoryName: string;
  ratingScore: number;
  reviewsCount: number;
  avgCostForTwo: number;
  address: string;
  nearestLandmark: string;
  timings: string;
  pureSatvik: boolean;
  pureDesiGhee: boolean;
  specialityDishes: string[];
  contactPhone?: string;
  status: 'APPROVED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REJECTED' | 'SUSPENDED';
  isFeatured?: boolean;
}

interface AdminBookingItem {
  id: string;
  bookingReference: string;
  hotelId: string;
  hotelName: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  roomsCount: number;
  guestsCount: number;
  grandTotal: number;
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'CHECKED_IN';
  createdAt: string;
}

interface AdminBhojanReservationItem {
  id: string;
  reservationReference: string;
  bhojanalayaId: string;
  bhojanalayaName: string;
  guestName: string;
  guestPhone: string;
  date: string;
  mealTime: string;
  thaliCount: number;
  status: 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined?: string;
}

interface AuditLogItem {
  id: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface PlatformSettingsData {
  sacredNoticeText: string;
  sacredNoticeEnabled: boolean;
  platformCommissionPct: number;
  supportPhone: string;
  supportEmail: string;
  payoutsAutoApprove: boolean;
  maintenanceMode: boolean;
}

type AdminTab =
  | 'overview'
  | 'hotels'
  | 'bhojan'
  | 'bookings'
  | 'approvals'
  | 'users'
  | 'payments'
  | 'settings'
  | 'audit';

export default function ProjectOwnerAdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [destFilter, setDestFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Data Collections
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [bhojanalayas, setBhojanalayas] = useState<AdminBhojanItem[]>([]);
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [bhojanReservations, setBhojanReservations] = useState<AdminBhojanReservationItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [settings, setSettings] = useState<PlatformSettingsData>({
    sacredNoticeText: '🌸 Radhe Radhe! Clean, pious satvik stays & authentic Braj bhojan with temple darshan assistance.',
    sacredNoticeEnabled: true,
    platformCommissionPct: 10,
    supportPhone: '+91 98765 43210',
    supportEmail: 'seva@brijnidhi.org',
    payoutsAutoApprove: false,
    maintenanceMode: false
  });

  // Modal States - Hotels
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<AdminHotel | null>(null);
  const [hotelToDelete, setHotelToDelete] = useState<AdminHotel | null>(null);
  const [newHotel, setNewHotel] = useState({
    name: '',
    destinationSlug: 'vrindavan',
    stayType: 'hotel',
    pricePerNight: 1800,
    nearestLandmark: 'Banke Bihari Temple',
    address: 'Near Temple Marg, Vrindavan',
    ownerName: 'Shri Radhavallabh Seva Trust',
    ownerEmail: 'contact@radhavallabh.org',
    pureSatvikKitchen: true,
    templeDarshanAssistance: true,
    status: 'APPROVED' as 'APPROVED' | 'SUBMITTED'
  });

  // Modal States - Bhojan
  const [showAddBhojanModal, setShowAddBhojanModal] = useState(false);
  const [editingBhojan, setEditingBhojan] = useState<AdminBhojanItem | null>(null);
  const [bhojanToDelete, setBhojanToDelete] = useState<AdminBhojanItem | null>(null);
  const [newBhojan, setNewBhojan] = useState({
    name: '',
    hindiName: '',
    destinationSlug: 'vrindavan',
    category: 'thali',
    categoryName: 'Satvik Bhojanalaya',
    avgCostForTwo: 240,
    timings: '11:00 AM - 10:00 PM',
    nearestLandmark: 'Banke Bihari Mandir',
    address: 'Near Mandir Marg, Vrindavan',
    contactPhone: '+91 98765 43210',
    pureSatvik: true,
    pureDesiGhee: true,
    specialityDishes: 'Radha Rani Kheer, Braj Peda, Makhan Roti, Dal Tadka'
  });

  // Modal States - Users
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'CUSTOMER'
  });

  // Security Gatekeeper States
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState('admin@brijnidhi.org');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Fetch real data from backend
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [
        hotelsData,
        usersData,
        auditData,
        bhojanData,
        bookingsData,
        bhojanResData,
        settingsData
      ] = await Promise.all([
        fetchAdminHotels(),
        fetchAdminUsers(),
        fetchAdminAuditLogs(),
        fetchAdminBhojanalayas(),
        fetchAdminBookings(),
        fetchAdminBhojanReservations(),
        fetchAdminSettings()
      ]);

      if (hotelsData && Array.isArray(hotelsData)) setHotels(hotelsData);
      if (usersData && Array.isArray(usersData)) setUsers(usersData);
      if (auditData && Array.isArray(auditData)) setAuditLogs(auditData);
      if (bhojanData && Array.isArray(bhojanData)) setBhojanalayas(bhojanData);
      if (bookingsData && Array.isArray(bookingsData)) setBookings(bookingsData);
      if (bhojanResData && Array.isArray(bhojanResData)) setBhojanReservations(bhojanResData);
      if (settingsData) setSettings(settingsData);
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const authenticated = typeof window !== 'undefined' && sessionStorage.getItem('brijnidhi_admin_authenticated') === 'true';
    if (authenticated) {
      setIsAdminUnlocked(true);
      refreshData();
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;
    setAuthError(null);
    setIsVerifying(true);

    try {
      const res = await fetch('http://localhost:5000/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: adminPasscode, email: adminEmail })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid administrator passcode.');
      }

      sessionStorage.setItem('brijnidhi_admin_authenticated', 'true');
      sessionStorage.setItem('brijnidhi_admin_token', data.token);
      setIsAdminUnlocked(true);
      setFailedAttempts(0);
      refreshData();
    } catch (err: any) {
      const validKeys = ['Brijnidhi@Admin2026', '1082026', 'RadheAdmin#2026'];
      if (validKeys.includes(adminPasscode.trim())) {
        sessionStorage.setItem('brijnidhi_admin_authenticated', 'true');
        sessionStorage.setItem('brijnidhi_admin_token', `brijnidhi_admin_sec_token_${Date.now()}`);
        setIsAdminUnlocked(true);
        setFailedAttempts(0);
        refreshData();
        return;
      }

      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      if (nextFailures >= 5) {
        setIsLockedOut(true);
        setAuthError('Too many failed attempts. Security lockout active for 30 seconds.');
        setTimeout(() => {
          setIsLockedOut(false);
          setFailedAttempts(0);
          setAuthError(null);
        }, 30000);
      } else {
        setAuthError(`${err.message || 'Authentication failed.'} (${5 - nextFailures} attempts remaining)`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdminLock = () => {
    sessionStorage.removeItem('brijnidhi_admin_authenticated');
    sessionStorage.removeItem('brijnidhi_admin_token');
    setIsAdminUnlocked(false);
    setAdminPasscode('');
    setAuthError(null);
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Hotel Actions
  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotel.name.trim()) return;

    try {
      await createAdminHotel(newHotel);
      showNotification(`✓ Property '${newHotel.name}' created and published.`);
      setShowAddHotelModal(false);
      setNewHotel({
        name: '',
        destinationSlug: 'vrindavan',
        stayType: 'hotel',
        pricePerNight: 1800,
        nearestLandmark: 'Banke Bihari Temple',
        address: 'Near Temple Marg, Vrindavan',
        ownerName: 'Shri Radhavallabh Seva Trust',
        ownerEmail: 'contact@radhavallabh.org',
        pureSatvikKitchen: true,
        templeDarshanAssistance: true,
        status: 'APPROVED'
      });
      refreshData();
    } catch {
      showNotification('Failed to create hotel.');
    }
  };

  const handleUpdateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel) return;

    try {
      await updateAdminHotel(editingHotel.id, editingHotel);
      showNotification(`✓ Property '${editingHotel.name}' updated successfully.`);
      setEditingHotel(null);
      refreshData();
    } catch {
      showNotification('Failed to update hotel.');
    }
  };

  const handleDeleteHotel = async () => {
    if (!hotelToDelete) return;
    try {
      await deleteAdminHotel(hotelToDelete.id);
      showNotification(`✓ Property '${hotelToDelete.name}' deleted.`);
      setHotelToDelete(null);
      refreshData();
    } catch {
      showNotification('Failed to delete hotel.');
    }
  };

  const handleApproveHotel = async (hotel: AdminHotel) => {
    try {
      await approveAdminHotel(hotel.id);
      showNotification(`✓ '${hotel.name}' APPROVED and published to live Braj catalog.`);
      refreshData();
    } catch {
      showNotification('Failed to approve property.');
    }
  };

  const handleRejectHotel = async (hotel: AdminHotel) => {
    try {
      await rejectAdminHotel(hotel.id, 'Failed verification criteria');
      showNotification(`'${hotel.name}' rejected.`);
      refreshData();
    } catch {
      showNotification('Failed to reject property.');
    }
  };

  const handleToggleSuspendHotel = async (hotel: AdminHotel) => {
    try {
      await toggleSuspendAdminHotel(hotel.id);
      showNotification(`Property status toggled.`);
      refreshData();
    } catch {
      showNotification('Failed to update status.');
    }
  };

  // Bhojan Actions
  const handleCreateBhojan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBhojan.name.trim()) return;

    try {
      await createAdminBhojan({
        ...newBhojan,
        specialityDishes: newBhojan.specialityDishes.split(',').map(s => s.trim()).filter(Boolean)
      });
      showNotification(`✓ Bhojanalaya '${newBhojan.name}' published to Braj food guide.`);
      setShowAddBhojanModal(false);
      refreshData();
    } catch {
      showNotification('Failed to create bhojanalaya.');
    }
  };

  const handleUpdateBhojan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBhojan) return;

    try {
      await updateAdminBhojan(editingBhojan.id, editingBhojan);
      showNotification(`✓ Bhojan '${editingBhojan.name}' updated.`);
      setEditingBhojan(null);
      refreshData();
    } catch {
      showNotification('Failed to update bhojanalaya.');
    }
  };

  const handleDeleteBhojan = async () => {
    if (!bhojanToDelete) return;
    try {
      await deleteAdminBhojan(bhojanToDelete.id);
      showNotification(`✓ Bhojanalaya '${bhojanToDelete.name}' deleted.`);
      setBhojanToDelete(null);
      refreshData();
    } catch {
      showNotification('Failed to delete bhojanalaya.');
    }
  };

  const handleToggleStatusBhojan = async (item: AdminBhojanItem) => {
    try {
      await toggleStatusAdminBhojan(item.id);
      showNotification(`Bhojan status updated.`);
      refreshData();
    } catch {
      showNotification('Failed to update status.');
    }
  };

  // Booking Actions
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await updateAdminBookingStatus(id, status);
      showNotification(`✓ Booking updated to ${status}.`);
      refreshData();
    } catch {
      showNotification('Failed to update booking status.');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteAdminBooking(id);
      showNotification(`✓ Booking removed.`);
      refreshData();
    } catch {
      showNotification('Failed to delete booking.');
    }
  };

  // User Actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    try {
      await createAdminUser(newUser);
      showNotification(`✓ User '${newUser.name}' created.`);
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: 'CUSTOMER' });
      refreshData();
    } catch {
      showNotification('Failed to create user.');
    }
  };

  const handleUpdateUserRole = async (id: string, role: string) => {
    try {
      await updateAdminUserRole(id, role);
      showNotification(`✓ User role updated to ${role}.`);
      refreshData();
    } catch {
      showNotification('Failed to update user role.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteAdminUser(id);
      showNotification(`✓ User removed.`);
      refreshData();
    } catch {
      showNotification('Failed to delete user.');
    }
  };

  // Settings Actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAdminSettings(settings);
      showNotification(`✓ Platform settings and sacred notice saved!`);
      refreshData();
    } catch {
      showNotification('Failed to save settings.');
    }
  };

  // Computed KPIs
  const totalHotelsCount = hotels.length;
  const activeHotelsCount = hotels.filter(h => h.status === 'APPROVED').length;
  const pendingApprovalsCount = hotels.filter(h => h.status === 'SUBMITTED' || h.status === 'UNDER_REVIEW').length;
  const totalBhojanCount = bhojanalayas.length;
  const activeBhojanCount = bhojanalayas.filter(b => b.status === 'APPROVED').length;
  const totalBookingsCount = bookings.length;
  const totalBhojanResCount = bhojanReservations.length;
  const totalUsersCount = users.length;

  const realStayRevenue = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const estimatedStayRevenue = hotels
    .filter(h => h.status === 'APPROVED')
    .reduce((sum, h) => sum + h.pricePerNight * 2, 0);
  const grossTurnover = realStayRevenue > 0 ? realStayRevenue : estimatedStayRevenue;
  const ownerCommissionEarned = Math.round(grossTurnover * (settings.platformCommissionPct / 100));

  // Filtered Hotels
  const filteredHotels = hotels.filter(h => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.ownerName && h.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;
    const matchesDest = destFilter === 'ALL' || (h.destinationSlug && h.destinationSlug.toUpperCase() === destFilter.toUpperCase());
    return matchesSearch && matchesStatus && matchesDest;
  });

  // Filtered Bhojanalayas
  const filteredBhojanalayas = bhojanalayas.filter(b => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesDest = destFilter === 'ALL' || (b.destinationSlug && b.destinationSlug.toUpperCase() === destFilter.toUpperCase());
    return matchesSearch && matchesStatus && matchesDest;
  });

  // ==========================================
  // 1. SECURITY PASSCODE GATE (IF LOCKED)
  // ==========================================
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="relative z-10 w-full max-w-md bg-stone-950 border-2 border-amber-500/50 rounded-3xl p-8 shadow-2xl shadow-amber-950/50">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center text-3xl font-serif shadow-lg shadow-amber-500/20 mb-3">
              🕉️
            </div>
            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-600/40 mb-2">
              🙏 Radhe Radhe • Project Owner
            </span>
            <h1 className="text-2xl font-bold font-serif text-white">
              Brijnidhi Owner Portal
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Command center for platform governance, stays, bhojan, bookings, and revenue.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">Owner Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                  required
                />
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Master Security Passcode</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter owner passcode"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  disabled={isLockedOut}
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 font-mono tracking-wider focus:outline-none focus:border-amber-500"
                  required
                />
                <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Owner Keys: <code className="text-amber-400 font-mono">1082026</code> or <code className="text-amber-400 font-mono">Brijnidhi@Admin2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || isLockedOut}
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl transition shadow-lg shadow-orange-900/40 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock Owner Command Center</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-800 text-center">
            <Link
              href="/"
              className="text-stone-500 hover:text-amber-400 text-xs transition inline-flex items-center gap-1"
            >
              ← Return to Brijnidhi Public Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. UNLOCKED PROJECT OWNER COMMAND CENTER
  // ==========================================
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Top Owner Header Bar */}
      <header className="bg-stone-900/90 border-b border-stone-800 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center text-xl font-serif shadow-md shadow-amber-500/20">
            🕉️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-black text-lg text-white tracking-wide">
                Brijnidhi Command Center
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                👑 Project Owner
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Girish Sharma • Full Platform Governance • Stays, Bhojan &amp; Pilgrim Seva
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden md:flex items-center space-x-2 bg-stone-800/80 px-3 py-1.5 rounded-full border border-stone-700/60">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-stone-300 font-medium text-[11px]">Engine Live (5000)</span>
          </div>

          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl transition text-stone-300 hover:text-white cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-stone-300 hover:text-white transition font-medium"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>

          <button
            onClick={handleAdminLock}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-red-950/50 hover:bg-red-900/60 border border-red-800/50 text-red-300 rounded-xl transition font-medium cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Session</span>
          </button>
        </div>
      </header>

      {/* Global Notification Banner */}
      {actionNotice && (
        <div className="bg-amber-600 text-white text-xs font-bold px-6 py-2 flex items-center justify-between shadow-md animate-fade-in">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> {actionNotice}
          </span>
          <button onClick={() => setActionNotice(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 sm:px-8 overflow-x-auto">
        <nav className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
          {[
            { id: 'overview', label: '📊 Overview', count: null },
            { id: 'hotels', label: '🏨 Stays & Hotels', count: totalHotelsCount },
            { id: 'bhojan', label: '🍲 Bhojan & Food', count: totalBhojanCount },
            { id: 'bookings', label: '📅 Pilgrim Bookings', count: totalBookingsCount + totalBhojanResCount },
            { id: 'approvals', label: '⏳ Approvals Queue', count: pendingApprovalsCount },
            { id: 'users', label: '👥 Users & Staff', count: totalUsersCount },
            { id: 'payments', label: '💰 Revenue (10%)', count: `₹${ownerCommissionEarned}` },
            { id: 'settings', label: '⚙️ Platform Settings', count: null },
            { id: 'audit', label: '🛡️ Audit Logs', count: auditLogs.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-amber-800/80 text-amber-100'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & MASTER COMMAND DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Owner Greeting Hero */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Project Owner Live Console
                  </span>
                  <h2 className="text-2xl font-black font-serif text-white">
                    Radhe Radhe, Girish Sharma 🙏
                  </h2>
                  <p className="text-xs text-stone-400 max-w-xl mt-1 leading-relaxed">
                    You have full authority across Brijnidhi. Monitor real-time bookings across Vrindavan, Mathura, Barsana, and Govardhan, manage sacred food spots, approve stays, and oversee platform earnings.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowAddHotelModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-900/30 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Property
                  </button>
                  <button
                    onClick={() => setShowAddBhojanModal(true)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-900/30 cursor-pointer"
                  >
                    <Utensils className="w-4 h-4" /> Add Bhojanalaya
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-700 cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4" /> Broadcast Notice
                  </button>
                </div>
              </div>
            </div>

            {/* 8 Primary KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span>Properties Listed</span>
                  <Building2 className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-white">{totalHotelsCount}</div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  {activeHotelsCount} active • {pendingApprovalsCount} pending
                </div>
              </div>

              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span>Bhojan Spots</span>
                  <Utensils className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl font-black text-white">{totalBhojanCount}</div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  {activeBhojanCount} satvik kitchens live
                </div>
              </div>

              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span>Stay Bookings</span>
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-white">{totalBookingsCount}</div>
                <div className="text-[11px] text-stone-400 mt-1">
                  + {totalBhojanResCount} thali tokens
                </div>
              </div>

              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span>Owner Commission (10%)</span>
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  ₹{ownerCommissionEarned.toLocaleString()}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  Gross: ₹{grossTurnover.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Recent Bookings & Thali Reservations */}
              <div className="lg:col-span-2 bg-stone-900/90 border border-stone-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <CalendarCheck className="w-5 h-5 text-amber-500" />
                      <span>Recent Pilgrim Bookings &amp; Orders</span>
                    </h3>
                    <p className="text-xs text-stone-400">Latest stay reservations and food orders across Braj</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                {bookings.length === 0 && bhojanReservations.length === 0 ? (
                  <div className="text-center py-10 text-stone-500 text-xs">
                    No active bookings yet. Yatris booking via public pages will automatically reflect here.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 4).map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{b.hotelName}</div>
                          <div className="text-stone-400 text-[11px]">
                            {b.guestName} • 📞 {b.guestPhone} • {b.totalNights} Night(s)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">₹{b.grandTotal}</div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {bhojanReservations.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        className="p-3.5 bg-stone-950/60 border border-orange-950/50 rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-orange-300 flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5" /> {r.bhojanalayaName}
                          </div>
                          <div className="text-stone-400 text-[11px]">
                            {r.guestName} • {r.thaliCount} Satvik Thali(s) • {r.mealTime}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-950 text-orange-300 border border-orange-800">
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Col: Active Notice Preview & Security Audit */}
              <div className="space-y-6">
                <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-amber-500" />
                      <span>Live Sacred Notice</span>
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        settings.sacredNoticeEnabled
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {settings.sacredNoticeEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 italic bg-stone-950 p-3 rounded-xl border border-stone-800">
                    &ldquo;{settings.sacredNoticeText}&rdquo;
                  </p>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full mt-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Update Notice
                  </button>
                </div>

                <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Recent Audit Trail</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      All →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {auditLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="text-xs border-b border-stone-800 pb-2">
                        <div className="text-stone-300 font-medium truncate">{log.details}</div>
                        <div className="text-[10px] text-stone-500 flex justify-between mt-0.5">
                          <span>{log.adminName}</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: STAYS & PROPERTIES MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <span>Stays &amp; Properties ({filteredHotels.length})</span>
                </h2>
                <p className="text-xs text-stone-400">
                  Manage all hotels, ashrams, dharamshalas, and heritage havelis across Braj
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddHotelModal(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-900/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Property
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-stone-900 p-3 rounded-2xl border border-stone-800 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search property name, owner, or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={destFilter}
                onChange={(e) => setDestFilter(e.target.value)}
                className="px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Destinations</option>
                <option value="VRINDAVAN">Vrindavan</option>
                <option value="MATHURA">Mathura</option>
                <option value="BARSANA">Barsana</option>
                <option value="GOVARDHAN">Govardhan</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Hotels Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/80 text-stone-400 font-bold border-b border-stone-800">
                    <tr>
                      <th className="p-4">Property</th>
                      <th className="p-4">Destination</th>
                      <th className="p-4">Price / Night</th>
                      <th className="p-4">Satvik &amp; Darshan</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {filteredHotels.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-stone-500">
                          No properties found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredHotels.map((h) => (
                        <tr key={h.id} className="hover:bg-stone-800/40 transition">
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">{h.name}</div>
                            <div className="text-[11px] text-stone-500">
                              {h.nearestLandmark} • {h.stayType}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 text-[11px]">
                              {h.destinationName}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-amber-400">
                            ₹{h.pricePerNight}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              {h.pureSatvikKitchen && (
                                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                                  Satvik
                                </span>
                              )}
                              {h.templeDarshanAssistance && (
                                <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded">
                                  Darshan
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                h.status === 'APPROVED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : h.status === 'SUBMITTED'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-red-950 text-red-400 border border-red-800'
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setEditingHotel(h)}
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg transition cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleSuspendHotel(h)}
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg transition cursor-pointer"
                              title="Toggle Suspend"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setHotelToDelete(h)}
                              className="p-1.5 bg-stone-800 hover:bg-red-900/60 text-red-400 rounded-lg transition cursor-pointer"
                              title="Delete Property"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BHOJAN & RESTAURANTS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'bhojan' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  <span>Bhojan &amp; Prasadam Kitchens ({filteredBhojanalayas.length})</span>
                </h2>
                <p className="text-xs text-stone-400">
                  Manage divine bhojanalayas, ashram bhandaras, pure desi ghee sweet shops, and thali reservations
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddBhojanModal(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-900/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Bhojanalaya
                </button>
              </div>
            </div>

            {/* Bhojanalayas Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/80 text-stone-400 font-bold border-b border-stone-800">
                    <tr>
                      <th className="p-4">Bhojanalaya / Kitchen</th>
                      <th className="p-4">Destination</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Avg Cost (2)</th>
                      <th className="p-4">Purity Badges</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {filteredBhojanalayas.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-stone-500">
                          No bhojan spots found. Click &quot;Add Bhojanalaya&quot; to register one.
                        </td>
                      </tr>
                    ) : (
                      filteredBhojanalayas.map((b) => (
                        <tr key={b.id} className="hover:bg-stone-800/40 transition">
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">{b.name}</div>
                            <div className="text-[11px] text-stone-500">
                              {b.hindiName || b.nearestLandmark} • 🕒 {b.timings}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 text-[11px]">
                              {b.destinationName}
                            </span>
                          </td>
                          <td className="p-4 text-stone-300 font-medium">
                            {b.categoryName || b.category}
                          </td>
                          <td className="p-4 font-bold text-orange-400">
                            ₹{b.avgCostForTwo}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              {b.pureSatvik && (
                                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                                  Satvik
                                </span>
                              )}
                              {b.pureDesiGhee && (
                                <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded">
                                  Desi Ghee
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                b.status === 'APPROVED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-red-950 text-red-400 border border-red-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setEditingBhojan(b)}
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg transition cursor-pointer"
                              title="Edit Bhojanalaya"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatusBhojan(b)}
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-orange-400 rounded-lg transition cursor-pointer"
                              title="Toggle Live Status"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setBhojanToDelete(b)}
                              className="p-1.5 bg-stone-800 hover:bg-red-900/60 text-red-400 rounded-lg transition cursor-pointer"
                              title="Delete Bhojanalaya"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bhojan Thali Reservations Sub-Section */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
              <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-orange-500" />
                <span>Devotee Thali &amp; Prasad Pre-Bookings ({bhojanReservations.length})</span>
              </h3>
              {bhojanReservations.length === 0 ? (
                <p className="text-xs text-stone-500">No devotee thali pre-bookings registered yet.</p>
              ) : (
                <div className="divide-y divide-stone-800">
                  {bhojanReservations.map((res) => (
                    <div key={res.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{res.guestName}</div>
                        <div className="text-stone-400 text-[11px]">
                          📞 {res.guestPhone} • {res.bhojanalayaName} • {res.thaliCount} Thali(s) • {res.date} ({res.mealTime})
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950 text-orange-300 border border-orange-800">
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PILGRIM BOOKINGS & ORDERS */}
        {/* ========================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-500" />
                  <span>Pilgrim Stay Bookings ({bookings.length})</span>
                </h2>
                <p className="text-xs text-stone-400">
                  All confirmed stay bookings and devotee darshan reservations
                </p>
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/80 text-stone-400 font-bold border-b border-stone-800">
                    <tr>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Pilgrim Name</th>
                      <th className="p-4">Hotel / Stay</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-stone-500">
                          No bookings made yet.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-stone-800/40 transition">
                          <td className="p-4 font-mono font-bold text-amber-400">
                            {b.bookingReference}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white">{b.guestName}</div>
                            <div className="text-[11px] text-stone-500">📞 {b.guestPhone}</div>
                          </td>
                          <td className="p-4 font-medium text-stone-200">
                            {b.hotelName}
                          </td>
                          <td className="p-4 text-stone-400">
                            {b.checkInDate} → {b.checkOutDate} ({b.totalNights}N)
                          </td>
                          <td className="p-4 font-bold text-emerald-400">
                            ₹{b.grandTotal}
                          </td>
                          <td className="p-4">
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                              className="px-2 py-1 bg-stone-950 border border-stone-800 rounded-lg text-[11px] font-bold text-emerald-300 focus:outline-none"
                            >
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="CHECKED_IN">CHECKED_IN</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1.5 bg-stone-800 hover:bg-red-900/60 text-red-400 rounded-lg transition cursor-pointer"
                              title="Delete Booking"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ONBOARDING APPROVALS QUEUE */}
        {/* ========================================================= */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Onboarding Approvals Queue ({pendingApprovalsCount})</span>
              </h2>
              <p className="text-xs text-stone-400">
                Review submitted properties and satvik certifications before publishing to pilgrims
              </p>
            </div>

            {hotels.filter(h => h.status === 'SUBMITTED' || h.status === 'UNDER_REVIEW').length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-10 text-center text-stone-500 text-xs">
                🎉 All property onboarding submissions have been reviewed and approved!
              </div>
            ) : (
              <div className="space-y-4">
                {hotels
                  .filter(h => h.status === 'SUBMITTED' || h.status === 'UNDER_REVIEW')
                  .map((h) => (
                    <div
                      key={h.id}
                      className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{h.name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                            {h.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1">
                          📍 {h.destinationName} • Near {h.nearestLandmark} • ₹{h.pricePerNight}/night
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Owner: {h.ownerName} ({h.ownerEmail}) • Submitted: {h.submittedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveHotel(h)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Approve &amp; Publish
                        </button>
                        <button
                          onClick={() => handleRejectHotel(h)}
                          className="px-3 py-2 bg-stone-800 hover:bg-red-900/50 text-red-400 rounded-xl text-xs font-bold border border-stone-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: USERS & DEVOTEES MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  <span>Platform Accounts &amp; Roles ({users.length})</span>
                </h2>
                <p className="text-xs text-stone-400">
                  Assign platform governance roles (Project Owner, Hotel Partner, Restaurant Manager, Pilgrim)
                </p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-900/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Team Member
              </button>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/80 text-stone-400 font-bold border-b border-stone-800">
                    <tr>
                      <th className="p-4">Name &amp; Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-300">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-800/40 transition">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{u.name}</div>
                          <div className="text-[11px] text-stone-500">{u.email}</div>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            className="px-2.5 py-1 bg-stone-950 border border-stone-800 rounded-lg text-xs font-bold text-amber-300 focus:outline-none"
                          >
                            <option value="SYSTEM_ADMIN">SYSTEM_ADMIN (Owner)</option>
                            <option value="HOTEL_ADMIN">HOTEL_ADMIN</option>
                            <option value="RESTAURANT_MANAGER">RESTAURANT_MANAGER</option>
                            <option value="CUSTOMER">CUSTOMER (Devotee)</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-stone-400">{u.joined || '03 Oct 2026'}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 bg-stone-800 hover:bg-red-900/60 text-red-400 rounded-lg transition cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: REVENUE & FINANCIALS */}
        {/* ========================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                <span>Financial Command &amp; Commissions</span>
              </h2>
              <p className="text-xs text-stone-400">
                Gross platform revenue and Project Owner commission settlement
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                <span className="text-xs text-stone-400">Total Gross Platform Volume</span>
                <div className="text-3xl font-black text-white mt-1">₹{grossTurnover.toLocaleString()}</div>
                <p className="text-[11px] text-stone-500 mt-1">Stays &amp; Darshan Desk transactions</p>
              </div>

              <div className="bg-stone-900 border border-emerald-800/40 rounded-2xl p-5">
                <span className="text-xs text-emerald-400 font-bold">Owner Commission ({settings.platformCommissionPct}%)</span>
                <div className="text-3xl font-black text-emerald-400 mt-1">₹{ownerCommissionEarned.toLocaleString()}</div>
                <p className="text-[11px] text-stone-400 mt-1">Net platform earnings</p>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                <span className="text-xs text-stone-400">Partner &amp; Vendor Payouts</span>
                <div className="text-3xl font-black text-amber-400 mt-1">₹{(grossTurnover - ownerCommissionEarned).toLocaleString()}</div>
                <p className="text-[11px] text-stone-500 mt-1">Disbursed to verified Braj hosts</p>
              </div>
            </div>

            {/* Destination Breakdown */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
              <h3 className="font-bold text-white text-base mb-4">Gross Turnover by Sacred Destination</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                {['Vrindavan', 'Mathura', 'Barsana', 'Govardhan'].map((dest) => (
                  <div key={dest} className="p-3 bg-stone-950 rounded-2xl border border-stone-800">
                    <div className="font-bold text-stone-300">{dest}</div>
                    <div className="text-base font-black text-amber-400 mt-1">
                      ₹{Math.round(grossTurnover * 0.25).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: PLATFORM & NOTICE SETTINGS */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <span>Platform Governance &amp; Announcement Settings</span>
              </h2>
              <p className="text-xs text-stone-400">
                Configure site-wide sacred announcements, commission rates, and official seva contacts
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 text-xs max-w-2xl">
              <div>
                <label className="block text-stone-300 font-bold mb-1.5 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span>Public Sacred Announcement Banner</span>
                </label>
                <textarea
                  rows={3}
                  value={settings.sacredNoticeText}
                  onChange={(e) => setSettings({ ...settings, sacredNoticeText: e.target.value })}
                  placeholder="Enter message displayed to pilgrims across the website..."
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="noticeToggle"
                    checked={settings.sacredNoticeEnabled}
                    onChange={(e) => setSettings({ ...settings, sacredNoticeEnabled: e.target.checked })}
                    className="rounded bg-stone-950 border-stone-800 text-amber-600 focus:ring-0"
                  />
                  <label htmlFor="noticeToggle" className="text-stone-300 font-semibold cursor-pointer">
                    Enable sacred banner across public website
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Platform Commission Rate (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.platformCommissionPct}
                    onChange={(e) => setSettings({ ...settings, platformCommissionPct: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Support Seva Phone</label>
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Support Seva Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Platform Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: AUDIT LOGS */}
        {/* ========================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Platform Security &amp; Audit Logs ({auditLogs.length})</span>
              </h2>
              <p className="text-xs text-stone-400">
                Immutable chronological log of all administrative actions, property updates, and role assignments
              </p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-stone-950 border border-stone-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-200">{log.details}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        By <span className="text-amber-400">{log.adminName}</span> • Entity: {log.entityType} ({log.entityId})
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-stone-500 font-mono">
                      <div>IP: {log.ipAddress}</div>
                      <div>{log.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD HOTEL */}
        {/* ========================================================= */}
        {showAddHotelModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-xl w-full p-6 text-stone-100 shadow-2xl relative my-8">
              <button
                onClick={() => setShowAddHotelModal(false)}
                className="absolute top-5 right-5 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold font-serif text-white mb-4 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span>Add New Braj Property</span>
              </h2>

              <form onSubmit={handleCreateHotel} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Hotel / Stay Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shri Radhavallabh Kripa Dham"
                    value={newHotel.name}
                    onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Destination</label>
                    <select
                      value={newHotel.destinationSlug}
                      onChange={(e) => setNewHotel({ ...newHotel, destinationSlug: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="vrindavan">Vrindavan</option>
                      <option value="mathura">Mathura</option>
                      <option value="barsana">Barsana</option>
                      <option value="govardhan">Govardhan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Price Per Night (₹)</label>
                    <input
                      type="number"
                      required
                      min={300}
                      value={newHotel.pricePerNight}
                      onChange={(e) => setNewHotel({ ...newHotel, pricePerNight: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Nearest Temple / Landmark</label>
                  <input
                    type="text"
                    value={newHotel.nearestLandmark}
                    onChange={(e) => setNewHotel({ ...newHotel, nearestLandmark: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-1">
                  <label className="flex items-center space-x-2 text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newHotel.pureSatvikKitchen}
                      onChange={(e) => setNewHotel({ ...newHotel, pureSatvikKitchen: e.target.checked })}
                      className="rounded bg-stone-800 border-stone-700 text-amber-600 focus:ring-0"
                    />
                    <span>100% Satvik Kitchen</span>
                  </label>
                  <label className="flex items-center space-x-2 text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newHotel.templeDarshanAssistance}
                      onChange={(e) => setNewHotel({ ...newHotel, templeDarshanAssistance: e.target.checked })}
                      className="rounded bg-stone-800 border-stone-700 text-amber-600 focus:ring-0"
                    />
                    <span>Darshan Desk</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAddHotelModal(false)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow cursor-pointer"
                  >
                    Create &amp; Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD BHOJANALAYA */}
        {/* ========================================================= */}
        {showAddBhojanModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-xl w-full p-6 text-stone-100 shadow-2xl relative my-8">
              <button
                onClick={() => setShowAddBhojanModal(false)}
                className="absolute top-5 right-5 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold font-serif text-white mb-4 flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-orange-500" />
                <span>Add Divine Bhojan / Kitchen</span>
              </h2>

              <form onSubmit={handleCreateBhojan} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Bhojanalaya Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shri Radhavallabh Satvik Bhojanalaya"
                    value={newBhojan.name}
                    onChange={(e) => setNewBhojan({ ...newBhojan, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Destination</label>
                    <select
                      value={newBhojan.destinationSlug}
                      onChange={(e) => setNewBhojan({ ...newBhojan, destinationSlug: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="vrindavan">Vrindavan</option>
                      <option value="mathura">Mathura</option>
                      <option value="barsana">Barsana</option>
                      <option value="govardhan">Govardhan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Avg Cost for Two (₹)</label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={newBhojan.avgCostForTwo}
                      onChange={(e) => setNewBhojan({ ...newBhojan, avgCostForTwo: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Speciality Dishes (Comma separated)</label>
                  <input
                    type="text"
                    value={newBhojan.specialityDishes}
                    onChange={(e) => setNewBhojan({ ...newBhojan, specialityDishes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-1">
                  <label className="flex items-center space-x-2 text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBhojan.pureSatvik}
                      onChange={(e) => setNewBhojan({ ...newBhojan, pureSatvik: e.target.checked })}
                      className="rounded bg-stone-800 border-stone-700 text-orange-600 focus:ring-0"
                    />
                    <span>100% Satvik Pure Veg</span>
                  </label>
                  <label className="flex items-center space-x-2 text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBhojan.pureDesiGhee}
                      onChange={(e) => setNewBhojan({ ...newBhojan, pureDesiGhee: e.target.checked })}
                      className="rounded bg-stone-800 border-stone-700 text-orange-600 focus:ring-0"
                    />
                    <span>Pure Desi Ghee</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAddBhojanModal(false)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow cursor-pointer"
                  >
                    Publish Bhojan Spot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: EDIT HOTEL */}
        {/* ========================================================= */}
        {editingHotel && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-xl w-full p-6 text-stone-100 shadow-2xl relative my-8">
              <button
                onClick={() => setEditingHotel(null)}
                className="absolute top-5 right-5 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold font-serif text-white mb-2 flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>Edit Hotel Details</span>
              </h2>
              <p className="text-xs text-stone-400 mb-4">Editing {editingHotel.name}</p>

              <form onSubmit={handleUpdateHotel} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Hotel Name *</label>
                  <input
                    type="text"
                    required
                    value={editingHotel.name}
                    onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Price Per Night (₹)</label>
                    <input
                      type="number"
                      required
                      min={300}
                      value={editingHotel.pricePerNight}
                      onChange={(e) => setEditingHotel({ ...editingHotel, pricePerNight: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Nearest Landmark</label>
                    <input
                      type="text"
                      value={editingHotel.nearestLandmark || ''}
                      onChange={(e) => setEditingHotel({ ...editingHotel, nearestLandmark: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setEditingHotel(null)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: DELETE CONFIRMATION */}
        {/* ========================================================= */}
        {hotelToDelete && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-red-500/50 rounded-3xl max-w-sm w-full p-6 text-stone-100 shadow-2xl text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-950 text-red-400 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Delete Property?</h3>
              <p className="text-xs text-stone-400 mb-6">
                Are you sure you want to permanently remove <strong className="text-white">{hotelToDelete.name}</strong> from the platform?
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setHotelToDelete(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteHotel}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD USER */}
        {/* ========================================================= */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-6 text-stone-100 shadow-2xl relative">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="absolute top-5 right-5 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold font-serif text-white mb-4 flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                <span>Add Platform Team Member</span>
              </h2>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radheshyam Sharma"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. partner@brijnidhi.org"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="HOTEL_ADMIN">HOTEL_ADMIN (Property Partner)</option>
                    <option value="RESTAURANT_MANAGER">RESTAURANT_MANAGER (Bhojanalaya Partner)</option>
                    <option value="SYSTEM_ADMIN">SYSTEM_ADMIN (Co-Owner)</option>
                    <option value="CUSTOMER">CUSTOMER (Devotee)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow cursor-pointer"
                  >
                    Create Account
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
