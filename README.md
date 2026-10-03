# Brijnidhi — Braj Hotel & Stay Platform 🦚🕉️

A dedicated spiritual tourism and accommodation platform tailored specifically to **Braj Bhumi** (Mathura, Vrindavan, Barsana, and Govardhan), built with **TypeScript**, **Next.js**, **Tailwind CSS**, and **Express.js**.

---

## 🏛️ Platform Architecture: The Braj Triad & 3-Tier Role Governance

```text
                         BRIJNIDHI
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
        SYSTEM ADMIN     HOTEL ADMIN       CUSTOMER
             │               │                │
       Entire platform    Own hotel(s)      Booking & Yatra
             │               │                │
       ┌─────┴─────┐    ┌────┴─────┐     ┌────┴─────┐
       │           │    │          │     │          │
     Users      Hotels Rooms     Bookings Search    Reviews
     Hotels     Owners Pricing   Guests   Hotels   Favorites
     Bookings   Payments          Offers
     Payments   Reviews
     Reports    AuditLogs
```

### Management Roles & Dedicated Portals

1. **System Admin (`/admin`)**:
   - Platform-wide control across all Braj properties.
   - Review and approve/reject new property applications (`SUBMITTED` -> `APPROVED` / `REJECTED`).
   - Manage users, create/suspend hotel admins, oversee platform revenue and 10% marketplace commission.
   - Immutable security audit logs (`AuditLog`) tracking all sensitive operations.

2. **Hotel Admin / Property Owner (`/hotel-admin`)**:
   - Strict data isolation: manages **only assigned hotel(s)** and cannot access another hotel's data.
   - Real-time operations: Today's Bookings (14), Available Rooms (27), Occupied Rooms (18), Today's Revenue (₹32,400), Pending Check-ins (6).
   - Complete Room Inventory (Standard, Deluxe, Premium, Family Suite) with weekday & weekend pricing.
   - **Interactive October 2026 Availability Calendar:** Direct occupancy matrix ('B' = Booked, '-' = Available) with click-to-toggle availability.
   - Reservation check-in / check-out workflows and voucher printing.

3. **Customer / Yatri Portal (`/account` & `/stays`)**:
   - Browse sacred stays near key landmarks in Mathura, Vrindavan, Barsana, and Govardhan.
   - Dedicated pilgrimage add-ons (Darshan passes, 21-km Parikrama electric rickshaws, Satvik meals).
   - View booking confirmation vouchers, receipts, and saved properties.

4. **Hotel Onboarding Wizard (`/list-property`)**:
   - 7-Step structured property onboarding:
     - Step 1: Hotel Information & 100% Satvik Kitchen Pledge
     - Step 2: Physical Address & Nearest Temple Walking Distance
     - Step 3: Trade License & FSSAI Satvik Certification
     - Step 4: Room Categories & Inventory
     - Step 5: Pricing & Weekend Rates
     - Step 6: Property Photos
     - Step 7: Submission to System Admin Review Queue


---

## 📁 Repository Structure

