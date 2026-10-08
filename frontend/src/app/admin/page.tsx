'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Lock,
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
  Phone,
  Mail,
  UserCheck,
  Car,
  Compass,
  Download,
  Activity,
  Award,
  BedDouble,
  Navigation,
  Percent,
  Sliders,
  Bell,
  Star,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import {
  fetchAdminOverview,
  fetchAdminProperties,
  createAdminProperty,
  updateAdminProperty,
  deleteAdminProperty,
  approveAdminProperty,
  rejectAdminProperty,
  toggleStatusAdminProperty,
  fetchAdminVehicles,
  fetchAdminDrivers,
  createAdminDriver,
  assignAdminVehicle,
  toggleStatusAdminDriver,
  deleteAdminDriver,
  fetchAdminBookings,
  updateAdminBookingStatus,
  deleteAdminBooking,
  createAdminCustomer,
  fetchAdminCustomers,
  deleteAdminCustomer,
  fetchAdminPayments,
  refundAdminPayment,
  fetchAdminReviews,
  updateAdminReviewStatus,
  deleteAdminReview,
  fetchAdminCoupons,
  createAdminCoupon,
  deleteAdminCoupon,
  fetchAdminReports,
  fetchAdminAuditLogs,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUserRole,
  deleteAdminUser,
  fetchAdminSettings,
  updateAdminSettings,
  ADMIN_API_BASE_URL
} from '../../lib/api';

// Supported Property & Service Types
export type PropertyType = 'Hotel' | 'Restaurant' | 'Ashram' | 'Dharamshala' | 'Transport';

