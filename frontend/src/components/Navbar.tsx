'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  Phone,
  User,
  Calendar,
  Compass,
  Menu,
  X,
  Building2,
  ShieldAlert,
  ChevronDown,
  LogOut
} from 'lucide-react';
import LoginModal from './LoginModal';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  React.useEffect(() => {
    const checkAuth = () => {
      const loggedIn = typeof window !== 'undefined' && localStorage.getItem('brijnidhi_logged_in') === 'true';
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        try {
          const userStr = localStorage.getItem('brijnidhi_current_user');
          if (userStr) setCurrentUser(JSON.parse(userStr));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    checkAuth();
    window.addEventListener('brijnidhi_auth_change', checkAuth);
    return () => window.removeEventListener('brijnidhi_auth_change', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('brijnidhi_logged_in');
    localStorage.removeItem('brijnidhi_current_user');
    localStorage.removeItem('brijnidhi_token');
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.dispatchEvent(new Event('brijnidhi_auth_change'));
  };

  const navLinks = [
    { name: 'Stays', href: '/stays' },
    { name: 'Destinations', href: '/destinations' },
    { name: 'Experiences & Darshan', href: '/experiences' },
    { name: 'Offers', href: '/offers' },
  ];

  return (
    <>
      {/* Top Banner - Braj Welcome & Helpline */}
      <div className="bg-amber-950 text-amber-100 text-xs px-4 py-1.5 flex flex-wrap justify-between items-center border-b border-amber-900 gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-amber-300">🌸 Radhe Radhe!</span>
          <span className="hidden sm:inline">Dedicated Braj Pilgrimage Platform</span>
        </div>

        {/* Helpline & List Property */}
        <div className="flex items-center space-x-4 text-[11px]">
          {!isLoggedIn && (
            <Link
              href="/list-property"
              className="hidden sm:inline-flex items-center text-amber-300 hover:text-white font-bold transition-colors"
            >
              <Building2 className="w-3 h-3 mr-1 text-amber-400" />
              List Your Property
            </Link>
          )}

          <a href="tel:+919876543210" className="hidden lg:flex items-center hover:text-amber-200 transition-colors">
            <Phone className="w-3 h-3 mr-1 text-amber-400" />
            <span>Yatri Helpline: +91 98765 43210</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white text-2xl font-serif">🕉️</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black tracking-wider text-neutral-900 font-serif">
                    BRIJ<span className="text-amber-600">NIDHI</span>
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-amber-800/80 font-medium">
                  Braj Stays &amp; Pilgrimage Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-amber-700 bg-amber-50/80'
                        : 'text-neutral-700 hover:text-amber-700 hover:bg-neutral-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {!isLoggedIn && (
                <Link
                  href="/list-property"
                  className="text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition"
                >
                  List Property
                </Link>
              )}

              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/account"
                    className="flex items-center text-xs font-bold text-amber-950 bg-amber-100/70 hover:bg-amber-100 border border-amber-300 px-3 py-2 rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                    <span>🙏 {currentUser?.name ? currentUser.name.split(' ')[0] : 'Devotee'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center text-xs font-bold text-amber-900 hover:text-amber-700 bg-white hover:bg-amber-50 border border-amber-300 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  <span>Sign In</span>
                </button>
              )}

              <Link
                href="/stays"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
              >
                Book A Stay
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-amber-100 bg-white px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-neutral-800 hover:bg-amber-50 hover:text-amber-800"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              {!isLoggedIn && (
                <Link
                  href="/list-property"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-amber-800 font-bold"
                >
                  🏨 List Your Property
                </Link>
              )}
              <Link
                href="/hotel-admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-neutral-700 font-medium"
              >
                🔑 Hotel Admin Portal (/hotel-admin)
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-neutral-700 font-medium"
              >
                🛡️ System Admin Portal (/admin)
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-amber-900 font-bold bg-amber-50 rounded-xl"
                  >
                    🙏 {currentUser?.name || 'Devotee'} (My Bookings)
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-red-700 font-medium flex items-center space-x-1.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLoginModal(true);
                  }}
                  className="w-full text-left px-3 py-2 text-amber-800 font-bold bg-amber-50 rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Devotee Sign In</span>
                </button>
              )}

              <Link
                href="/stays"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-amber-600 text-white font-bold py-2.5 rounded-xl"
              >
                Book Stay in Braj
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Devotee Sign In Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
