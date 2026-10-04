import { Bhojanalaya } from '../types';

export const brajBhojanalayas: Bhojanalaya[] = [
  {
    id: 'bhj-govindas-vrindavan',
    name: "Govinda's Pure Satvik Restaurant",
    hindiName: "गोविंदास सात्विक रेस्टोरेंट",
    slug: 'govindas-pure-satvik-restaurant',
    destinationSlug: 'vrindavan',
    destinationName: 'Vrindavan',
    category: 'heritage_cafe',
    categoryName: 'Heritage Satvik Cafe',
    ratingScore: 4.9,
    reviewsCount: 1420,
    priceRange: '₹200 - ₹450 per person',
    avgCostForTwo: 600,
    address: 'Inside ISKCON Krishna Balaram Mandir Complex, Raman Reti, Vrindavan',
    nearestLandmark: 'ISKCON Krishna Balaram Mandir',
    distanceToLandmark: 'Inside Temple Courtyard',
    walkMinutes: 1,
    timings: '08:30 AM - 10:00 PM (Daily)',
    pureSatvik: true,
    pureDesiGhee: true,
    specialityDishes: [
      'Govinda Special Desi Ghee Dosa',
      'Satvik Deluxe Thali (No Onion/Garlic)',
      'Herbal Tulsi Infusion & Kesari Kheer',
      'Fresh Paneer Tikka & Chapatis'
    ],
    images: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'The premier Vaishnava pure satvik dining experience in Vrindavan. All preparations are made exclusively in pure cow desi ghee and offered with sacred tulsi leaves before serving.',
    features: ['100% Vaishnava Satvik', 'AC Dining Hall', 'Outdoor Garden Seating', 'Takeaway Available', 'Wheelchair Accessible'],
    contactPhone: '+91 98765 11001',
    isFeatured: true
  },
  {
    id: 'bhj-brijwasi-mathura',
    name: 'Brijwasi Mithaiwala & Royal Thali',
    hindiName: 'बृजवासी मिष्ठान्न एवं रॉयल थाली',
    slug: 'brijwasi-mithaiwala-mathura',
    destinationSlug: 'mathura',
    destinationName: 'Mathura',
    category: 'thali',
    categoryName: 'Traditional Braj Thali',
    ratingScore: 4.8,
    reviewsCount: 2890,
    priceRange: '₹150 - ₹350 per thali',
    avgCostForTwo: 500,
    address: 'Near Holi Gate & Janmabhoomi Marg, Mathura',
    nearestLandmark: 'Shri Krishna Janmasthan',
    distanceToLandmark: '400m from Janmasthan Gate',
    walkMinutes: 5,
    timings: '07:00 AM - 11:00 PM (Daily)',
    pureSatvik: true,
    pureDesiGhee: true,
    specialityDishes: [
      'Authentic Mathura Malai Peda',
      'Crispy Bedmi Puri with Dubki Wale Aloo',
      'Unlimited Braj Mahabhog Thali',
      'Hot Kadhai Milk with Jalebi'
    ],
    images: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Over 70 years of legendary Braj culinary heritage. Renowned for crispy breakfast Bedmi Puri, rich Mathura Pedas, and heartwarming royal satvik thalis for traveling yatris.',
    features: ['100% Desi Ghee', 'Pure Satvik (No Onion/Garlic)', 'AC Family Dining', 'Gift Pack Sweets Counter'],
    contactPhone: '+91 98765 11002',
    isFeatured: true
  },
  {
    id: 'bhj-radha-damodar-annakshetra',
    name: 'Shri Radha Damodar Mahaprasad Hall',
    hindiName: 'श्री राधा दामोदर महाप्रसाद सेवा',
    slug: 'shri-radha-damodar-mahaprasad',
    destinationSlug: 'vrindavan',
    destinationName: 'Vrindavan',
    category: 'temple_prasadam',
    categoryName: 'Temple Mahaprasadam',
    ratingScore: 4.9,
    reviewsCount: 890,
    priceRange: '₹80 - ₹150 (Subsidized Seva)',
    avgCostForTwo: 200,
    address: 'Seva Kunj Marg, near Banke Bihari Sanctum, Vrindavan',
    nearestLandmark: 'Banke Bihari Ji Mandir',
    distanceToLandmark: '150m from Bihariji Temple',
    walkMinutes: 2,
    timings: 'Lunch: 11:30 AM - 02:30 PM | Dinner: 07:30 PM - 09:30 PM',
    pureSatvik: true,
    pureDesiGhee: true,
    specialityDishes: [
      'Sacred Chulha-Cooked Kadi & Rice',
      'Brajwasi Desi Ghee Khichdi Bhog',
      'Traditional Pataval (Leaf-Plate) Dining',
      'Daily Chhapan Bhog Prasadam'
    ],
    images: [
      'https://images.unsplash.com/photo-1505253758473-96b3015f240a?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Experience the sanctity of genuine temple Annakshetra Mahaprasad. Meals are slow-cooked on traditional sacred wood fires according to ancient Vaishnava smriti rules, served humbly on sal-leaf plates.',
    features: ['Traditional Floor & Table Seating', 'Zero Commercial Profit', 'Sadhu & Devotee Seva', '100% Pure Satvik'],
    contactPhone: '+91 98765 11003',
    isFeatured: true
  },
  {
    id: 'bhj-brijbhushan-barsana',
    name: 'Brijbhushan Mishthan & Satvik Rasoi',
    hindiName: 'बृजभूषण मिष्ठान्न एवं सात्विक रसोई',
    slug: 'brijbhushan-satvik-rasoi-barsana',
    destinationSlug: 'barsana',
    destinationName: 'Barsana',
    category: 'thali',
    categoryName: 'Traditional Braj Thali',
    ratingScore: 4.7,
    reviewsCount: 650,
    priceRange: '₹120 - ₹280 per thali',
    avgCostForTwo: 400,
    address: 'Shriji Mandir Marg, Near Ropeway Base, Barsana',
    nearestLandmark: 'Radha Rani (Shriji) Mandir',
    distanceToLandmark: 'At foot of Shriji Temple Stairs',
    walkMinutes: 1,
    timings: '06:30 AM - 10:00 PM (Daily)',
    pureSatvik: true,
    pureDesiGhee: true,
    specialityDishes: [
      'Barsana Special Makkhan Mishri Bowl',
      'Hot Kulhad Rabri with Malpua',
      'Rustic Bajra Roti with Ghee & Desi Gur',
      'Garma-Garam Kachori Sabzi'
    ],
    images: [
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Located at the foot of Radha Rani’s hilltop abode in Barsana. The ultimate spot to relish fresh cow butter (makkhan-mishri), malpuas, and warm satvik thalis after the climb.',
    features: ['Temple Stair Proximity', 'Fresh Dairy Direct from Braj Gaushalas', 'Pilgrim Dining Hall', 'Takeaway'],
    contactPhone: '+91 98765 11004',
    isFeatured: false
  },
  {
    id: 'bhj-dan-ghati-bhog-govardhan',
    name: 'Giriraj Dan Ghati Bhog & Peda Kendra',
    hindiName: 'गिरिराज दानघाटी भोग एवं पेड़ा केंद्र',
    slug: 'giriraj-dan-ghati-bhog-govardhan',
    destinationSlug: 'govardhan',
    destinationName: 'Govardhan',
    category: 'temple_prasadam',
    categoryName: 'Temple Mahaprasadam',
    ratingScore: 4.8,
    reviewsCount: 1120,
    priceRange: '₹100 - ₹250 per thali',
    avgCostForTwo: 350,
    address: 'Opposite Main Dan Ghati Temple Gate, Govardhan Parikrama Marg',
    nearestLandmark: 'Dan Ghati Giriraj Mandir',
    distanceToLandmark: '50m from Main Temple',
    walkMinutes: 1,
    timings: 'Open 24 Hours during Parikrama Days',
    pureSatvik: true,
    pureDesiGhee: true,
    specialityDishes: [
      'Giriraj Shila Bhog Kheer',
      'Govardhan Dudh Peda (Panchamrit Infused)',
      'Energy-Rich Parikrama Yatri Satvik Thali',
      'Fresh Shikanji & Buttermilk (Chhachh)'
    ],
    images: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Energizing thousands of devotees embarking on the 21-km Govardhan Parikrama. Authentic cow-milk pedas and hot, hygienic satvik thalis that provide strength during the holy circumambulation.',
    features: ['24x7 Parikrama Availability', 'Fast Service for Yatris', 'Pure Cow Milk Sweets', 'Filtered Water Refills'],
    contactPhone: '+91 98765 11005',
    isFeatured: true
  },
  {
    id: 'bhj-amrit-ras-vrindavan',
    name: 'Amrit Ras Satvik Bhojanalaya',
    hindiName: 'अमृत रस सात्विक भोजनालय',
    slug: 'amrit-ras-satvik-bhojanalaya-vrindavan',
    destinationSlug: 'vrindavan',
    destinationName: 'Vrindavan',
    category: 'thali',
    categoryName: 'Traditional Braj Thali',
    ratingScore: 4.8,
    reviewsCount: 940,
    priceRange: '₹180 - ₹380 per thali',
    avgCostForTwo: 550,
    address: 'Near Prem Mandir, Chhatikara-Vrindavan Road, Vrindavan',
    nearestLandmark: 'Prem Mandir',
    distanceToLandmark: '250m from Prem Mandir Fountain Gate',
    walkMinutes: 3,
    timings: '11:00 AM - 04:00 PM • 07:00 PM - 11:00 PM',
    pureSatvik: true,
    pureDesiGhee: true,
    specialityDishes: [
      'Unlimited Chhapan Bhog Royal Thali',
      'Rajasthani-Braj Dal Baati Churma with Ghee',
      'Piping Hot Phulka Rotis on Table',
      'Dry Fruit Shrikhand & Rabri'
    ],
    images: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Renowned for its royal satvik hospitality. Unlimited refills of authentic braj thali with seasonal greens, dal tadka with hing-jeera, and phulkas cooked live right in front of devotees.',
    features: ['AC Family Dining', 'Spacious Seating', 'Valet Parking', 'Children-Friendly Satvik Menu'],
    contactPhone: '+91 98765 11006',
    isFeatured: true
  },
  {
    id: 'bhj-shankar-mithaiwala-mathura',
    name: 'Shankar Mithai Bhandar (Heritage 1912)',
    hindiName: 'शंकर मिठाई भण्डार (विश्राम घाट)',
    slug: 'shankar-mithai-bhandar-mathura',
    destinationSlug: 'mathura',
    destinationName: 'Mathura',
    category: 'sweets_dairy',
    categoryName: 'Braj Sweets & Dairy',
    ratingScore: 4.9,
    reviewsCount: 3100,
    priceRange: '₹60 - ₹200 per item',
    avgCostForTwo: 300,
    address: 'Chowk Bazar, Near Vishram Ghat, Mathura',
    nearestLandmark: 'Vishram Ghat (Yamuna Riverfront)',
    distanceToLandmark: '100m from Aarti Ghat',
    walkMinutes: 2,
    timings: '06:00 AM - 11:30 PM (Daily)',
    pureSatvik: true,
    pureDesiGhee: true,
    specialityDishes: [
      'Traditional Brown Mawa Mathura Peda',
      'Thick Malai Kadhai Milk in Kulhad',
      'Braj Special Khurchan Roll',
      'Crispy Desi Ghee Imarti'
    ],
    images: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'A 112-year-old culinary landmark next to the Yamuna Aarti ghats. Known across India for pure roasted cow-milk pedas and thick, slow-steamed malai milk served in earthen cups.',
    features: ['Historic 100+ Year Heritage', 'Direct Yamuna Ghat Location', 'Export Quality Tin Packaging'],
    contactPhone: '+91 98765 11007',
    isFeatured: false
  },
  {
    id: 'bhj-radhakund-annakshetra',
    name: 'Shri Giriraj Annakshetra Sewa Trust',
    hindiName: 'श्री गिरिराज अन्नक्षेत्र सेवा ट्रस्ट',
    slug: 'shri-giriraj-annakshetra-radhakund',
    destinationSlug: 'govardhan',
    destinationName: 'Govardhan',
    category: 'annakshetra',
    categoryName: 'Community Annakshetra',
    ratingScore: 5.0,
    reviewsCount: 740,
    priceRange: 'Free Seva / Voluntary Donation',
    avgCostForTwo: 0,
    address: 'Near Radha Kund Parikrama Path, Govardhan',
    nearestLandmark: 'Radha Kund & Shyam Kund',
    distanceToLandmark: '150m from Sacred Ghat',
    walkMinutes: 2,
    timings: 'Prasadam: 12:00 PM - 02:00 PM • 07:00 PM - 08:30 PM',
    pureSatvik: true,
    pureDesiGhee: true,
    specialityDishes: [
      'Daily Vaishnava Annakshetra Prasadam',
      'Desi Ghee Moong Dal Khichdi',
      'Seasonal Satvik Sabzi & Roti',
      'Kheer Bhog on Ekadashi & Purnima'
    ],
    images: [
      'https://images.unsplash.com/photo-1505253758473-96b3015f240a?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Run by selfless devotees offering divine Annadanam to hundreds of parikrama pilgrims, Vaishnava sadhus, and yatris daily. All meals are prepared with sacred devotion and offered to Giriraj Maharaj.',
    features: ['Community Annadanam', 'Devotee Seva Opportunity', 'Filtered RO Water Stations', '100% Pious Vaishnava'],
    contactPhone: '+91 98765 11008',
    isFeatured: false
  }
];

export function getAllBhojanalayas(): Bhojanalaya[] {
  return brajBhojanalayas;
}

export function getBhojanalayaBySlug(slug: string): Bhojanalaya | undefined {
  return brajBhojanalayas.find((b) => b.slug.toLowerCase() === slug.toLowerCase() || b.id.toLowerCase() === slug.toLowerCase());
}