export default function AdminDashboardPage() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RBAC simulation
  const [currentRole, setCurrentRole] = useState<string>('SUPER_ADMIN');

  // Overview Data
  const [overviewData, setOverviewData] = useState<any>(null);

  // Properties State
  const [properties, setProperties] = useState<any[]>([]);
  const [propertyFilterType, setPropertyFilterType] = useState<string>('all');
  const [propertyFilterStatus, setPropertyFilterStatus] = useState<string>('all');
  const [propertySearch, setPropertySearch] = useState<string>('');
  const [propertySort, setPropertySort] = useState<string>('name_asc');

  // Multi-Step Add Property Modal
  const [showAddPropertyModal, setShowAddPropertyModal] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [newProperty, setNewProperty] = useState<any>({
    name: '',
    propertyType: 'Hotel',
    description: '',
    ownerName: '',
    contactNumber: '',
    email: '',
    website: '',
    status: 'ACTIVE',
    address: '',
    city: 'Vrindavan',
    state: 'Uttar Pradesh',
    country: 'India',
    pincode: '281121',
    nearbyLandmark: '',
    latitude: 27.5815,
    longitude: 77.6978,
    mainImage: '',
    galleryImages: [],
    coverImage: '',
    videos: [],
    // Hotel Specifics
    hotelDetails: {
      starRating: 3,
      checkInTime: '12:00 PM',
      checkOutTime: '11:00 AM',
      totalRooms: 0,
      availableRooms: 0,
      amenities: ['Wi-Fi', 'AC', 'Pure Satvik Kitchen', 'Hot Water'],
      rooms: []
    },
    // Restaurant Specifics
    restaurantDetails: {
      cuisineTypes: ['North Indian', 'Pure Satvik'],
      openingTime: '07:00 AM',
      closingTime: '10:30 PM',
      seatingCapacity: 0,
      averageCost: 0,
      menu: []
    },
    // Ashram Specifics
    ashramDetails: {
      checkInTime: '06:00 AM',
      checkOutTime: '08:00 PM',
      accommodationAvailability: true,
      totalRooms: 0,
      totalBeds: 0,
      donationAmount: 0,
      bookingPrice: 0,
      stayType: 'Donation-based stay',
      rules: ['Participation in evening aarti', 'Pure satvik diet only'],
      facilities: ['Meditation Hall', 'Yoga Center', 'Prasadam Kitchen'],
      rooms: []
    },
    // Dharamshala Specifics
    dharamshalaDetails: {
      totalRooms: 0,
      totalBeds: 0,
      roomTypes: ['Single Room', 'Family Hall'],
      pricePerNight: 0,
      checkInTime: '08:00 AM',
      checkOutTime: '08:00 AM',
      amenities: ['Hot Water', 'Filtered Water'],
      rules: ['Valid ID proof required'],
      parking: true,
      foodAvailability: true,
      rooms: []
    },
    // Transport Specifics
    transportDetails: {
      vehicleTypes: ['E-Rickshaw', 'Car (Sedan)'],
      vehicles: []
    }
  });
          pricePerHour: 150,
          pricePerKm: 15,
          dailyPrice: 900,
          availability: true,
          status: 'Available',
          images: [],
          documents: ['Registration Certificate', 'Commercial Permit']
        }
      ]
    }
  });

  // Selected Property for View / Edit Modal
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [propertyToReject, setPropertyToReject] = useState<any | null>(null);

  // Transport & Drivers State
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [newDriver, setNewDriver] = useState<any>({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '2028-12-31',
    address: 'Vrindavan',
    experienceYears: 4
  });
  const [showAddDriverModal, setShowAddDriverModal] = useState<boolean>(false);

  // Bookings State
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingFilterService, setBookingFilterService] = useState<string>('all');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');

  // Customers State
  const [customers, setCustomers] = useState<any[]>([]);
  const [newCustomer, setNewCustomer] = useState<any>({ name: '', phone: '', email: '' });
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);

  // Payments State
  const [paymentOverview, setPaymentOverview] = useState<any>(null);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);

  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState<any>({
    couponCode: '',
    discountType: 'Percentage',
    discountValue: 10,
    minBookingAmount: 1000,
    maxDiscount: 500,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    usageLimit: 100
  });
  const [showAddCouponModal, setShowAddCouponModal] = useState<boolean>(false);

  // Reports State
  const [reportsData, setReportsData] = useState<any>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Users State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  // Platform Settings State
  const [settings, setSettings] = useState<any>({
    sacred_notice_text: '',
    sacred_notice_enabled: true,
    platform_commission_pct: 10,
    support_phone: '',
    support_email: ''
  });

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Master Data Fetcher
  const loadAllData = async () => {
    try {
      setRefreshing(true);
      const [
        ov,
        props,
        bks,
        drvs,
        vehs,
        custs,
        pays,
        revs,
        cpns,
        rpts,
        logs,
        usrs,
        stgs
      ] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminProperties(),
        fetchAdminBookings(),
        fetchAdminDrivers(),
        fetchAdminVehicles(),
        fetchAdminCustomers(),
        fetchAdminPayments(),
        fetchAdminReviews(),
        fetchAdminCoupons(),
        fetchAdminReports(),
        fetchAdminAuditLogs(),
        fetchAdminUsers(),
        fetchAdminSettings()
      ]);

      if (ov) setOverviewData(ov);
      if (props) setProperties(props);
      if (bks) setBookings(bks);
      if (drvs) setDrivers(drvs);
      if (vehs) setVehicles(vehs);
      if (custs) setCustomers(custs);
      if (pays) setPaymentOverview(pays);
      if (revs) setReviews(revs);
      if (cpns) setCoupons(cpns);
      if (rpts) setReportsData(rpts);
      if (logs) setAuditLogs(logs);
      if (usrs) setAdminUsers(usrs);
      if (stgs) setSettings(stgs);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      showToast('Error syncing with Rust backend');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered Properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchType =
        propertyFilterType === 'all' ||
        p.propertyType?.toLowerCase() === propertyFilterType.toLowerCase();
      const matchStatus =
        propertyFilterStatus === 'all' ||
        p.status?.toLowerCase() === propertyFilterStatus.toLowerCase();
      const matchSearch =
        !propertySearch ||
        p.name?.toLowerCase().includes(propertySearch.toLowerCase()) ||
        p.city?.toLowerCase().includes(propertySearch.toLowerCase()) ||
        p.ownerName?.toLowerCase().includes(propertySearch.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [properties, propertyFilterType, propertyFilterStatus, propertySearch]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchService =
        bookingFilterService === 'all' ||
        b.serviceType?.toLowerCase() === bookingFilterService.toLowerCase();
      const matchStatus =
        bookingFilterStatus === 'all' ||
        b.status?.toLowerCase() === bookingFilterStatus.toLowerCase();
      const matchSearch =
        !bookingSearch ||
        b.customerName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.propertyName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.bookingId?.toLowerCase().includes(bookingSearch.toLowerCase());
      return matchService && matchStatus && matchSearch;
    });
  }, [bookings, bookingFilterService, bookingFilterStatus, bookingSearch]);

  // Handle Add Property Submit
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminProperty(newProperty);
      showToast(`Property "${newProperty.name}" created successfully!`);
      setShowAddPropertyModal(false);
      setCurrentStep(1);
      loadAllData();
    } catch (err: any) {
      showToast('Failed to create property in Rust backend');
    }
  };

  // Property Action Handlers
  const handleApprove = async (id: string) => {
    try {
      await approveAdminProperty(id);
      showToast('Property approved and set to ACTIVE');
      loadAllData();
    } catch {
      showToast('Failed to approve property');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyToReject) return;
    try {
      await rejectAdminProperty(propertyToReject.id, rejectReason || 'Does not satisfy sacred tourism standards');
      showToast(`Property "${propertyToReject.name}" marked as REJECTED`);
      setPropertyToReject(null);
      setRejectReason('');
      loadAllData();
    } catch {
      showToast('Failed to reject property');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusAdminProperty(id);
      showToast('Property status toggled');
      loadAllData();
    } catch {
      showToast('Failed to toggle status');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this property?')) return;
    try {
      await deleteAdminProperty(id);
      showToast('Property deleted successfully');
      loadAllData();
    } catch {
      showToast('Failed to delete property');
    }
  };

  // Export CSV Report
  const handleExportCSV = (reportTitle: string, rows: any[]) => {
    if (!rows || rows.length === 0) {
      showToast('No data available to export');
      return;
    }
    const headers = Object.keys(rows[0]).join(',');
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportTitle.toLowerCase().replace(/ /g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${reportTitle} as CSV`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-400/40 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-emerald-200" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. LEFT SIDEBAR NAVIGATION                                            */}
      {/* ===================================================================== */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Brijnidhi <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-semibold">RUST</span>
              </h1>
              <p className="text-xs text-slate-400">Tourism & Property Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Core Management
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'properties'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>All Properties</span>
            <span className="ml-auto text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {properties.length}
            </span>
          </button>

          <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Property Verticals
          </div>

          <button
            onClick={() => {
              setActiveTab('properties');
              setPropertyFilterType('Hotel');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
          >
            <BedDouble className="w-4 h-4 text-sky-400" />
            <span>Hotels</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('properties');
              setPropertyFilterType('Restaurant');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
          >
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span>Restaurants & Bhojan</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('properties');
              setPropertyFilterType('Ashram');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Ashrams (Spiritual)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('properties');
              setPropertyFilterType('Dharamshala');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Dharamshalas</span>
          </button>

          <button
            onClick={() => setActiveTab('transport')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'transport'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>Transport & Drivers</span>
          </button>

          <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Operations & Finance
          </div>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4 shrink-0" />
            <span>Bookings</span>
            <span className="ml-auto text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'customers'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Customers</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'payments'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <IndianRupee className="w-4 h-4 shrink-0" />
            <span>Payments & Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 shrink-0" />
            <span>Reviews Moderation</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'offers'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Percent className="w-4 h-4 shrink-0" />
            <span>Offers & Coupons</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Reports & Exports</span>
          </button>

          <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            System & Security
          </div>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Platform Settings</span>
          </button>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/60 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-200">Rust Core Active</p>
            <p className="text-[11px] text-emerald-400">Port 5001 • Axum 0.7</p>
          </div>
          <Link
            href="/"
            className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
          >
            View Site →
          </Link>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* 2. MAIN WORKSPACE CONTENT                                             */}
      {/* ===================================================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950">
        {/* TOP NAVBAR */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2">
              {activeTab === 'overview' && 'Tourism Management Dashboard'}
              {activeTab === 'properties' && 'Multi-Property Management'}
              {activeTab === 'transport' && 'Vehicles & Driver Management'}
              {activeTab === 'bookings' && 'Centralized Booking Ledger'}
              {activeTab === 'customers' && 'Customer Profiles & History'}
              {activeTab === 'payments' && 'Financial Ledger & Payouts'}
              {activeTab === 'reviews' && 'Customer Review Moderation'}
              {activeTab === 'offers' && 'Offers & Discount Coupons'}
              {activeTab === 'reports' && 'Analytics & Export Reports'}
              {activeTab === 'audit' && 'Security Audit Trail'}
              {activeTab === 'settings' && 'Platform Governance'}
            </h2>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-4">
            {/* Role Badge Switcher */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="SUPER_ADMIN" className="bg-slate-900 text-slate-100">Super Admin</option>
                <option value="PROPERTY_MANAGER" className="bg-slate-900 text-slate-100">Property Manager</option>
                <option value="BOOKING_MANAGER" className="bg-slate-900 text-slate-100">Booking Manager</option>
                <option value="TRANSPORT_MANAGER" className="bg-slate-900 text-slate-100">Transport Manager</option>
                <option value="ACCOUNTANT" className="bg-slate-900 text-slate-100">Accountant</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadAllData}
              disabled={refreshing}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Data from Rust"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Add Property Button */}
            <button
              onClick={() => {
                setShowAddPropertyModal(true);
                setCurrentStep(1);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm shadow-md shadow-orange-500/20 hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Property</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <div className="p-8 space-y-8">
          {/* =================================================================== */}
          {/* TAB 1: OVERVIEW DASHBOARD                                           */}
          {/* =================================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 12 OVERVIEW KPI CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* 1. Total Properties */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Properties</span>
                    <Building2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{overviewData?.totalProperties ?? properties.length}</div>
                  <div className="text-xs text-slate-500 mt-1">Hotels, Ashrams, Restaurants</div>
                </div>

                {/* 2. Active Hotels */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Hotels</span>
                    <BedDouble className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold text-sky-400">{overviewData?.activeHotels ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">Verified pilgrim stays</div>
                </div>

                {/* 3. Active Restaurants */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Restaurants</span>
                    <Utensils className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">{overviewData?.activeRestaurants ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">Satvik Bhojanalayas</div>
                </div>

                {/* 4. Active Ashrams */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Ashrams</span>
                    <Heart className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-bold text-rose-400">{overviewData?.activeAshrams ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">Spiritual accommodation</div>
                </div>

                {/* 5. Active Dharamshalas */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Dharamshalas</span>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-400">{overviewData?.activeDharamshalas ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">Community pilgrim homes</div>
                </div>

                {/* 6. Available Vehicles */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Available Vehicles</span>
                    <Car className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">{overviewData?.availableVehicles ?? vehicles.length}</div>
                  <div className="text-xs text-slate-500 mt-1">E-Rickshaws, Cabs & Vans</div>
                </div>

                {/* 7. Total Bookings */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
                    <CalendarCheck className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{overviewData?.totalBookings ?? bookings.length}</div>
                  <div className="text-xs text-slate-500 mt-1">Lifetime platform volume</div>
                </div>

                {/* 8. Today's Bookings */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Today's Bookings</span>
                    <Clock className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-2xl font-bold text-teal-400">{overviewData?.todayBookings ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">Created today</div>
                </div>

                {/* 9. Pending Bookings */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Pending Bookings</span>
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">{overviewData?.pendingBookings ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">Awaiting confirmation</div>
                </div>

                {/* 10. Cancelled Bookings */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Cancelled Bookings</span>
                    <XCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-red-400">{overviewData?.cancelledBookings ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">Rate: {overviewData?.cancellationRate ?? 0}%</div>
                </div>

                {/* 11. Total Revenue */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ₹{(overviewData?.totalRevenue ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Confirmed transactions</div>
                </div>

                {/* 12. Monthly Revenue */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Monthly Revenue</span>
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-400">
                    ₹{(overviewData?.monthlyRevenue ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Platform commission: {overviewData?.commissionRatePct ?? 10}%</div>
                </div>
              </div>

              {/* DASHBOARD CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Property Type Distribution */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Property Type Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      { type: 'Hotels', count: overviewData?.activeHotels ?? 0, color: 'bg-sky-500' },
                      { type: 'Restaurants & Bhojan', count: overviewData?.activeRestaurants ?? 0, color: 'bg-emerald-500' },
                      { type: 'Ashrams', count: overviewData?.activeAshrams ?? 0, color: 'bg-rose-500' },
                      { type: 'Dharamshalas', count: overviewData?.activeDharamshalas ?? 0, color: 'bg-amber-500' },
                      { type: 'Transport (Vehicles)', count: vehicles.length, color: 'bg-cyan-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-300">{item.type}</span>
                          <span className="text-slate-400">{item.count} Active</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full`}
                            style={{
                              width: `${Math.max(5, (item.count / Math.max(1, properties.length + vehicles.length)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Monthly Occupancy Rate */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    Monthly Stay Occupancy Rate (%)
                  </h3>
                  <div className="grid grid-cols-6 gap-2 items-end h-44 pt-6">
                    {(overviewData?.monthlyOccupancy || [
                      { month: 'May', rate: 0 },
                      { month: 'Jun', rate: 0 },
                      { month: 'Jul', rate: 0 },
                      { month: 'Aug', rate: 0 },
                      { month: 'Sep', rate: 0 },
                      { month: 'Oct', rate: 0 }
                    ]).map((pt: any, i: number) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-300">{pt.rate}%</span>
                        <div
                          className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md transition-all hover:opacity-90"
                          style={{ height: `${(pt.rate / 100) * 110}px` }}
                        />
                        <span className="text-xs text-slate-400">{pt.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECENT BOOKINGS TABLE */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-amber-400" />
                    Recent Tourism Bookings
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    View All Bookings ({bookings.length}) →
                  </button>
                </div>
                {bookings.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No bookings logged yet. Real bookings will display dynamically as pilgrims reserve stays.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Booking ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4">Property</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-mono text-xs text-slate-400">{b.id}</td>
                            <td className="py-3 px-4 font-medium text-white">{b.customerName || b.guestName}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-medium">
                                {b.serviceType}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300">{b.propertyName || b.hotelName}</td>
                            <td className="py-3 px-4 font-semibold text-emerald-400">
                              ₹{(b.amount || b.grandTotal || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                b.status === 'Confirmed' || b.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : b.status === 'Pending'
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 2: PROPERTIES MANAGEMENT                                        */}
          {/* =================================================================== */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              {/* FILTERS & SEARCH BAR */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search property name, city, owner..."
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Property Type Filter */}
                  <select
                    value={propertyFilterType}
                    onChange={(e) => setPropertyFilterType(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Property Types</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Restaurant">Restaurant / Bhojan</option>
                    <option value="Ashram">Ashram (Spiritual)</option>
                    <option value="Dharamshala">Dharamshala</option>
                    <option value="Transport">Transport / Rickshaw</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={propertyFilterStatus}
                    onChange={(e) => setPropertyFilterStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Showing <strong className="text-white">{filteredProperties.length}</strong> properties
                  </span>
                  <button
                    onClick={() => {
                      setShowAddPropertyModal(true);
                      setCurrentStep(1);
                    }}
                    className="flex items-center gap-2 bg-amber-500 text-slate-950 px-3.5 py-2 rounded-lg font-semibold text-xs hover:bg-amber-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Property</span>
                  </button>
                </div>
              </div>

              {/* PROPERTIES DATA TABLE */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                {filteredProperties.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">No properties match your filter</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                        Try adjusting search terms or click "Add New Property" to add a Hotel, Ashram, Restaurant, Dharamshala, or Vehicle to the platform.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Property</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Rating</th>
                          <th className="py-3 px-4">Bookings</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredProperties.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                            {/* Property Details */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {p.mainImage ? (
                                  <img
                                    src={p.mainImage}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                                    {p.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-white">{p.name}</div>
                                  <div className="text-xs text-slate-500 font-mono">ID: {p.id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Type */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                p.propertyType === 'Hotel'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  : p.propertyType === 'Restaurant'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : p.propertyType === 'Ashram'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : p.propertyType === 'Dharamshala'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}>
                                {p.propertyType}
                              </span>
                            </td>

                            {/* Location */}
                            <td className="py-3.5 px-4 text-xs text-slate-300">
                              <div className="flex items-center gap-1 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                {p.city || 'Vrindavan'}
                              </div>
                              {p.nearbyLandmark && (
                                <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                                  Near {p.nearbyLandmark}
                                </div>
                              )}
                            </td>

                            {/* Contact */}
                            <td className="py-3.5 px-4 text-xs">
                              <div className="text-slate-300 font-medium">{p.ownerName}</div>
                              <div className="text-slate-500">{p.contactNumber}</div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                p.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : p.status === 'PENDING' || p.status === 'UNDER_REVIEW'
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  : p.status === 'REJECTED'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}>
                                {p.status}
                              </span>
                            </td>

                            {/* Rating */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {p.rating || 5.0}
                              </div>
                            </td>

                            {/* Bookings */}
                            <td className="py-3.5 px-4 text-xs font-mono font-medium text-slate-300">
                              {p.totalBookings || 0}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Toggle Status */}
                                <button
                                  onClick={() => handleToggleStatus(p.id)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                  title="Toggle Active/Inactive"
                                >
                                  {p.status === 'ACTIVE' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-500" />}
                                </button>

                                {/* Approve (if pending) */}
                                {(p.status === 'PENDING' || p.status === 'UNDER_REVIEW') && (
                                  <button
                                    onClick={() => handleApprove(p.id)}
                                    className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700 hover:bg-emerald-900 text-emerald-300 transition-colors"
                                    title="Approve Property"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Reject (if pending) */}
                                {(p.status === 'PENDING' || p.status === 'UNDER_REVIEW') && (
                                  <button
                                    onClick={() => setPropertyToReject(p)}
                                    className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-700 hover:bg-rose-900 text-rose-300 transition-colors"
                                    title="Reject Property"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Delete */}
                                <button
                                  onClick={() => handleDeleteProperty(p.id)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 transition-colors"
                                  title="Delete Property"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: TRANSPORT & DRIVERS                                          */}
          {/* =================================================================== */}
          {activeTab === 'transport' && (
            <div className="space-y-8">
              {/* Top Action Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-cyan-400" />
                    Transport Fleet & Driver Operations
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage E-Rickshaws, Cabs, Tempo Travellers, and Pilgrim Transport Drivers
                  </p>
                </div>
                <button
                  onClick={() => setShowAddDriverModal(true)}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Driver</span>
                </button>
              </div>

              {/* Drivers Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Registered Drivers Directory ({drivers.length})</h4>
                </div>
                {drivers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No drivers registered yet. Click "Register New Driver" to add an E-Rickshaw or Cab driver.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Driver Name</th>
                          <th className="py-3 px-4">Phone</th>
                          <th className="py-3 px-4">License Number</th>
                          <th className="py-3 px-4">Experience</th>
                          <th className="py-3 px-4">Assigned Vehicle</th>
                          <th className="py-3 px-4">Rating</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {drivers.map((drv) => (
                          <tr key={drv.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-semibold text-white">{drv.name}</td>
                            <td className="py-3 px-4 text-slate-300">{drv.phone}</td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-400">{drv.licenseNumber}</td>
                            <td className="py-3 px-4">{drv.experienceYears} Years</td>
                            <td className="py-3 px-4 text-cyan-400 font-mono text-xs">
                              {drv.assignedVehicle || 'Unassigned'}
                            </td>
                            <td className="py-3 px-4 font-semibold text-amber-400">★ {drv.rating}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                drv.status === 'Active'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}>
                                {drv.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={async () => {
                                  await toggleStatusAdminDriver(drv.id);
                                  showToast('Driver status toggled');
                                  loadAllData();
                                }}
                                className="text-xs text-amber-400 hover:underline mr-3"
                              >
                                Toggle
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Delete this driver?')) {
                                    await deleteAdminDriver(drv.id);
                                    showToast('Driver deleted');
                                    loadAllData();
                                  }
                                }}
                                className="text-xs text-red-400 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 4: BOOKINGS MANAGEMENT                                          */}
          {/* =================================================================== */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Filter bar */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search booking ID, customer name, property..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <select
                    value={bookingFilterService}
                    onChange={(e) => setBookingFilterService(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Services</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Ashram">Ashram</option>
                    <option value="Dharamshala">Dharamshala</option>
                    <option value="Transport">Transport</option>
                  </select>

                  <select
                    value={bookingFilterStatus}
                    onChange={(e) => setBookingFilterStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-In">Checked-In</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={() => handleExportCSV('Bookings', filteredBookings)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Bookings Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                {filteredBookings.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No bookings found matching the selected filter criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Booking ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4">Property</th>
                          <th className="py-3 px-4">Check-in / Date</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-mono text-xs text-slate-400">{b.id}</td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{b.customerName || b.guestName}</div>
                              <div className="text-xs text-slate-500">{b.customerPhone || b.guestPhone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-medium">
                                {b.serviceType}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-medium">
                              {b.propertyName || b.hotelName}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-400">
                              <div>In: {b.checkIn}</div>
                              <div>Out: {b.checkOut}</div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-emerald-400">
                              ₹{(b.amount || b.grandTotal || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                b.paymentStatus === 'Paid'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {b.paymentStatus || 'Paid'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={b.status}
                                onChange={async (e) => {
                                  await updateAdminBookingStatus(b.id, e.target.value);
                                  showToast(`Booking status changed to ${e.target.value}`);
                                  loadAllData();
                                }}
                                className="bg-slate-950 border border-slate-800 text-xs rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Checked-In">Checked-In</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={async () => {
                                  if (confirm('Cancel / delete this booking?')) {
                                    await deleteAdminBooking(b.id);
                                    showToast('Booking deleted');
                                    loadAllData();
                                  }
                                }}
                                className="text-xs text-red-400 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 5: CUSTOMERS MANAGEMENT                                         */}
          {/* =================================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Pilgrims & Customer Directory
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage customer profiles, booking history, and pilgrim accounts
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Customer</span>
                </button>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                {customers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No registered customers yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Customer ID</th>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">Total Bookings</th>
                          <th className="py-3 px-4">Total Spending</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-mono text-xs text-slate-400">{c.id}</td>
                            <td className="py-3 px-4 font-semibold text-white">{c.name}</td>
                            <td className="py-3 px-4 text-xs">
                              <div>{c.phone}</div>
                              <div className="text-slate-500">{c.email}</div>
                            </td>
                            <td className="py-3 px-4 font-mono">{c.totalBookings}</td>
                            <td className="py-3 px-4 font-semibold text-emerald-400">
                              ₹{(c.totalSpending || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 font-semibold">
                                {c.accountStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={async () => {
                                  if (confirm('Delete customer?')) {
                                    await deleteAdminCustomer(c.id);
                                    showToast('Customer deleted');
                                    loadAllData();
                                  }
                                }}
                                className="text-xs text-red-400 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 6: PAYMENTS & FINANCIAL LEDGER                                  */}
          {/* =================================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Financial KPI Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Total Gross Volume</div>
                  <div className="text-2xl font-bold text-white">
                    ₹{(paymentOverview?.totalGrossBookings ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Processed transactions</div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Platform Commission</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ₹{(paymentOverview?.platformCommissions ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Platform earnings ({paymentOverview?.commissionRatePct ?? 10}%)</div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Vendor Payouts</div>
                  <div className="text-2xl font-bold text-sky-400">
                    ₹{(paymentOverview?.payoutsToHotels ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Due to stay partners</div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Pending Payouts</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    ₹{(paymentOverview?.pendingPayouts ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Scheduled for next cycle</div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Payment Transactions Ledger</h4>
                  <button
                    onClick={() => handleExportCSV('Payment_Transactions', paymentOverview?.payments || [])}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Ledger CSV
                  </button>
                </div>
                {!paymentOverview?.payments || paymentOverview.payments.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No payment records logged yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Payment ID</th>
                          <th className="py-3 px-4">Booking ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Method</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Payment Status</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {paymentOverview.payments.map((p: any) => (
                          <tr key={p.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-mono text-xs text-slate-400">{p.id}</td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-400">{p.bookingId}</td>
                            <td className="py-3 px-4 font-medium text-white">{p.customer}</td>
                            <td className="py-3 px-4 text-xs text-slate-300">{p.paymentMethod}</td>
                            <td className="py-3 px-4 font-semibold text-emerald-400">
                              ₹{(p.amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 font-semibold">
                                {p.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-400">{p.paymentDate}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={async () => {
                                  if (confirm(`Process refund for payment ${p.id}?`)) {
                                    await refundAdminPayment(p.id, 'Admin issued refund');
                                    showToast('Refund processed successfully');
                                    loadAllData();
                                  }
                                }}
                                className="text-xs text-yellow-400 hover:underline"
                              >
                                Refund
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 7: REVIEWS MODERATION                                           */}
          {/* =================================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    Customer Reviews Moderation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Approve, flag, hide, or remove pilgrim feedback across hotels and services
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                {reviews.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No reviews pending moderation.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Property</th>
                          <th className="py-3 px-4">Rating</th>
                          <th className="py-3 px-4">Review Content</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {reviews.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-semibold text-white">{r.customer}</td>
                            <td className="py-3 px-4 text-slate-300">{r.propertyName}</td>
                            <td className="py-3 px-4 font-semibold text-amber-400">★ {r.rating}</td>
                            <td className="py-3 px-4 max-w-sm text-xs text-slate-300 truncate">{r.review}</td>
                            <td className="py-3 px-4 text-xs text-slate-500">{r.date}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                r.status === 'Approved'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : r.status === 'Flagged'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={async () => {
                                  await updateAdminReviewStatus(r.id, 'Approved');
                                  showToast('Review approved');
                                  loadAllData();
                                }}
                                className="text-xs text-emerald-400 hover:underline"
                              >
                                Approve
                              </button>
                              <button
                                onClick={async () => {
                                  await updateAdminReviewStatus(r.id, 'Hidden');
                                  showToast('Review hidden');
                                  loadAllData();
                                }}
                                className="text-xs text-yellow-400 hover:underline"
                              >
                                Hide
                              </button>
                              <button
                                onClick={async () => {
                                  await deleteAdminReview(r.id);
                                  showToast('Review deleted');
                                  loadAllData();
                                }}
                                className="text-xs text-red-400 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 8: OFFERS & COUPONS                                             */}
          {/* =================================================================== */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Percent className="w-5 h-5 text-amber-400" />
                    Offers & Discount Coupons
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage seasonal discounts, promo codes, and transport coupons
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  className="flex items-center gap-2 bg-amber-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber-400"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Promo Coupon</span>
                </button>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                {coupons.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No active discount coupons. Click "Create Promo Coupon" to configure one.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Coupon Code</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Discount</th>
                          <th className="py-3 px-4">Min Amount</th>
                          <th className="py-3 px-4">Validity</th>
                          <th className="py-3 px-4">Usage</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {coupons.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-mono font-bold text-amber-400">{c.couponCode}</td>
                            <td className="py-3 px-4">{c.discountType}</td>
                            <td className="py-3 px-4 font-semibold text-emerald-400">
                              {c.discountType === 'Percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                            </td>
                            <td className="py-3 px-4 text-xs font-mono">₹{c.minBookingAmount}</td>
                            <td className="py-3 px-4 text-xs text-slate-400">{c.startDate} to {c.endDate}</td>
                            <td className="py-3 px-4 text-xs font-mono">{c.usageCount} / {c.usageLimit}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={async () => {
                                  if (confirm('Delete coupon?')) {
                                    await deleteAdminCoupon(c.id);
                                    showToast('Coupon deleted');
                                    loadAllData();
                                  }
                                }}
                                className="text-xs text-red-400 hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 9: REPORTS & EXPORTS                                            */}
          {/* =================================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    Analytics & Export Reports
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Download official tourism reports in CSV / Excel format
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Report */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-sky-400" />
                      Property & Stays Report
                    </h4>
                    <button
                      onClick={() => handleExportCSV('Properties_Report', properties)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Total Registered Properties: <strong>{properties.length}</strong></p>
                    <p>Active Verified Hotels: <strong>{overviewData?.activeHotels ?? 0}</strong></p>
                    <p>Active Restaurants: <strong>{overviewData?.activeRestaurants ?? 0}</strong></p>
                    <p>Ashrams & Dharamshalas: <strong>{(overviewData?.activeAshrams ?? 0) + (overviewData?.activeDharamshalas ?? 0)}</strong></p>
                  </div>
                </div>

                {/* Revenue Report */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-400" />
                      Revenue & Earnings Report
                    </h4>
                    <button
                      onClick={() => handleExportCSV('Revenue_Report', paymentOverview?.payments || [])}
                      className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Gross Volume: <strong>₹{(overviewData?.totalRevenue ?? 0).toLocaleString()}</strong></p>
                    <p>Platform Commission: <strong>₹{(overviewData?.platformCommissionEarned ?? 0).toLocaleString()}</strong></p>
                    <p>Active Commission Rate: <strong>{overviewData?.commissionRatePct ?? 10}%</strong></p>
                  </div>
                </div>

                {/* Bookings Report */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-indigo-400" />
                      Booking Volumes & Cancellation Report
                    </h4>
                    <button
                      onClick={() => handleExportCSV('Bookings_Report', bookings)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Total Bookings: <strong>{bookings.length}</strong></p>
                    <p>Pending Review: <strong>{overviewData?.pendingBookings ?? 0}</strong></p>
                    <p>Cancellation Rate: <strong>{overviewData?.cancellationRate ?? 0}%</strong></p>
                  </div>
                </div>

                {/* Transport Utilization Report */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Car className="w-4 h-4 text-cyan-400" />
                      Transport Fleet Utilization
                    </h4>
                    <button
                      onClick={() => handleExportCSV('Drivers_Fleet_Report', drivers)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Active Vehicles: <strong>{vehicles.length}</strong></p>
                    <p>Registered Drivers: <strong>{drivers.length}</strong></p>
                    <p>Top Transit: <strong>E-Rickshaw Darshan Circuits</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 10: AUDIT LOGS                                                  */}
          {/* =================================================================== */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    Immutable Security & Audit Trail
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Every admin action, property creation, and status toggle recorded with IP & timestamp
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Module</th>
                        <th className="py-3 px-4">Details</th>
                        <th className="py-3 px-4">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/30">
                          <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                          <td className="py-3 px-4 text-white font-sans font-medium">{log.user}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-amber-300 font-semibold">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">{log.module}</td>
                          <td className="py-3 px-4 font-sans text-slate-300">{log.details}</td>
                          <td className="py-3 px-4 text-slate-500">{log.ip_address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 11: SETTINGS & RBAC                                             */}
          {/* =================================================================== */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-8">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Platform Governance & Commission
                </h3>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await updateAdminSettings(settings);
                      showToast('Platform settings updated successfully');
                    } catch {
                      showToast('Failed to update settings');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Sacred Notice Banner Text
                    </label>
                    <textarea
                      value={settings.sacred_notice_text || ''}
                      onChange={(e) => setSettings({ ...settings, sacred_notice_text: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Platform Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={settings.platform_commission_pct || 10}
                        onChange={(e) => setSettings({ ...settings, platform_commission_pct: parseFloat(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Support Phone
                      </label>
                      <input
                        type="text"
                        value={settings.support_phone || ''}
                        onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs"
                  >
                    Save Platform Settings
                  </button>
                </form>
              </div>

              {/* RBAC Admin Users */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Admin Users & RBAC Permissions
                </h3>
                <div className="space-y-3">
                  {adminUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div>
                        <div className="font-semibold text-white text-sm">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-1 rounded">
                          {u.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===================================================================== */}
      {/* 3. MULTI-STEP "ADD PROPERTY" MODAL                                    */}
      {/* ===================================================================== */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  Add New Tourism Property / Service
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Step {currentStep} of 6 — Common Property Management Engine
                </p>
              </div>
              <button
                onClick={() => setShowAddPropertyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Wizard Indicator */}
            <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs font-semibold">
              {[
                '1. Basic Info',
                '2. Location',
                '3. Images',
                '4. Specifics',
                '5. Rules & Pricing',
                '6. Review'
              ].map((label, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 ${
                    currentStep === idx + 1
                      ? 'text-amber-400 font-bold'
                      : currentStep > idx + 1
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === idx + 1
                      ? 'bg-amber-400 text-slate-950'
                      : currentStep > idx + 1
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>

            {/* Step Body */}
            <form onSubmit={handleCreateProperty} className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* STEP 1: BASIC INFO */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Property / Service Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shri Radha Raman Kripa Dham"
                        value={newProperty.name}
                        onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Property Type *
                      </label>
                      <select
                        value={newProperty.propertyType}
                        onChange={(e) => setNewProperty({ ...newProperty, propertyType: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                      >
                        <option value="Hotel">Hotel</option>
                        <option value="Restaurant">Restaurant / Bhojanalaya</option>
                        <option value="Ashram">Ashram (Spiritual)</option>
                        <option value="Dharamshala">Dharamshala (Pilgrim Home)</option>
                        <option value="Transport">Car / E-Rickshaw Transport</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Sacred ambiance, distance to temples, sattvic food..."
                      value={newProperty.description}
                      onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Mahant Ji / Seva Trust"
                        value={newProperty.ownerName}
                        onChange={(e) => setNewProperty({ ...newProperty, ownerName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="+91 98765 00000"
                        value={newProperty.contactNumber}
                        onChange={(e) => setNewProperty({ ...newProperty, contactNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="seva@brijnidhi.org"
                        value={newProperty.email}
                        onChange={(e) => setNewProperty({ ...newProperty, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Parikrama Marg, Raman Reti"
                        value={newProperty.address}
                        onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">City / Holy Area</label>
                      <select
                        value={newProperty.city}
                        onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Vrindavan">Vrindavan</option>
                        <option value="Mathura">Mathura</option>
                        <option value="Barsana">Barsana</option>
                        <option value="Govardhan">Govardhan</option>
                        <option value="Nandgaon">Nandgaon</option>
                        <option value="Gokul">Gokul</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nearby Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Near ISKCON Temple / Bankey Bihari"
                        value={newProperty.nearbyLandmark}
                        onChange={(e) => setNewProperty({ ...newProperty, nearbyLandmark: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={newProperty.latitude}
                        onChange={(e) => setNewProperty({ ...newProperty, latitude: parseFloat(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={newProperty.longitude}
                        onChange={(e) => setNewProperty({ ...newProperty, longitude: parseFloat(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: IMAGES & MEDIA */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Main Cover Image URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={newProperty.mainImage}
                      onChange={(e) => setNewProperty({ ...newProperty, mainImage: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {newProperty.mainImage && (
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-800 relative">
                      <img src={newProperty.mainImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-1 rounded text-[11px] text-white">
                        Main Image Preview
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: TYPE SPECIFIC FIELDS */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  {/* IF HOTEL */}
                  {newProperty.propertyType === 'Hotel' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Star Rating</label>
                          <select
                            value={newProperty.hotelDetails.starRating}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                hotelDetails: { ...newProperty.hotelDetails, starRating: parseInt(e.target.value) }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          >
                            <option value={3}>3 Star</option>
                            <option value={4}>4 Star</option>
                            <option value={5}>5 Star Heritage</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Total Rooms</label>
                          <input
                            type="number"
                            value={newProperty.hotelDetails.totalRooms}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                hotelDetails: { ...newProperty.hotelDetails, totalRooms: parseInt(e.target.value) }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Check-in Time</label>
                          <input
                            type="text"
                            value={newProperty.hotelDetails.checkInTime}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                hotelDetails: { ...newProperty.hotelDetails, checkInTime: e.target.value }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Check-out Time</label>
                          <input
                            type="text"
                            value={newProperty.hotelDetails.checkOutTime}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                hotelDetails: { ...newProperty.hotelDetails, checkOutTime: e.target.value }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                      </div>

                      {/* Amenities checklist */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-2">Hotel Amenities</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            'Wi-Fi',
                            'Parking',
                            'Pure Satvik Kitchen',
                            'AC',
                            'Room Service',
                            'Laundry',
                            'Hot Water',
                            'Power Backup',
                            'Elevator',
                            'CCTV',
                            'Temple Darshan Assistance'
                          ].map((am, i) => (
                            <label key={i} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newProperty.hotelDetails.amenities.includes(am)}
                                onChange={(e) => {
                                  const current = newProperty.hotelDetails.amenities;
                                  const updated = e.target.checked
                                    ? [...current, am]
                                    : current.filter((x: string) => x !== am);
                                  setNewProperty({
                                    ...newProperty,
                                    hotelDetails: { ...newProperty.hotelDetails, amenities: updated }
                                  });
                                }}
                                className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                              />
                              <span>{am}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IF RESTAURANT */}
                  {newProperty.propertyType === 'Restaurant' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Time</label>
                          <input
                            type="text"
                            value={newProperty.restaurantDetails.openingTime}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                restaurantDetails: { ...newProperty.restaurantDetails, openingTime: e.target.value }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Closing Time</label>
                          <input
                            type="text"
                            value={newProperty.restaurantDetails.closingTime}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                restaurantDetails: { ...newProperty.restaurantDetails, closingTime: e.target.value }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Seating Capacity</label>
                          <input
                            type="number"
                            value={newProperty.restaurantDetails.seatingCapacity}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                restaurantDetails: { ...newProperty.restaurantDetails, seatingCapacity: parseInt(e.target.value) }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Average Cost (₹)</label>
                          <input
                            type="number"
                            value={newProperty.restaurantDetails.averageCost}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                restaurantDetails: { ...newProperty.restaurantDetails, averageCost: parseFloat(e.target.value) }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IF ASHRAM */}
                  {newProperty.propertyType === 'Ashram' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Stay Policy</label>
                          <select
                            value={newProperty.ashramDetails.stayType}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                ashramDetails: { ...newProperty.ashramDetails, stayType: e.target.value }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          >
                            <option value="Donation-based stay">Donation-based stay</option>
                            <option value="Free stay">Free stay (Seva/Pilgrim)</option>
                            <option value="Volunteer stay">Volunteer stay</option>
                            <option value="Paid booking">Paid booking</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Total Beds</label>
                          <input
                            type="number"
                            value={newProperty.ashramDetails.totalBeds}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                ashramDetails: { ...newProperty.ashramDetails, totalBeds: parseInt(e.target.value) }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Suggested Donation (₹)</label>
                          <input
                            type="number"
                            value={newProperty.ashramDetails.donationAmount}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                ashramDetails: { ...newProperty.ashramDetails, donationAmount: parseFloat(e.target.value) }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IF DHARAMSHALA */}
                  {newProperty.propertyType === 'Dharamshala' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Total Rooms</label>
                          <input
                            type="number"
                            value={newProperty.dharamshalaDetails.totalRooms}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                dharamshalaDetails: { ...newProperty.dharamshalaDetails, totalRooms: parseInt(e.target.value) }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Price Per Night (₹)</label>
                          <input
                            type="number"
                            value={newProperty.dharamshalaDetails.pricePerNight}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                dharamshalaDetails: { ...newProperty.dharamshalaDetails, pricePerNight: parseFloat(e.target.value) }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Food / Prasad Available</label>
                          <select
                            value={newProperty.dharamshalaDetails.foodAvailability ? 'true' : 'false'}
                            onChange={(e) =>
                              setNewProperty({
                                ...newProperty,
                                dharamshalaDetails: {
                                  ...newProperty.dharamshalaDetails,
                                  foodAvailability: e.target.value === 'true'
                                }
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          >
                            <option value="true">Yes, Bhojan Available</option>
                            <option value="false">No Food Facility</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IF TRANSPORT */}
                  {newProperty.propertyType === 'Transport' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400">
                        Default transit vehicle assigned for this provider. Additional fleet can be added in Transport tab.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Type</label>
                          <select
                            value={newProperty.transportDetails.vehicles[0]?.vehicleType || 'E-Rickshaw'}
                            onChange={(e) => {
                              const updated = [...newProperty.transportDetails.vehicles];
                              updated[0].vehicleType = e.target.value;
                              setNewProperty({
                                ...newProperty,
                                transportDetails: { ...newProperty.transportDetails, vehicles: updated }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          >
                            <option value="E-Rickshaw">E-Rickshaw</option>
                            <option value="Car">Car (Sedan/SUV)</option>
                            <option value="Auto">Auto Rickshaw</option>
                            <option value="Tempo Traveller">Tempo Traveller</option>
                            <option value="Bus">Bus</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Number</label>
                          <input
                            type="text"
                            value={newProperty.transportDetails.vehicles[0]?.vehicleNumber || ''}
                            onChange={(e) => {
                              const updated = [...newProperty.transportDetails.vehicles];
                              updated[0].vehicleNumber = e.target.value;
                              setNewProperty({
                                ...newProperty,
                                transportDetails: { ...newProperty.transportDetails, vehicles: updated }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Price (₹)</label>
                          <input
                            type="number"
                            value={newProperty.transportDetails.vehicles[0]?.dailyPrice || 900}
                            onChange={(e) => {
                              const updated = [...newProperty.transportDetails.vehicles];
                              updated[0].dailyPrice = parseFloat(e.target.value);
                              setNewProperty({
                                ...newProperty,
                                transportDetails: { ...newProperty.transportDetails, vehicles: updated }
                              });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: RULES & POLICIES */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Sacred Tourism Standards & Policies
                    </h4>
                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-amber-500" />
                      <span>Pure Satvik premises (strictly no onion, garlic, or non-veg food)</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-amber-500" />
                      <span>Compliant with Braj Pilgrim Safety & Sanitation guidelines</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-amber-500" />
                      <span>24x7 Hot water & temple darshan guidance available</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW & SUBMIT */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-base">{newProperty.name}</h4>
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-medium">
                          {newProperty.propertyType}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{newProperty.city}, UP</span>
                    </div>

                    <div className="text-xs text-slate-400 grid grid-cols-2 gap-3">
                      <div>Owner: <span className="text-slate-200">{newProperty.ownerName}</span></div>
                      <div>Contact: <span className="text-slate-200">{newProperty.contactNumber}</span></div>
                      <div>Address: <span className="text-slate-200">{newProperty.address}</span></div>
                      <div>Status: <span className="text-emerald-400 font-semibold">{newProperty.status}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    ← Back
                  </button>
                ) : <div />}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!newProperty.name && currentStep === 1) {
                        alert('Please fill in Property Name');
                        return;
                      }
                      setCurrentStep(currentStep + 1);
                    }}
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 flex items-center gap-1"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Publish to Rust</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {propertyToReject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 text-rose-400">
              <XCircle className="w-5 h-5" />
              Reject Property Submission
            </h3>
            <p className="text-xs text-slate-300">
              Please provide the reason for rejecting <strong>{propertyToReject.name}</strong>. This explanation will be logged and sent to the owner.
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Incomplete fire safety documents, or did not adhere to satvik pledge..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPropertyToReject(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DRIVER MODAL */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 text-cyan-400">
              <Car className="w-5 h-5" />
              Register Transport Driver
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await createAdminDriver(newDriver);
                  showToast(`Driver ${newDriver.name} added!`);
                  setShowAddDriverModal(false);
                  loadAllData();
                } catch {
                  showToast('Failed to add driver');
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs text-slate-400 mb-1">Driver Name</label>
                <input
                  type="text"
                  required
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">License No.</label>
                  <input
                    type="text"
                    required
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddDriverModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white"
                >
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COUPON MODAL */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 text-amber-400">
              <Percent className="w-5 h-5" />
              Create Discount Coupon
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await createAdminCoupon(newCoupon);
                  showToast(`Coupon ${newCoupon.couponCode} created!`);
                  setShowAddCouponModal(false);
                  loadAllData();
                } catch {
                  showToast('Failed to create coupon');
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs text-slate-400 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RADHE10"
                  value={newCoupon.couponCode}
                  onChange={(e) => setNewCoupon({ ...newCoupon, couponCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
