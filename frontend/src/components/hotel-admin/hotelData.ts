import { HotelPMSProperty } from './types';

export const BRAJ_HOTEL_PROPERTIES: HotelPMSProperty[] = [
  {
    id: 'prop-vrn-01',
    propertyCode: 'VRN-01',
    name: 'Brijnidhi Braj Dham Heritage Suites',
    destination: 'Vrindavan',
    destinationHindi: 'श्री वृन्दावन धाम',
    address: 'Near Raman Reti, Parikrama Marg, Vrindavan, Mathura, UP - 281121',
    nearestLandmark: 'Overlooking Bankey Bihari & Prem Mandir',
    contactPhone: '+91 98765 43210',
    contactEmail: 'reception@brijnidhi.org',
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    satvikCertified: true,
    amenities: [
      '100% Satvik Pure Veg Kitchen',
      '24x7 Hot Water Geyser',
      'Free Wi-Fi',
      'VIP Temple Darshan Desk',
      'Yamuna Aarti Escort'
    ],
    policies: 'Strictly Satvik pure vegetarian (no onion, no garlic). Alcohol and tobacco strictly forbidden on premises.',
    staff: [
      {
        id: 'op-vrn-3',
        pin: '3885',
        name: 'Amit Verma',
        role: 'Night Auditor',
        shift: 'Night Audit (22:00 - 06:00)',
        hotelId: 'prop-vrn-01',
        hotelName: 'Brijnidhi Braj Dham Heritage Suites'
      },
      {
        id: 'op-vrn-1',
        pin: '1001',
        name: 'Rakesh Sharma',
        role: 'Desk Lead',
        shift: 'Morning (06:00 - 14:00)',
        hotelId: 'prop-vrn-01',
        hotelName: 'Brijnidhi Braj Dham Heritage Suites'
      },
      {
        id: 'op-vrn-2',
        pin: '2002',
        name: 'Priya Goswami',
        role: 'Front Desk Agent',
        shift: 'Evening (14:00 - 22:00)',
        hotelId: 'prop-vrn-01',
        hotelName: 'Brijnidhi Braj Dham Heritage Suites'
      }
    ],
    initialRooms: [
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
        currentBookingId: 'bk-vrn-102',
        guestName: 'Gaurav Sharma',
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
        basePrice: 2400,
        status: 'OCCUPIED',
        currentBookingId: 'bk-vrn-202',
        guestName: 'Ananya Trivedi',
        isEmergencyLocked: false,
        tags: ['Balcony', 'Garden View'],
        lastCleanedAt: 'Today, 08:00 AM'
      },
      {
        id: 'rm-203',
        roomNumber: '203',
        floor: 2,
        category: 'Executive Suite',
        basePrice: 3500,
        status: 'BLOCKED',
        isEmergencyLocked: true,
        lockReason: 'Geyser Pipeline Repair',
        tags: ['Corner Suite', 'High Speed Wi-Fi'],
        lastCleanedAt: 'Maintenance Hold'
      }
    ],
    initialBookings: [
      {
        id: 'bk-vrn-102',
        bookingReference: 'BN-VRN-884',
        customer: 'Gaurav Sharma',
        phone: '+91 98765 11223',
        idProofType: 'Aadhaar',
        idProofNumber: '•••• •••• 8492',
        guestCity: 'Jaipur, RJ',
        roomId: 'rm-102',
        roomNumber: '102',
        checkIn: '2026-10-15',
        checkOut: '2026-10-18',
        guests: 2,
        roomRate: 2400,
        bookingStatus: 'CHECKED_IN',
        specialRequests: 'Elderly parents traveling. Request quiet room close to elevator.',
        ocrExtracted: true
      },
      {
        id: 'bk-vrn-202',
        bookingReference: 'BN-VRN-912',
        customer: 'Ananya Trivedi',
        phone: '+91 98111 22334',
        idProofType: 'Passport',
        idProofNumber: 'P••••9482',
        guestCity: 'Ahmedabad, GJ',
        roomId: 'rm-202',
        roomNumber: '202',
        checkIn: '2026-10-16',
        checkOut: '2026-10-19',
        guests: 3,
        roomRate: 2400,
        bookingStatus: 'CHECKED_IN',
        specialRequests: 'Needs extra bedding and 2 VIP Darshan passes for Bankey Bihari.',
        ocrExtracted: true
      },
      {
        id: 'bk-vrn-701',
        bookingReference: 'YATRA-701',
        customer: 'Radheshyam Agarwal',
        phone: '+91 94140 98765',
        idProofType: 'Aadhaar',
        idProofNumber: '•••• •••• 1081',
        guestCity: 'Indore, MP',
        roomId: 'rm-101',
        roomNumber: '101',
        checkIn: '2026-10-16',
        checkOut: '2026-10-17',
        guests: 2,
        roomRate: 1800,
        bookingStatus: 'CONFIRMED',
        specialRequests: 'Early check-in requested for morning Mangala Aarti.',
        ocrExtracted: false
      }
    ],
    initialTasks: [
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
    ],
    initialTickets: [
      {
        id: 'tkt-203',
        roomNumber: '203',
        category: 'Plumbing / Geyser',
        description: 'Hot water geyser pressure valve leaking. Needs gasket replacement.',
        urgency: 'Urgent',
        reportedAt: '10:00 AM',
        assignedTechnician: 'Mukesh Sharma (Sr. Technician)',
        status: 'In Progress'
      }
    ],
    initialShift: {
      operatorId: 'op-vrn-3',
      operatorName: 'Amit Verma',
      shiftType: 'Night Audit (22:00 - 06:00)',
      openedAt: '22:00 PM',
      openingFloat: 5000,
      cashCollections: 4200,
      digitalCollections: 7500,
      cashPayouts: 300,
      actualDrawerCount: 8900,
      discrepancy: 0,
      isClosed: false
    }
  },

  {
    id: 'prop-vrn-02',
    propertyCode: 'VRN-02',
    name: 'Shri Radha Vallabh Sewa Ashram',
    destination: 'Vrindavan',
    destinationHindi: 'श्री वृन्दावन धाम',
    address: 'Keshi Ghat Marg, Near Nidhivan Sanctum, Vrindavan, UP - 281121',
    nearestLandmark: '60m from Yamuna Keshi Ghat & Nidhivan',
    contactPhone: '+91 94123 45678',
    contactEmail: 'ashram@radhavallabh.org',
    checkInTime: '11:00 AM',
    checkOutTime: '10:00 AM',
    satvikCertified: true,
    amenities: [
      'Pure Desi Ghee Annakshetra',
      'Daily Yamuna Sandhya Aarti Escort',
      'Satsang Hall',
      'Geyser & RO Water'
    ],
    policies: 'Spiritual ashram decorum strictly maintained. Silent hours from 10:00 PM to 04:30 AM.',
    staff: [
      {
        id: 'op-rv-1',
        pin: '4101',
        name: 'Mahant Govind Das',
        role: 'Ashram Lead',
        shift: 'Morning (06:00 - 14:00)',
        hotelId: 'prop-vrn-02',
        hotelName: 'Shri Radha Vallabh Sewa Ashram'
      },
      {
        id: 'op-rv-2',
        pin: '4202',
        name: 'Ram Charan Sevak',
        role: 'Front Desk Agent',
        shift: 'Evening (14:00 - 22:00)',
        hotelId: 'prop-vrn-02',
        hotelName: 'Shri Radha Vallabh Sewa Ashram'
      },
      {
        id: 'op-rv-3',
        pin: '4303',
        name: 'Balram Mishra',
        role: 'Night Caretaker',
        shift: 'Night Audit (22:00 - 06:00)',
        hotelId: 'prop-vrn-02',
        hotelName: 'Shri Radha Vallabh Sewa Ashram'
      }
    ],
    initialRooms: [
      {
        id: 'rm-rv-101',
        roomNumber: 'Kutir 101',
        floor: 1,
        category: 'Standard AC',
        basePrice: 1200,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Ground Floor', 'Courtyard View'],
        lastCleanedAt: 'Today, 07:00 AM'
      },
      {
        id: 'rm-rv-102',
        roomNumber: 'Kutir 102',
        floor: 1,
        category: 'Deluxe AC',
        basePrice: 1600,
        status: 'OCCUPIED',
        currentBookingId: 'bk-rv-401',
        guestName: 'Murli Manohar Shastri',
        isEmergencyLocked: false,
        tags: ['River Breeze', 'Twin Bed'],
        lastCleanedAt: 'Yesterday, 06:00 PM'
      },
      {
        id: 'rm-rv-201',
        roomNumber: 'Kutir 201',
        floor: 2,
        category: 'Executive Suite',
        basePrice: 2200,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Yamuna View Terrace', 'Satvik Kit'],
        lastCleanedAt: 'Today, 08:30 AM'
      }
    ],
    initialBookings: [
      {
        id: 'bk-rv-401',
        bookingReference: 'BN-VRN-401',
        customer: 'Murli Manohar Shastri',
        phone: '+91 97234 56789',
        idProofType: 'Aadhaar',
        idProofNumber: '•••• •••• 3412',
        guestCity: 'Varanasi, UP',
        roomId: 'rm-rv-102',
        roomNumber: 'Kutir 102',
        checkIn: '2026-10-14',
        checkOut: '2026-10-18',
        guests: 2,
        roomRate: 1600,
        bookingStatus: 'CHECKED_IN',
        specialRequests: 'Attending Bhagwat Katha at Keshi Ghat daily.',
        ocrExtracted: true
      }
    ],
    initialTasks: [],
    initialTickets: [],
    initialShift: {
      operatorId: 'op-rv-1',
      operatorName: 'Mahant Govind Das',
      shiftType: 'Morning (06:00 - 14:00)',
      openedAt: '06:00 AM',
      openingFloat: 3000,
      cashCollections: 3200,
      digitalCollections: 4500,
      cashPayouts: 200,
      actualDrawerCount: 6000,
      discrepancy: 0,
      isClosed: false
    }
  },

  {
    id: 'prop-mth-01',
    propertyCode: 'MTH-01',
    name: 'Shri Krishna Janmasthan Heritage Haveli',
    destination: 'Mathura',
    destinationHindi: 'श्री मथुरा जन्मभूमि',
    address: 'Near Potra Kund, Deeg Gate Road, Mathura, UP - 281001',
    nearestLandmark: '180m from Shri Krishna Janmasthan & Potra Kund',
    contactPhone: '+91 94567 89012',
    contactEmail: 'stay@mathurajanmasthan.com',
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    satvikCertified: true,
    amenities: [
      '100% Satvik Kitchen (No Onion / Garlic)',
      'Luggage Locker for Janmasthan Security',
      'Potra Kund Parikrama Walk',
      'Free Parking'
    ],
    policies: 'High security zone proximity: Government photo ID required for every guest at front desk.',
    staff: [
      {
        id: 'op-mth-1',
        pin: '5101',
        name: 'Suresh Agrawal',
        role: 'Hotel Manager',
        shift: 'Morning (06:00 - 14:00)',
        hotelId: 'prop-mth-01',
        hotelName: 'Shri Krishna Janmasthan Heritage Haveli'
      },
      {
        id: 'op-mth-2',
        pin: '5202',
        name: 'Neha Mathur',
        role: 'Reception Lead',
        shift: 'Evening (14:00 - 22:00)',
        hotelId: 'prop-mth-01',
        hotelName: 'Shri Krishna Janmasthan Heritage Haveli'
      },
      {
        id: 'op-mth-3',
        pin: '5303',
        name: 'Vikas Chaturvedi',
        role: 'Night Auditor',
        shift: 'Night Audit (22:00 - 06:00)',
        hotelId: 'prop-mth-01',
        hotelName: 'Shri Krishna Janmasthan Heritage Haveli'
      }
    ],
    initialRooms: [
      {
        id: 'rm-m101',
        roomNumber: '101',
        floor: 1,
        category: 'Standard AC',
        basePrice: 1900,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Courtyard View', 'Ground Floor'],
        lastCleanedAt: 'Today, 09:45 AM'
      },
      {
        id: 'rm-m102',
        roomNumber: '102',
        floor: 1,
        category: 'Deluxe AC',
        basePrice: 2600,
        status: 'OCCUPIED',
        currentBookingId: 'bk-mth-512',
        guestName: 'Dwarika Prasad Chaturvedi',
        isEmergencyLocked: false,
        tags: ['Janmasthan Shikhara View'],
        lastCleanedAt: 'Today, 08:00 AM'
      },
      {
        id: 'rm-m201',
        roomNumber: '201',
        floor: 2,
        category: 'Executive Suite',
        basePrice: 3800,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Heritage Decor', 'Balcony'],
        lastCleanedAt: 'Today, 11:00 AM'
      }
    ],
    initialBookings: [
      {
        id: 'bk-mth-512',
        bookingReference: 'BN-MTH-512',
        customer: 'Dwarika Prasad Chaturvedi',
        phone: '+91 99281 33445',
        idProofType: 'Aadhaar',
        idProofNumber: '•••• •••• 9921',
        guestCity: 'Lucknow, UP',
        roomId: 'rm-m102',
        roomNumber: '102',
        checkIn: '2026-10-15',
        checkOut: '2026-10-17',
        guests: 2,
        roomRate: 2600,
        bookingStatus: 'CHECKED_IN',
        specialRequests: 'Need locker service for electronic gadgets before Janmasthan darshan.',
        ocrExtracted: true
      }
    ],
    initialTasks: [],
    initialTickets: [],
    initialShift: {
      operatorId: 'op-mth-1',
      operatorName: 'Suresh Agrawal',
      shiftType: 'Morning (06:00 - 14:00)',
      openedAt: '06:00 AM',
      openingFloat: 6000,
      cashCollections: 5200,
      digitalCollections: 9800,
      cashPayouts: 400,
      actualDrawerCount: 10800,
      discrepancy: 0,
      isClosed: false
    }
  },

  {
    id: 'prop-bar-01',
    propertyCode: 'BAR-01',
    name: 'Shriji Dham Palace & Bhakti Niwas',
    destination: 'Barsana',
    destinationHindi: 'श्री बरसाना धाम',
    address: 'Bhanugarh Marg, Below Shriji Mandir Steps, Barsana, UP - 281405',
    nearestLandmark: 'At foot of Shri Radha Rani Temple (Shriji)',
    contactPhone: '+91 98371 23456',
    contactEmail: 'barsana@shrijidham.in',
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    satvikCertified: true,
    amenities: [
      '100% Satvik Pure Veg',
      'Shriji Ropeway & Stairs Proximity',
      'Peda & Lassi Counter',
      'Morning Aarti Awakening Bell'
    ],
    policies: 'Pure Satvik sanctity strictly upheld. Footwear stand available at main reception.',
    staff: [
      {
        id: 'op-bar-1',
        pin: '6101',
        name: 'Radhika Kishore',
        role: 'Property Lead',
        shift: 'Morning (06:00 - 14:00)',
        hotelId: 'prop-bar-01',
        hotelName: 'Shriji Dham Palace & Bhakti Niwas'
      },
      {
        id: 'op-bar-2',
        pin: '6202',
        name: 'Kanha Sharma',
        role: 'Front Desk Agent',
        shift: 'Evening (14:00 - 22:00)',
        hotelId: 'prop-bar-01',
        hotelName: 'Shriji Dham Palace & Bhakti Niwas'
      },
      {
        id: 'op-bar-3',
        pin: '6303',
        name: 'Shyam Sundar',
        role: 'Night Auditor',
        shift: 'Night Audit (22:00 - 06:00)',
        hotelId: 'prop-bar-01',
        hotelName: 'Shriji Dham Palace & Bhakti Niwas'
      }
    ],
    initialRooms: [
      {
        id: 'rm-b101',
        roomNumber: '101',
        floor: 1,
        category: 'Standard AC',
        basePrice: 1700,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Bhanugarh Hill View'],
        lastCleanedAt: 'Today, 08:30 AM'
      },
      {
        id: 'rm-b102',
        roomNumber: '102',
        floor: 1,
        category: 'Deluxe AC',
        basePrice: 2300,
        status: 'OCCUPIED',
        currentBookingId: 'bk-bar-309',
        guestName: 'Lalita Sakhi Dasi',
        isEmergencyLocked: false,
        tags: ['Temple View Balcony'],
        lastCleanedAt: 'Yesterday, 05:00 PM'
      }
    ],
    initialBookings: [
      {
        id: 'bk-bar-309',
        bookingReference: 'BN-BAR-309',
        customer: 'Lalita Sakhi Dasi',
        phone: '+91 97190 88776',
        idProofType: 'Aadhaar',
        idProofNumber: '•••• •••• 5541',
        guestCity: 'Mathura, UP',
        roomId: 'rm-b102',
        roomNumber: '102',
        checkIn: '2026-10-15',
        checkOut: '2026-10-18',
        guests: 2,
        roomRate: 2300,
        bookingStatus: 'CHECKED_IN',
        specialRequests: 'Doing Radhashtami sankalp seva.',
        ocrExtracted: true
      }
    ],
    initialTasks: [],
    initialTickets: [],
    initialShift: {
      operatorId: 'op-bar-1',
      operatorName: 'Radhika Kishore',
      shiftType: 'Morning (06:00 - 14:00)',
      openedAt: '06:00 AM',
      openingFloat: 4000,
      cashCollections: 3800,
      digitalCollections: 6200,
      cashPayouts: 150,
      actualDrawerCount: 7650,
      discrepancy: 0,
      isClosed: false
    }
  },

  {
    id: 'prop-gov-01',
    propertyCode: 'GOV-01',
    name: 'Giriraj Parikrama Kripa Retreat',
    destination: 'Govardhan',
    destinationHindi: 'श्री गिरिराज गोवर्धन',
    address: '21-km Parikrama Marg, Near Dan Ghati Mandir, Govardhan, UP - 281502',
    nearestLandmark: 'On Parikrama Route, 220m from Dan Ghati Temple',
    contactPhone: '+91 98290 12345',
    contactEmail: 'seva@girirajretreat.org',
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    satvikCertified: true,
    amenities: [
      '100% Satvik Bhojan Thali',
      '21-km Parikrama E-Rickshaw Assistance',
      'Mukharvind Abhishek Coordination',
      'Hot Water Foot Soak for Yatris'
    ],
    policies: 'Devoted to Giriraj Govardhan pilgrims. Strictly onion-garlic free satvik pure dining.',
    staff: [
      {
        id: 'op-gov-1',
        pin: '7101',
        name: 'Giridhari Lal',
        role: 'Retreat Manager',
        shift: 'Morning (06:00 - 14:00)',
        hotelId: 'prop-gov-01',
        hotelName: 'Giriraj Parikrama Kripa Retreat'
      },
      {
        id: 'op-gov-2',
        pin: '7202',
        name: 'Anuradha Dasi',
        role: 'Front Desk Agent',
        shift: 'Evening (14:00 - 22:00)',
        hotelId: 'prop-gov-01',
        hotelName: 'Giriraj Parikrama Kripa Retreat'
      },
      {
        id: 'op-gov-3',
        pin: '7303',
        name: 'Hari Om Goswami',
        role: 'Night Shift Lead',
        shift: 'Night Audit (22:00 - 06:00)',
        hotelId: 'prop-gov-01',
        hotelName: 'Giriraj Parikrama Kripa Retreat'
      }
    ],
    initialRooms: [
      {
        id: 'rm-g101',
        roomNumber: '101',
        floor: 1,
        category: 'Deluxe AC',
        basePrice: 2200,
        status: 'OCCUPIED',
        currentBookingId: 'bk-gov-701',
        guestName: 'Keshavdas Shastri',
        isEmergencyLocked: false,
        tags: ['Parikrama Marg View', 'Ground Floor'],
        lastCleanedAt: 'Today, 07:15 AM'
      },
      {
        id: 'rm-g102',
        roomNumber: '102',
        floor: 1,
        category: 'Standard AC',
        basePrice: 1700,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Garden View', 'Quiet Wing'],
        lastCleanedAt: 'Today, 09:00 AM'
      },
      {
        id: 'rm-g201',
        roomNumber: '201',
        floor: 2,
        category: 'Executive Suite',
        basePrice: 3200,
        status: 'CLEAN',
        isEmergencyLocked: false,
        tags: ['Giriraj Shila View Terrace', 'King Bed'],
        lastCleanedAt: 'Today, 10:15 AM'
      }
    ],
    initialBookings: [
      {
        id: 'bk-gov-701',
        bookingReference: 'BN-GOV-701',
        customer: 'Keshavdas Shastri',
        phone: '+91 94120 77665',
        idProofType: 'Aadhaar',
        idProofNumber: '•••• •••• 7712',
        guestCity: 'Delhi NCR',
        roomId: 'rm-g101',
        roomNumber: '101',
        checkIn: '2026-10-15',
        checkOut: '2026-10-18',
        guests: 3,
        roomRate: 2200,
        bookingStatus: 'CHECKED_IN',
        specialRequests: 'Arranged morning Govardhan 21km Parikrama electric rickshaw.',
        ocrExtracted: true
      }
    ],
    initialTasks: [],
    initialTickets: [],
    initialShift: {
      operatorId: 'op-gov-1',
      operatorName: 'Giridhari Lal',
      shiftType: 'Morning (06:00 - 14:00)',
      openedAt: '06:00 AM',
      openingFloat: 5000,
      cashCollections: 4800,
      digitalCollections: 8200,
      cashPayouts: 300,
      actualDrawerCount: 9500,
      discrepancy: 0,
      isClosed: false
    }
  }
];
