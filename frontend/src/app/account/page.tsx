'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  CalendarCheck,
  Heart,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Printer,
  ChevronRight,
  Sparkles,
  QrCode,
  X,
  CheckCircle2,
  AlertCircle,
  Star,
  CreditCard,
  Lock,
  HelpCircle,
  Settings,
  Users,
  Bell,
  LogOut,
  Edit3,
  ExternalLink,
  Download,
  Navigation,
  FileText,
  Clock,
  Check,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface BookingItem {
  id: string;
  bookingReference: string;
  hotelName: string;
  destination: string;
  address?: string;
  hotelPhone?: string;
  room: string;
  checkIn: string;
  checkOut: string;
  totalNights?: number;
  guests: number;
  totalAmount: number;
  roomCharges?: number;
  taxAmount?: number;
  discountAmount?: number;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'REFUNDED' | 'PENDING';
  paymentMethod?: string;
  cancellationPolicy?: string;
  addOns?: string[];
  createdAt?: string;
}

interface SavedHotel {
  id: string;
  name: string;
  destination: string;
  pricePerNight: number;
  image: string;
  stayType: string;
  nearestLandmark: string;
}

interface ReviewItem {
  id: string;
  hotelName: string;
  destination: string;
  rating: number;
  comment: string;
  date: string;
  satvikRating: number;
}

interface SavedGuest {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  relationship: string;
}

interface SupportTicket {
  id: string;
  bookingRef: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  date: string;
  message: string;
}