```
brijnidhi/
├── backend/                  # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── data/
│   │   │   ├── destinations.ts   # Mathura, Vrindavan, Barsana, Govardhan data
│   │   │   ├── hotels.ts         # Verified stays, landmark distances, satvik info
│   │   │   └── experiences.ts    # Darshan, Aarti timings, Parikrama guides
│   │   ├── routes/
│   │   │   ├── destinationRoutes.ts  # /api/destinations
│   │   │   ├── hotelRoutes.ts        # /api/hotels (with distance & landmark filters)
│   │   │   ├── experienceRoutes.ts   # /api/experiences
│   │   │   └── bookingRoutes.ts      # /api/bookings (pilgrimage add-ons calculation)
│   │   ├── types/
│   │   │   └── index.ts          # Shared TypeScript interfaces
│   │   └── index.ts              # Express API Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                 # Next.js (App Router) + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                # Global layout with Navbar & Footer
│   │   │   ├── page.tsx                  # Homepage (matches exact ASCII concept)
│   │   │   ├── globals.css               # Braj theme colors & styling
│   │   │   ├── brijnidhi/[slug]/page.tsx # Dedicated destination landing experience
│   │   │   │                             # (/brijnidhi/vrindavan, /brijnidhi/mathura,
│   │   │   │                             #  /brijnidhi/barsana, /brijnidhi/govardhan)
│   │   │   ├── destinations/
│   │   │   │   ├── page.tsx              # Destinations hub
│   │   │   │   └── [slug]/page.tsx       # Alias route
│   │   │   ├── stays/
│   │   │   │   ├── page.tsx              # Stays catalogue with live filters
│   │   │   │   └── [id]/page.tsx         # Stay details & room booking
│   │   │   ├── experiences/
│   │   │   │   └── page.tsx              # Temple Darshan & Parikrama guides
│   │   │   └── offers/
│   │   │       └── page.tsx              # Yatri pilgrimage discount packages
│   │   ├── components/
│   │   │   ├── Navbar.tsx                # Top helpline, login modal & nav
│   │   │   ├── Footer.tsx                # Braj helpline, ethics & destinations
│   │   │   ├── HeroSearch.tsx            # Where are you going, check-in/out, guests
│   │   │   ├── DestinationCard.tsx       # Holy abode image cards with stay counts
│   │   │   ├── HotelCard.tsx             # Distance-to-temple, satvik badges, pricing
│   │   │   ├── FilterSidebar.tsx         # Proximity, price slider, rating, satvik
│   │   │   ├── BookingModal.tsx          # Interactive booking flow + add-ons
│   │   │   ├── ExperienceCard.tsx        # Aarti, Parikrama & boat cards
│   │   │   └── DarshanScheduleModal.tsx  # Live temple darshan & aarti schedules
│   │   ├── lib/
│   │   │   ├── api.ts                    # Backend API client with offline fallback
│   │   │   └── data.ts                   # Comprehensive local Braj dataset
│   │   └── types/
│   │       └── index.ts                  # TypeScript types
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── next.config.mjs
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Running the Backend (Express + TypeScript)

```bash
cd backend
npm install
npm run dev
```

The API service runs on `http://localhost:5000` with:
- `GET /api/destinations` — All Braj destinations with landmarks and timings
- `GET /api/destinations/:slug` — Individual destination details
- `GET /api/hotels` — Filterable by `destination`, `landmark`, `stayType`, `minPrice`, `maxPrice`, `pureSatvik`, etc.
- `GET /api/hotels/:idOrSlug` — Complete hotel details with room inventory
- `GET /api/experiences` — Darshan schedules, Govardhan Parikrama, and Yamuna aartis
- `POST /api/bookings` — Create reservation with reference code (e.g. `BN-VRN-84920`) and pilgrimage add-ons

### 2. Running the Frontend (Next.js + TypeScript + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The frontend features an **automatic offline fallback**: if the backend server is not running, the frontend gracefully loads all rich Braj destinations, hotels, and booking simulations locally with zero configuration required!

---

## 🛕 Destination Pages Built In

As requested in your specification:
- `/brijnidhi/vrindavan` — Stay near Banke Bihari, Prem Mandir, ISKCON, Yamuna Keshi Ghat, Nidhivan
- `/brijnidhi/mathura` — Stay near Shri Krishna Janmasthan, Vishram Ghat, Dwarkadhish Mandir
- `/brijnidhi/barsana` — Stay near Radha Rani Mandir (Shriji), Rangeeli Mahal, Maan Mandir
- `/brijnidhi/govardhan` — Stay on the 21-km Parikrama route, Dan Ghati Mandir, Radha Kund

---

## 🌸 Braj-Specific Features

1. **Walking Distance to Sanctums:** Every hotel card clearly mentions exact walking minutes and distance in meters (e.g., `180m from Banke Bihari Temple`).
2. **100% Satvik Kitchen Verification:** Strict verification that stays serve pure vegetarian food prepared without onions and garlic.
3. **Pilgrimage Add-Ons:**
   - Temple Darshan & Luggage Locker Assistance (essential for Janmasthan security).
   - Dedicated 21-km Govardhan Parikrama Electric Rickshaw pre-booking.
   - Pure Desi Ghee Satvik Bhojan Thali.
4. **Live Temple Timings:** Comprehensive summer and winter darshan & aarti schedules for major temples.
#   b r a j _ H o t e l  
 