export default function CustomerAccountPage() {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'bookings' | 'favorites' | 'reviews' | 'payments' | 'guests' | 'preferences' | 'security' | 'support'
  >('profile');

  // Profile State
  const [customer, setCustomer] = useState({
    name: 'Girish Sharma',
    firstName: 'Girish',
    lastName: 'Sharma',
    email: 'girish@example.com',
    phone: '+91 98765 43210',
    dob: '1992-08-15',
    preferredLanguage: 'Hindi',
    country: 'India',
    memberSince: '2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...customer });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Bookings State
  const [bookingFilter, setBookingFilter] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [myBookings, setMyBookings] = useState<BookingItem[]>([]);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<BookingItem | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<BookingItem | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<BookingItem | null>(null);

  // Saved Hotels State
  const [savedHotels, setSavedHotels] = useState<SavedHotel[]>([]);

  // Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [writeReviewModalBooking, setWriteReviewModalBooking] = useState<BookingItem | null>(null);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: '',
    satvikRating: 5
  });

  // Saved Guests State
  const [savedGuests, setSavedGuests] = useState<SavedGuest[]>([
    { id: 'gst-1', name: 'Sunita Sharma', age: 31, gender: 'Female', relationship: 'Spouse' },
    { id: 'gst-2', name: 'Ramesh Sharma', age: 62, gender: 'Male', relationship: 'Father' }
  ]);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestForm, setNewGuestForm] = useState<Omit<SavedGuest, 'id'>>({
    name: '',
    age: 30,
    gender: 'Male',
    relationship: 'Family Devotee'
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    language: 'Hindi (हिंदी)',
    currency: 'INR (₹)',
    bookingConfirmation: true,
    bookingReminders: true,
    cancellationUpdates: true,
    festivalDarshanAlerts: true,
    promotionalOffers: false
  });

  // Security State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-1082',
      bookingRef: 'BRJ-102938',
      subject: 'Banke Bihari VIP Darshan pass inquiry',
      category: 'Temple Darshan Assistance',
      status: 'RESOLVED',
      date: '02 Oct 2026',
      message: 'Can the hotel front desk arrange an e-rickshaw for elderly parents for evening Mangala darshan?'
    }
  ]);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    bookingRef: '',
    subject: '',
    category: 'Booking Query',
    message: ''
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('brijnidhi_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const fullName = parsed.name || 'Girish Sharma';
        const parts = fullName.split(' ');
        const fName = parts[0] || fullName;
        const lName = parts.slice(1).join(' ') || '';

        setCustomer(prev => ({
          ...prev,
          name: fullName,
          firstName: fName,
          lastName: lName,
          email: parsed.email || prev.email,
          phone: parsed.phone && parsed.phone !== 'Not provided' ? parsed.phone : prev.phone
        }));
        setEditFormData(prev => ({
          ...prev,
          name: fullName,
          firstName: fName,
          lastName: lName,
          email: parsed.email || prev.email,
          phone: parsed.phone && parsed.phone !== 'Not provided' ? parsed.phone : prev.phone
        }));
      }

      const storedBookings = localStorage.getItem('brijnidhi_my_bookings');
      if (storedBookings) {
        setMyBookings(JSON.parse(storedBookings));
      }

      const storedFavorites = localStorage.getItem('brijnidhi_favorite_hotels');
      if (storedFavorites) {
        setSavedHotels(JSON.parse(storedFavorites));
      }

      const storedReviews = localStorage.getItem('brijnidhi_customer_reviews');
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }

      const storedGuests = localStorage.getItem('brijnidhi_saved_guests');
      if (storedGuests) {
        setSavedGuests(JSON.parse(storedGuests));
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Calculate Profile Completion %
  const calculateProfileCompletion = () => {
    let score = 0;
    if (customer.name) score += 20;
    if (customer.email) score += 20;
    if (customer.phone && customer.phone !== 'Not provided') score += 20;
    if (customer.dob) score += 15;
    if (customer.country) score += 10;
    if (customer.preferredLanguage) score += 15;
    return score;
  };

  const profileCompletion = calculateProfileCompletion();

  // Save Profile edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${editFormData.firstName} ${editFormData.lastName}`.trim() || editFormData.name;
    const updated = {
      ...customer,
      ...editFormData,
      name: fullName
    };
    setCustomer(updated);
    setIsEditingProfile(false);
    setSaveSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);

    // Save to localStorage
    try {
      localStorage.setItem('brijnidhi_current_user', JSON.stringify(updated));
      window.dispatchEvent(new Event('brijnidhi_auth_change'));
    } catch {}
  };

  // Cancel Booking handler
  const handleConfirmCancelBooking = (bookingId: string) => {
    const updated = myBookings.map(b =>
      b.id === bookingId ? { ...b, status: 'CANCELLED' as const, paymentStatus: 'REFUNDED' as const } : b
    );
    setMyBookings(updated);
    localStorage.setItem('brijnidhi_my_bookings', JSON.stringify(updated));
    setCancelModalBooking(null);
    if (selectedBookingForDetails?.id === bookingId) {
      setSelectedBookingForDetails(prev => prev ? { ...prev, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : null);
    }
  };

  // Submit Review handler
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeReviewModalBooking) return;

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      hotelName: writeReviewModalBooking.hotelName,
      destination: writeReviewModalBooking.destination,
      rating: reviewFormData.rating,
      comment: reviewFormData.comment,
      satvikRating: reviewFormData.satvikRating,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const nextReviews = [newRev, ...reviews];
    setReviews(nextReviews);
    localStorage.setItem('brijnidhi_customer_reviews', JSON.stringify(nextReviews));
    setWriteReviewModalBooking(null);
    setReviewFormData({ rating: 5, comment: '', satvikRating: 5 });
  };

  // Add Guest handler
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestForm.name.trim()) return;

    const added: SavedGuest = {
      ...newGuestForm,
      id: `gst-${Date.now()}`
    };
    const nextGuests = [...savedGuests, added];
    setSavedGuests(nextGuests);
    localStorage.setItem('brijnidhi_saved_guests', JSON.stringify(nextGuests));
    setShowAddGuestModal(false);
    setNewGuestForm({ name: '', age: 30, gender: 'Male', relationship: 'Family Devotee' });
  };

  const handleRemoveGuest = (id: string) => {
    const filtered = savedGuests.filter(g => g.id !== id);
    setSavedGuests(filtered);
    localStorage.setItem('brijnidhi_saved_guests', JSON.stringify(filtered));
  };

  // Remove Favorite handler
  const handleRemoveFavorite = (hotelId: string) => {
    const filtered = savedHotels.filter(h => h.id !== hotelId);
    setSavedHotels(filtered);
    localStorage.setItem('brijnidhi_favorite_hotels', JSON.stringify(filtered));
  };

  // Password change handler
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordSuccess('Security password updated successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSuccess(null), 4000);
  };

  // Support ticket handler
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.message.trim()) return;

    const ticket: SupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingRef: newTicketForm.bookingRef || 'General Inquiry',
      subject: newTicketForm.subject,
      category: newTicketForm.category,
      status: 'OPEN',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      message: newTicketForm.message
    };

    setSupportTickets([ticket, ...supportTickets]);
    setShowNewTicketModal(false);
    setNewTicketForm({ bookingRef: '', subject: '', category: 'Booking Query', message: '' });
  };

  // Filter Bookings by tab
  const filteredBookings = myBookings.filter(b => {
    if (bookingFilter === 'UPCOMING') return b.status === 'CONFIRMED';
    if (bookingFilter === 'COMPLETED') return b.status === 'COMPLETED';
    if (bookingFilter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Devotee Header / Overview Card */}
      <div className="bg-gradient-to-r from-amber-800 via-orange-800 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-600/30">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-amber-200/20 backdrop-blur-md overflow-hidden border-2 border-amber-300/60 shadow-inner flex items-center justify-center text-4xl">
              {customer.avatar ? (
                <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
              ) : (
                <span>🙏</span>
              )}
            </div>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-400 text-amber-950 p-1.5 rounded-lg shadow-md cursor-pointer transition"
              title="Change Photo"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">{customer.name}</h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-300" />
                Verified Yatri
              </span>
            </div>
            <p className="text-xs text-amber-100/90 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-amber-300" /> {customer.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-amber-300" /> {customer.phone}</span>
            </p>
            <div className="pt-1.5 flex items-center gap-3 text-xs">
              <span className="text-amber-200/80 font-medium">Profile Completion: <strong className="text-white">{profileCompletion}%</strong></span>
              <div className="w-32 bg-black/30 rounded-full h-2 overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsEditingProfile(true)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl border border-white/20 shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <Link
            href="/stays"
            className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>Book A Stay</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Responsive Sidebar + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="bg-white rounded-3xl p-4 border border-amber-200/80 shadow-sm space-y-1.5 lg:sticky lg:top-24">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1 block">
            Guest Dashboard Menu
          </span>

          {[
            { id: 'profile', label: '1. Profile & Info', icon: User },
            { id: 'bookings', label: '2. My Bookings ⭐', icon: CalendarCheck, badge: myBookings.length },
            { id: 'favorites', label: '3. Saved Hotels ❤️', icon: Heart, badge: savedHotels.length },
            { id: 'reviews', label: '4. My Reviews', icon: Star, badge: reviews.length },
            { id: 'payments', label: '5. Payments & Invoices', icon: CreditCard },
            { id: 'guests', label: '6. Saved Guests', icon: Users, badge: savedGuests.length + 1 },
            { id: 'preferences', label: '7. Preferences', icon: Settings },
            { id: 'security', label: '8. Security & Sessions', icon: Lock },
            { id: 'support', label: '9. Help & Support', icon: HelpCircle, badge: supportTickets.length }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-neutral-700 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-amber-700'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* ================= 1. PROFILE & PERSONAL INFORMATION ================= */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral-100 gap-3">
                <div>
                  <h2 className="text-xl font-black font-serif text-neutral-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-600" />
                    <span>Personal Information</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Manage your personal details for seamless darshan registrations and stay check-ins.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Information Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-1">
                  <span className="text-neutral-400 font-medium text-[11px] block">Full Name</span>
                  <span className="text-sm font-bold text-neutral-900">{customer.name}</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-1">
                  <span className="text-neutral-400 font-medium text-[11px] block">Email Address</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-neutral-900">{customer.email}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Verified</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-1">
                  <span className="text-neutral-400 font-medium text-[11px] block">Mobile Number (WhatsApp)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-neutral-900">{customer.phone}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Verified</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-1">
                  <span className="text-neutral-400 font-medium text-[11px] block">Date of Birth (Optional)</span>
                  <span className="text-sm font-bold text-neutral-900">{customer.dob || 'Not provided'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-1">
                  <span className="text-neutral-400 font-medium text-[11px] block">Preferred Language</span>
                  <span className="text-sm font-bold text-neutral-900">{customer.preferredLanguage}</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-1">
                  <span className="text-neutral-400 font-medium text-[11px] block">Country of Residence</span>
                  <span className="text-sm font-bold text-neutral-900">{customer.country}</span>
                </div>
              </div>

              {/* Devotee Privacy Commitment */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold">Brijnidhi Privacy &amp; Maryada Pledge</h4>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    We collect only the bare essential details needed for verified temple stays and pilgrimage safety. Your contact details are never shared with unauthorized third parties.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. MY BOOKINGS ⭐ ================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Filter Tabs */}
              <div className="bg-white rounded-2xl p-2 border border-amber-200/80 shadow-sm flex space-x-2">
                {[
                  { key: 'UPCOMING', label: 'Upcoming Stays' },
                  { key: 'COMPLETED', label: 'Completed Stays' },
                  { key: 'CANCELLED', label: 'Cancelled Bookings' }
                ].map(sub => (
                  <button
                    key={sub.key}
                    onClick={() => setBookingFilter(sub.key as any)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      bookingFilter === sub.key
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="card-temple p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl font-serif">
                    📜
                  </div>
                  <h3 className="text-xl font-bold font-serif text-neutral-900">
                    No {bookingFilter.toLowerCase()} bookings found
                  </h3>
                  <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                    {bookingFilter === 'UPCOMING'
                      ? 'You do not have any upcoming pilgrimage stays booked right now. Explore verified hotels and serene ashrams in Braj.'
                      : `You have no ${bookingFilter.toLowerCase()} booking records on file.`}
                  </p>
                  <div>
                    <Link href="/stays" className="btn-primary inline-flex text-xs py-2.5 px-6">
                      Explore Verified Braj Stays
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map(b => (
                    <div
                      key={b.id}
                      className="card-temple p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:shadow-md transition"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            {b.bookingReference}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : b.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}>
                            ● {b.status}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                            {b.paymentStatus}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold font-serif text-neutral-900">
                          {b.hotelName}
                        </h3>
                        <p className="text-xs text-neutral-600">
                          <strong className="text-neutral-900">{b.destination}</strong> • {b.room} • {b.guests} Devotees
                        </p>
                        <p className="text-xs text-neutral-600 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Check-in: <strong>{b.checkIn}</strong> → Check-out: <strong>{b.checkOut}</strong></span>
                        </p>
                      </div>

                      <div className="text-left md:text-right shrink-0 space-y-2 w-full md:w-auto">
                        <span className="text-xs text-neutral-400 block font-medium">Final Amount</span>
                        <span className="text-2xl font-black font-serif text-neutral-900 block">
                          ₹{b.totalAmount.toLocaleString('en-IN')}
                        </span>

                        <div className="flex flex-wrap md:justify-end gap-2 pt-1">
                          <button
                            onClick={() => setSelectedBookingForDetails(b)}
                            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => setSelectedInvoice(b)}
                            className="p-2 border border-neutral-300 hover:border-amber-400 text-neutral-700 hover:text-amber-800 rounded-xl transition cursor-pointer"
                            title="Download Tax Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => setCancelModalBooking(b)}
                              className="text-xs text-red-600 hover:text-red-700 px-3 py-2 font-bold hover:bg-red-50 rounded-xl transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          {b.status === 'COMPLETED' && (
                            <button
                              onClick={() => setWriteReviewModalBooking(b)}
                              className="btn-primary text-xs py-2 px-3 flex items-center gap-1"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>Write Review</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 3. SAVED HOTELS ❤️ ================= */}
          {activeTab === 'favorites' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-6">
              <div className="pb-4 border-b border-neutral-100">
                <h2 className="text-xl font-black font-serif text-neutral-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600 fill-red-600" />
                  <span>Saved Stays &amp; Ashrams</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Bookmarked properties for your upcoming Braj Parikrama and darshan trips.
                </p>
              </div>

              {savedHotels.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-2xl">
                    ❤️
                  </div>
                  <h4 className="text-base font-bold text-neutral-800">No saved stays yet</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Click the sacred heart icon on any stay in the catalog to bookmark your favorite retreat.
                  </p>
                  <Link href="/stays" className="btn-primary inline-flex text-xs py-2 px-5">
                    Browse Stays
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedHotels.map(h => (
                    <div key={h.id} className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition">
                      <div className="relative h-40 w-full">
                        <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveFavorite(h.id)}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 p-1.5 rounded-full shadow cursor-pointer transition"
                          title="Remove from saved"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {h.destination}
                        </span>
                        <h4 className="font-bold text-sm text-neutral-900 font-serif line-clamp-1">{h.name}</h4>
                        <p className="text-[11px] text-neutral-500">{h.nearestLandmark}</p>
                        <div className="pt-2 flex justify-between items-center border-t border-neutral-100">
                          <span className="text-sm font-black text-amber-900">₹{h.pricePerNight} <span className="text-[10px] font-normal text-neutral-400">/ night</span></span>
                          <Link href="/stays" className="btn-primary text-[11px] py-1.5 px-3">
                            View &amp; Book
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 4. MY REVIEWS ⭐ ================= */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-6">
              <div className="pb-4 border-b border-neutral-100">
                <h2 className="text-xl font-black font-serif text-neutral-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>My Reviews &amp; Yatri Testimonials</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Your authentic experiences help millions of fellow Braj pilgrims choose verified, peaceful stays.
                </p>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-2xl font-serif">
                    ⭐
                  </div>
                  <h4 className="text-base font-bold text-neutral-800">No reviews written yet</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Reviews can be submitted after completing your pilgrimage stays.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-neutral-900 font-serif text-sm">{r.hotelName}</h4>
                          <span className="text-[10px] text-neutral-400">{r.destination} • {r.date}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-black">
                          <Star className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                          <span>{r.rating}.0</span>
                        </div>
                      </div>
                      <p className="text-neutral-700 leading-relaxed italic">&quot;{r.comment}&quot;</p>
                      <span className="inline-block text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        ✓ 100% Satvik Hospitality: {r.satvikRating}/5
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 5. PAYMENTS & INVOICES 💳 ================= */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-6">
              <div className="pb-4 border-b border-neutral-100">
                <h2 className="text-xl font-black font-serif text-neutral-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span>Payments &amp; Invoices</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Complete transaction history with downloadable tax invoices for all confirmed bookings.
                </p>
              </div>

              {myBookings.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto text-2xl">
                    💳
                  </div>
                  <h4 className="text-base font-bold text-neutral-800">No payment transactions found</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    When you book a stay on Brijnidhi, your transaction receipts and invoices will be stored here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-2">Transaction ID</th>
                        <th className="py-3 px-2">Booking Ref</th>
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Method</th>
                        <th className="py-3 px-2">Amount</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {myBookings.map((b, idx) => (
                        <tr key={b.id} className="hover:bg-neutral-50">
                          <td className="py-3 px-2 font-mono font-bold text-neutral-800">TXN-{b.bookingReference.slice(-6)}</td>
                          <td className="py-3 px-2 font-medium text-amber-900">{b.bookingReference}</td>
                          <td className="py-3 px-2 text-neutral-600">{b.checkIn}</td>
                          <td className="py-3 px-2 text-neutral-600">{b.paymentMethod || 'Instant UPI / QR'}</td>
                          <td className="py-3 px-2 font-bold text-neutral-900">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              b.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {b.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => setSelectedInvoice(b)}
                              className="text-amber-700 font-bold hover:underline flex items-center justify-end gap-1 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= 6. SAVED GUESTS 👥 ================= */}
          {activeTab === 'guests' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-xl font-black font-serif text-neutral-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    <span>Saved Devotee Guests</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Save frequently traveling family and parikrama group members for 1-click booking.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddGuestModal(true)}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Guest</span>
                </button>
              </div>

              {/* Primary Guest Card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-black text-amber-800 block">Primary Account Holder</span>
                  <h4 className="text-sm font-bold text-neutral-900 mt-0.5">{customer.name} (Self)</h4>
                  <p className="text-neutral-600 text-[11px]">{customer.phone} • {customer.email}</p>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black">PRIMARY</span>
              </div>

              {/* Saved Co-Yatris List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Co-Yatris &amp; Family Members</h4>
                {savedGuests.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No additional guests saved yet.</p>
                ) : (
                  savedGuests.map(g => (
                    <div key={g.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-neutral-900">{g.name}</h4>
                        <p className="text-neutral-500 text-[11px]">
                          {g.relationship} • {g.gender}, Age {g.age}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveGuest(g.id)}
                        className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-white transition cursor-pointer"
                        title="Remove guest"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= 7. PREFERENCES ⚙️ ================= */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-6">
              <div className="pb-4 border-b border-neutral-100">
                <h2 className="text-xl font-black font-serif text-neutral-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-600" />
                  <span>Preferences &amp; Notifications</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Configure your communication languages, currency display, and stay reminders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Preferred Language</label>
                  <select
                    value={preferences.language}
                    onChange={e => setPreferences({ ...preferences, language: e.target.value })}
                    className="w-full p-3 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                    <option value="English">English</option>
                    <option value="Gujarati (ગુજરાતી)">Gujarati (ગુજરાતી)</option>
                    <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                    <option value="Marathi (मराठी)">Marathi (मराठी)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Currency Display</label>
                  <select
                    value={preferences.currency}
                    onChange={e => setPreferences({ ...preferences, currency: e.target.value })}
                    className="w-full p-3 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="INR (₹)">Indian Rupee (INR ₹)</option>
                    <option value="USD ($)">US Dollar (USD $)</option>
                    <option value="EUR (€)">Euro (EUR €)</option>
                  </select>
                </div>
              </div>

              {/* Notification Checkboxes */}
              <div className="pt-2 space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Yatri Notifications</h4>
                <div className="space-y-2.5 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.bookingConfirmation}
                      onChange={e => setPreferences({ ...preferences, bookingConfirmation: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-neutral-700 font-medium">Instant Booking Confirmation via SMS &amp; WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.bookingReminders}
                      onChange={e => setPreferences({ ...preferences, bookingReminders: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-neutral-700 font-medium">24-hour Check-in &amp; Temple Aarti Timings Reminders</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.cancellationUpdates}
                      onChange={e => setPreferences({ ...preferences, cancellationUpdates: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-neutral-700 font-medium">Cancellation &amp; Instant Refund Status Updates</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.festivalDarshanAlerts}
                      onChange={e => setPreferences({ ...preferences, festivalDarshanAlerts: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-neutral-700 font-medium">Braj Festival &amp; Ekadashi Special Darshan Schedule Alerts</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.promotionalOffers}
                      onChange={e => setPreferences({ ...preferences, promotionalOffers: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-neutral-700 font-medium">Pilgrimage Group &amp; Ashram Seva Discounts</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSaveSuccessMsg('Preferences saved successfully!');
                    setTimeout(() => setSaveSuccessMsg(null), 3000);
                  }}
                  className="btn-primary text-xs py-2.5 px-6"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ================= 8. SECURITY & SESSIONS 🔐 ================= */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-6">
              <div className="pb-4 border-b border-neutral-100">
                <h2 className="text-xl font-black font-serif text-neutral-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <span>Security &amp; Active Sessions</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Protect your devotee account credentials and active mobile sessions.
                </p>
              </div>

              {passwordSuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="bg-red-50 border border-red-300 text-red-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Change Password Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md text-xs">
                <h4 className="font-bold text-neutral-800 uppercase tracking-wider">Change Password</h4>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary text-xs py-2 px-5">
                  Update Password
                </button>
              </form>

              {/* Login Sessions */}
              <div className="pt-4 border-t border-neutral-100 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-neutral-800 uppercase tracking-wider">Active Login Sessions</h4>
                  <button
                    onClick={() => alert('Logged out from all other devices.')}
                    className="text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                  >
                    Logout from all devices
                  </button>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="font-bold text-neutral-900 block">Chrome on Windows (Current Session)</span>
                    <span className="text-[11px] text-neutral-500">Vrindavan / Mathura • IP 127.0.0.1</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active Now</span>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="font-bold text-neutral-900 block">Brijnidhi Mobile App (Android)</span>
                    <span className="text-[11px] text-neutral-500">New Delhi • Last active yesterday</span>
                  </div>
                  <span className="text-[10px] bg-neutral-200 text-neutral-700 font-bold px-2 py-0.5 rounded">2d ago</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= 9. HELP & SUPPORT 🆘 ================= */}
          {activeTab === 'support' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-xl font-black font-serif text-neutral-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-600" />
                    <span>Help &amp; Support Requests</span>
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Connect directly with our 24x7 Braj Yatri Seva Kendra for booking or pilgrimage assistance.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewTicketModal(true)}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Open Ticket</span>
                </button>
              </div>

              {/* Dedicated 24x7 Helpline Banner */}
              <div className="p-5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 rounded-2xl border border-amber-300 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 text-sm font-serif">
                    <span>🦚 24x7 Braj Pilgrimage Support Desk</span>
                  </span>
                  <p className="text-neutral-700 text-[11px]">
                    Direct telephone assistance for temple darshan rules, emergency transport, and booking inquiries.
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="tel:+919876543210"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 98765 43210</span>
                  </a>
                </div>
              </div>

              {/* Support Tickets List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">My Support Tickets</h4>
                {supportTickets.map(t => (
                  <div key={t.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px]">{t.id}</span>
                        <span className="font-bold text-neutral-900">{t.subject}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        ● {t.status}
                      </span>
                    </div>
                    <p className="text-neutral-600 text-[11px] leading-relaxed">{t.message}</p>
                    <span className="text-[10px] text-neutral-400 block pt-1">{t.category} • Ref: {t.bookingRef} • {t.date}</span>
                  </div>
                ))}
              </div>

              {/* FAQs Accordion */}
              <div className="pt-4 border-t border-neutral-100 space-y-3 text-xs">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Frequently Asked Questions</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                    <strong className="text-neutral-900 block font-semibold mb-0.5">What is Brijnidhi&apos;s 100% Satvik Food Policy?</strong>
                    <p className="text-neutral-600 text-[11px]">All listed properties strictly serve pure vegetarian meals with zero onion, zero garlic, and absolute prohibition of alcohol or tobacco on premises.</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                    <strong className="text-neutral-900 block font-semibold mb-0.5">How do I get Temple Darshan Assistance?</strong>
                    <p className="text-neutral-600 text-[11px]">When booking, simply check the &quot;Temple Darshan Assistance&quot; add-on. The hotel front desk will arrange local e-rickshaw guidance and queue passes.</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                    <strong className="text-neutral-900 block font-semibold mb-0.5">What is the cancellation and refund timeline?</strong>
                    <p className="text-neutral-600 text-[11px]">Cancellations requested 24 hours prior to check-in receive an instant 100% refund processed back to the original UPI / bank method within 2-4 hours.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: EDIT PROFILE ================= */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-amber-200 my-8 space-y-5">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 bg-neutral-100 rounded-full p-1.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-xl font-bold font-serif text-neutral-900">Edit Personal Profile</h3>
              <p className="text-xs text-neutral-500">Update your official pilgrim details.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={e => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={e => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Mobile Number (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={editFormData.phone}
                  onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    value={editFormData.dob}
                    onChange={e => setEditFormData({ ...editFormData, dob: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={editFormData.country}
                    onChange={e => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2.5 px-6"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BOOKING DETAILS DRAWER ================= */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border-2 border-amber-300 my-8 space-y-5">
            <button
              onClick={() => setSelectedBookingForDetails(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 bg-neutral-100 rounded-full p-1.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-neutral-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Booking Details &amp; Yatri Pass
              </span>
              <h3 className="text-2xl font-black font-serif text-neutral-900 mt-2">
                {selectedBookingForDetails.hotelName}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {selectedBookingForDetails.address || `Near Temple Sanctum, ${selectedBookingForDetails.destination}`}
              </p>
            </div>

            {/* Stay Summary Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Booking ID</span>
                <span className="font-mono font-bold text-amber-900">{selectedBookingForDetails.bookingReference}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Booking Status</span>
                <span className="font-bold text-emerald-700">● {selectedBookingForDetails.status}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Check-in Date</span>
                <span className="font-bold text-neutral-900">{selectedBookingForDetails.checkIn}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Check-out Date</span>
                <span className="font-bold text-neutral-900">{selectedBookingForDetails.checkOut}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Room Category</span>
                <span className="font-bold text-neutral-900">{selectedBookingForDetails.room}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Devotee Guests</span>
                <span className="font-bold text-neutral-900">{selectedBookingForDetails.guests} Yatris</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 text-xs border-t border-neutral-100 pt-3">
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">Price Breakdown</h4>
              <div className="flex justify-between text-neutral-600">
                <span>Room Charges:</span>
                <span>₹{(selectedBookingForDetails.roomCharges || selectedBookingForDetails.totalAmount * 0.88).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Pilgrimage GST (12%):</span>
                <span>₹{(selectedBookingForDetails.taxAmount || selectedBookingForDetails.totalAmount * 0.12).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-neutral-900 border-t border-neutral-200 pt-2">
                <span>Final Paid Amount:</span>
                <span className="text-amber-800">₹{selectedBookingForDetails.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950">
              <strong>Cancellation Policy:</strong> {selectedBookingForDetails.cancellationPolicy || '100% refund available up to 24 hours prior to check-in.'}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  setSelectedInvoice(selectedBookingForDetails);
                  setSelectedBookingForDetails(null);
                }}
                className="py-2.5 px-3 bg-neutral-900 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Invoice</span>
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBookingForDetails.hotelName + ' ' + selectedBookingForDetails.destination)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Directions</span>
              </a>
              <a
                href={`tel:${selectedBookingForDetails.hotelPhone || '+919876543210'}`}
                className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Hotel</span>
              </a>
              {selectedBookingForDetails.status === 'CONFIRMED' && (
                <button
                  onClick={() => {
                    setCancelModalBooking(selectedBookingForDetails);
                    setSelectedBookingForDetails(null);
                  }}
                  className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAX INVOICE ================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl relative border-2 border-amber-400 my-8 space-y-6">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 bg-neutral-100 rounded-full p-1.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Invoice Header */}
            <div className="border-b-2 border-dashed border-amber-300 pb-4 text-center space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-800">
                🕉️ BRIJNIDHI PILGRIMAGE HOSPITALITY
              </span>
              <h2 className="text-2xl font-black font-serif text-neutral-900">TAX INVOICE &amp; YATRI PASS</h2>
              <p className="text-[11px] text-neutral-500">GSTIN: 09AAACB1080P1Z4 • Raman Reti, Vrindavan, UP</p>
            </div>

            {/* Bill To & Stay Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">Billed To:</span>
                <p className="font-bold text-neutral-900">{customer.name}</p>
                <p className="text-neutral-600">{customer.email}</p>
                <p className="text-neutral-600">{customer.phone}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">Invoice Ref:</span>
                <p className="font-mono font-bold text-amber-900">{selectedInvoice.bookingReference}</p>
                <p className="text-neutral-600">Date: {selectedInvoice.checkIn}</p>
                <p className="text-emerald-700 font-bold">Status: PAID (UPI)</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-neutral-100 p-2.5 font-bold text-neutral-700 grid grid-cols-3">
                <span className="col-span-2">Description</span>
                <span className="text-right">Amount (₹)</span>
              </div>
              <div className="p-3 divide-y divide-neutral-100 space-y-2">
                <div className="grid grid-cols-3 pt-1">
                  <div className="col-span-2">
                    <strong className="block text-neutral-900">{selectedInvoice.hotelName} ({selectedInvoice.room})</strong>
                    <span className="text-[10px] text-neutral-500">Check-in: {selectedInvoice.checkIn} to {selectedInvoice.checkOut} ({selectedInvoice.guests} Yatris)</span>
                  </div>
                  <span className="text-right font-medium">₹{(selectedInvoice.totalAmount * 0.88).toFixed(0)}</span>
                </div>
                <div className="grid grid-cols-3 pt-2 text-neutral-600">
                  <span className="col-span-2">Braj Pilgrimage GST (12%)</span>
                  <span className="text-right">₹{(selectedInvoice.totalAmount * 0.12).toFixed(0)}</span>
                </div>
                <div className="grid grid-cols-3 pt-2 font-bold text-sm text-neutral-900">
                  <span className="col-span-2">Total Amount Paid</span>
                  <span className="text-right text-amber-800">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-amber-900 leading-relaxed text-center">
              🙏 Thank you for traveling with Brijnidhi. May Shri Radha Rani &amp; Shri Banke Bihari shower boundless blessings on your holy yatra.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CANCEL BOOKING ================= */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-red-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h3 className="text-xl font-bold font-serif text-neutral-900">
              Cancel Booking at {cancelModalBooking.hotelName}?
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Booking Ref: <strong className="text-neutral-900">{cancelModalBooking.bookingReference}</strong>.
              According to the hotel policy, 100% of ₹{cancelModalBooking.totalAmount.toLocaleString('en-IN')} will be refunded immediately back to your original payment method.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleConfirmCancelBooking(cancelModalBooking.id)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: WRITE REVIEW ================= */}
      {writeReviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-amber-300 space-y-4">
            <button
              onClick={() => setWriteReviewModalBooking(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 bg-neutral-100 rounded-full p-1.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-lg font-bold font-serif text-neutral-900">
                Review {writeReviewModalBooking.hotelName}
              </h3>
              <p className="text-xs text-neutral-500">How was your stay in {writeReviewModalBooking.destination}?</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Overall Pilgrim Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                      className="cursor-pointer focus:outline-none"
                    >
                      <Star className={`w-7 h-7 ${star <= reviewFormData.rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Satvik Purity &amp; Food Quality</label>
                <select
                  value={reviewFormData.satvikRating}
                  onChange={e => setReviewFormData({ ...reviewFormData, satvikRating: Number(e.target.value) })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white outline-none"
                >
                  <option value={5}>5 - Excellent 100% Satvik Maryada</option>
                  <option value={4}>4 - Very Good &amp; Pious</option>
                  <option value={3}>3 - Average</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Write your review / yatri feedback</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details about cleanliness, closeness to temple, and satvik food..."
                  value={reviewFormData.comment}
                  onChange={e => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWriteReviewModalBooking(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2.5 px-6">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD GUEST ================= */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-amber-300 space-y-4">
            <button
              onClick={() => setShowAddGuestModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 bg-neutral-100 rounded-full p-1.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-lg font-bold font-serif text-neutral-900">Add Co-Yatri / Guest</h3>
              <p className="text-xs text-neutral-500">Save family member for faster booking.</p>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radheshyam Sharma"
                  value={newGuestForm.name}
                  onChange={e => setNewGuestForm({ ...newGuestForm, name: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={newGuestForm.age}
                    onChange={e => setNewGuestForm({ ...newGuestForm, age: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Gender</label>
                  <select
                    value={newGuestForm.gender}
                    onChange={e => setNewGuestForm({ ...newGuestForm, gender: e.target.value as any })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Relationship</label>
                <select
                  value={newGuestForm.relationship}
                  onChange={e => setNewGuestForm({ ...newGuestForm, relationship: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white outline-none"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Family Devotee">Devotee Friend / Other</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2.5 px-6">
                  Save Devotee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEW SUPPORT TICKET ================= */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-amber-300 space-y-4">
            <button
              onClick={() => setShowNewTicketModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 bg-neutral-100 rounded-full p-1.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-lg font-bold font-serif text-neutral-900">Open Support Request</h3>
              <p className="text-xs text-neutral-500">Our yatri desk will respond within 2 hours.</p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Related Booking (Optional)</label>
                <select
                  value={newTicketForm.bookingRef}
                  onChange={e => setNewTicketForm({ ...newTicketForm, bookingRef: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white outline-none"
                >
                  <option value="">General Inquiry / No Booking</option>
                  {myBookings.map(b => (
                    <option key={b.id} value={b.bookingReference}>
                      {b.bookingReference} — {b.hotelName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Support Category</label>
                <select
                  value={newTicketForm.category}
                  onChange={e => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white outline-none"
                >
                  <option value="Booking Query">Booking Query</option>
                  <option value="Payment / Refund">Payment / Refund Issue</option>
                  <option value="Temple Darshan Assistance">Temple Darshan Guidance</option>
                  <option value="Cancellation Issue">Cancellation Issue</option>
                  <option value="Special Pilgrimage Assistance">Elderly / Divyang Seva</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Requesting early luggage drop-off"
                  value={newTicketForm.subject}
                  onChange={e => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Message Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe your query in detail..."
                  value={newTicketForm.message}
                  onChange={e => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2.5 px-6">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
