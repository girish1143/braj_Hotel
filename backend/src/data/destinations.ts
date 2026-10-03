import { Destination } from '../types';

export const brajDestinations: Destination[] = [
  {
    id: 'dest-vrindavan',
    name: 'Vrindavan',
    slug: 'vrindavan',
    hindiName: 'श्री वृन्दावन धाम',
    tagline: 'The Eternal Playground of Shri Banke Bihari & Radha Rani',
    shortOverview: 'Ancient holy city famed for Banke Bihari Temple, Prem Mandir, Nidhivan, and Yamuna Keshi Ghat.',
    description: 'Vrindavan is the sacred epicenter of Braj Bhumi where Lord Krishna spent his playful childhood and divine Rasleela. Pilgrims come seeking the merciful gaze of Shri Banke Bihari Ji, the luminous grandeur of Prem Mandir, and the serene evening Yamuna aarti at Keshi Ghat.',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1000&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1609766857329-bc4c59ff100d?q=80&w=1600&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-candles-and-flowers-floating-in-a-river-at-night-42953-large.mp4',
    videoScenes: [
      {
        id: 'vrn-scene-1',
        title: 'Keshi Ghat Yamuna Maha Aarti & Diyas',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-candles-and-flowers-floating-in-a-river-at-night-42953-large.mp4',
        description: 'Sacred river deepams floating during evening sandhya aarti'
      },
      {
        id: 'vrn-scene-2',
        title: 'Banke Bihari Mandir Sandstone Sanctum',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-traditional-temple-architecture-in-india-42939-large.mp4',
        description: 'Vedic architecture and sacred sanctum spires of Vrindavan'
      }
    ],
    popularStaysCount: 0,
    spiritualSignificance: 'Birthplace of divine devotion, home to thousands of temples and sadhus, and the realm of unconditional love (Bhakti).',
    bestTimeToVisit: 'October to March (Kartik Maas, Sharad Purnima, Holi & Janmashtami)',
    landmarks: [
      {
        name: 'Banke Bihari Temple',
        distanceInfo: 'Heart of Old Vrindavan',
        description: 'The supreme attraction of Braj, featuring Thakurji in Tribhanga mudra. Famous for curtain swings and satvik prasad.',
        aartiTimings: 'Summer: 07:45 AM / 09:30 PM | Winter: 08:45 AM / 08:30 PM'
      },
      {
        name: 'Prem Mandir',
        distanceInfo: 'Chhatikara Road',
        description: 'Magnificent white Italian marble temple with illuminated evening musical water fountains and detailed lila carvings.',
        aartiTimings: '05:30 AM / 08:00 PM (Light & Sound: 07:00 PM)'
      },
      {
        name: 'ISKCON Vrindavan (Krishna Balaram Mandir)',
        distanceInfo: 'Raman Reti',
        description: 'Global epicenter of Hare Krishna kirtan, serene courtyards, Govinda restaurant and samadhi of Srila Prabhupada.',
        aartiTimings: 'Mangala Aarti: 04:30 AM | Sandhya Aarti: 07:00 PM'
      },
      {
        name: 'Yamuna Keshi Ghat',
        distanceInfo: 'Yamuna Bank',
        description: 'Ancient ghat where Krishna slayed the demon Keshi. Deeply venerated for sunset boat rides and evening Maha Aarti.',
        aartiTimings: 'Daily Sandhya Aarti: 06:30 PM'
      },
      {
        name: 'Nidhivan',
        distanceInfo: 'Central Vrindavan',
        description: 'Sacred grove where Lord Krishna and Radha Rani are believed to perform Rasleela every night. Closed strictly after sunset.',
        aartiTimings: 'Closes at 07:00 PM strictly'
      },
      {
        name: 'Chandrodaya Mandir',
        distanceInfo: 'Sunrakh Road',
        description: 'Soaring skyscraper temple under development, blending grand modern Vedic architecture with vast cultural pavilions.',
        aartiTimings: '06:00 AM / 07:30 PM'
      }
    ]
  },
  {
    id: 'dest-mathura',
    name: 'Mathura',
    slug: 'mathura',
    hindiName: 'श्री मथुरा जन्मभूमि',
    tagline: 'The Sacred Birthplace of Bhagwan Shri Krishna',
    shortOverview: 'One of the Sapta Puris, housing Shri Krishna Janmasthan, Vishram Ghat, and ancient Dwarkadhish Temple.',
    description: 'Mathura is one of the seven holiest cities (Mokshadayi Sapta Puri) in Hinduism. Here, Bhagwan Krishna manifested inside the prison cell of King Kamsa. Walk through historic lanes, take an auspicious Yamuna snan at Vishram Ghat, and savor authentic Mathura Peda and rabdi.',
    image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=1000&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1598890777032-bde13fba5ab3?q=80&w=1600&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-boats-on-the-ganges-river-at-sunrise-42945-large.mp4',
    videoScenes: [
      {
        id: 'mat-scene-1',
        title: 'Vishram Ghat Sunrise River & Boats',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-boats-on-the-ganges-river-at-sunrise-42945-large.mp4',
        description: 'Traditional wooden boats and reflection at sacred Yamuna ghat at dawn'
      },
      {
        id: 'mat-scene-2',
        title: 'Krishna Janmasthan Sandstone Towers',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-traditional-temple-architecture-in-india-42939-large.mp4',
        description: 'Vedic carvings and temple spire architecture'
      }
    ],
    popularStaysCount: 0,
    spiritualSignificance: 'Sapta Puri pilgrimage that grants liberation; the direct ground of Krishna Janma.',
    bestTimeToVisit: 'August (Janmashtami celebration) to March',
    landmarks: [
      {
        name: 'Shri Krishna Janmasthan',
        distanceInfo: 'City Center / Deeg Gate',
        description: 'The sanctum sanctorum where Lord Krishna was born inside the prison cell (Garbha Griha), with Bhagwat Bhavan.',
        aartiTimings: '05:30 AM (Mangala) | 08:00 PM (Shayan)'
      },
      {
        name: 'Vishram Ghat',
        distanceInfo: 'Yamuna Riverfront',
        description: 'The central ghat where Krishna rested after defeating Kamsa. Starting and finishing point for traditional Braj Parikrama.',
        aartiTimings: 'Yamuna Aarti: 07:00 AM & 07:00 PM'
      },
      {
        name: 'Dwarkadhish Temple',
        distanceInfo: 'Near Vishram Ghat',
        description: 'Celebrated Rajasthani-style temple managed by Vallabhacharya Pushtimarg tradition with vibrant Jhoola and Holi festivals.',
        aartiTimings: 'Rajbhog: 10:30 AM | Shayan: 07:00 PM'
      },
      {
        name: 'Gita Mandir (Birla Temple)',
        distanceInfo: 'Mathura-Vrindavan Road',
        description: 'Peaceful red sandstone temple with the entire 18 chapters of Bhagavad Gita carved into its pillars.',
        aartiTimings: '06:00 AM / 07:00 PM'
      }
    ]
  },
  {
    id: 'dest-barsana',
    name: 'Barsana',
    slug: 'barsana',
    hindiName: 'श्री बरसाना धाम',
    tagline: 'The Celestial Palace of Shri Radha Rani (Ladli Ji)',
    shortOverview: 'Perched on the Bhanugarh hills, home to Ladli Ji Temple, Rangeeli Mahal, and the world-famous Lathmar Holi.',
    description: 'Barsana is the beloved abode of Shri Radha Rani, the supreme soul of Braj. Nestled around the four peaks of Bhanugarh hill, pilgrims climb the sacred steps to seek blessings at Shriji Mandir, soak in the quiet devotion of Maan Mandir, and witness unparalleled Holi festivities.',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1000&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=1600&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-ancient-palace-temple-complex-in-india-42940-large.mp4',
    videoScenes: [
      {
        id: 'bar-scene-1',
        title: 'Bhanugarh Hill & Ladli Ji Spire',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-ancient-palace-temple-complex-in-india-42940-large.mp4',
        description: 'Majestic hilltop temple complex overlooking the groves of Barsana'
      },
      {
        id: 'bar-scene-2',
        title: 'Devotee Procession & Sacred Courtyards',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-traditional-temple-architecture-in-india-42939-large.mp4',
        description: 'Vibrant pilgrim paths and traditional Braj architecture'
      }
    ],
    popularStaysCount: 0,
    spiritualSignificance: 'The seat of Radharani’s grace (Kripa Kataksha), venerated as holier than the three worlds.',
    bestTimeToVisit: 'September (Radhashtami) through March (Lathmar Holi)',
    landmarks: [
      {
        name: 'Radha Rani Mandir (Shriji Temple)',
        distanceInfo: 'Bhanugarh Hilltop',
        description: 'Historic hilltop temple with panoramic views of Braj landscape. Reachable via stone stairs or modern ropeway.',
        aartiTimings: 'Mangala: 05:00 AM | Shayan: 08:30 PM'
      },
      {
        name: 'Rangeeli Mahal',
        distanceInfo: 'Kosi Road, Barsana',
        description: 'Vast spiritual complex founded by Jagadguru Kripalu Parishat, known for musical fountain gardens and satsang hall.',
        aartiTimings: '06:30 AM / 07:30 PM'
      },
      {
        name: 'Maan Mandir',
        distanceInfo: 'Maan Garh Peak',
        description: 'Dedicated to Shri Ramesh Baba’s Gaushala and Radha-Krishna Maan Lila, serving thousands of indigenous cows.',
        aartiTimings: '05:30 AM / 07:00 PM'
      },
      {
        name: 'Pila Pokhar',
        distanceInfo: 'Base of Barsana',
        description: 'Sacred pond where Yashoda maiya bathed young Radha, leaving yellow footprints commemorated by devotees.',
        aartiTimings: 'Open all day for parikrama'
      }
    ]
  },
  {
    id: 'dest-govardhan',
    name: 'Govardhan',
    slug: 'govardhan',
    hindiName: 'श्री गिरिराज गोवर्धन',
    tagline: 'The Supreme Giriraj Parvat & Sacred 21-km Parikrama',
    shortOverview: 'Sacred hill lifted by Shri Krishna. Famed for Dan Ghati Mandir, Mansi Ganga, Mukharvind, and Radha Kund.',
    description: 'Giriraj Govardhan is considered non-different from Lord Krishna Himself. Millions of devotees walk the sacred 21-kilometer Parikrama barefoot, stopping at Dan Ghati, Mukharvind, Mansi Ganga, and the twin holy lakes of Radha Kund and Shyam Kund for purification and eternal devotion.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1600&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fog-over-a-green-mountain-range-42918-large.mp4',
    videoScenes: [
      {
        id: 'gov-scene-1',
        title: 'Sacred Giriraj Hill Parikrama Marg',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fog-over-a-green-mountain-range-42918-large.mp4',
        description: 'Misty serene ridges of Giriraj Parvat and eternal pilgrim paths'
      },
      {
        id: 'gov-scene-2',
        title: 'Mansi Ganga & Kusum Sarovar Waters',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-boats-on-the-ganges-river-at-sunrise-42945-large.mp4',
        description: 'Tranquil sandstone ghats and holy waters reflects evening aarti lamps'
      }
    ],
    popularStaysCount: 0,
    spiritualSignificance: 'The living form of Lord Krishna that granted shelter under torrential rain; ultimate parikrama destination.',
    bestTimeToVisit: 'July (Guru Purnima Mela) to March',
    landmarks: [
      {
        name: 'Dan Ghati Temple',
        distanceInfo: 'Main Parikrama Route',
        description: 'The spot where Krishna collected tax (dan) of milk and butter from the Gopis. The primary temple for milk abhishek.',
        aartiTimings: 'Continuous Dudh Abhishek from 05:00 AM to 10:00 PM'
      },
      {
        name: 'Mansi Ganga Lake',
        distanceInfo: 'Center of Govardhan',
        description: 'Created by Krishna mentally for his parents. Devotees take bath here before embarking on the 21km Parikrama.',
        aartiTimings: 'Maha Deepotsav at dusk'
      },
      {
        name: 'Radha Kund & Shyam Kund',
        distanceInfo: '5 km north of Govardhan',
        description: 'The holiest water bodies in Gaudiya Vaishnavism where Krishna and Radha manifested divine transcendental waters.',
        aartiTimings: 'Midnight Snan on Ahoi Ashtami; Daily Aarti 07:00 PM'
      },
      {
        name: 'Kusum Sarovar',
        distanceInfo: 'Parikrama Marg',
        description: 'Exquisite 18th-century sandstone chhatris with floral gardens where Radha gathered flowers with her sakhis.',
        aartiTimings: 'Sunrise to Sunset'
      },
      {
        name: 'Jatipura Mukharvind Mandir',
        distanceInfo: 'Jatipura Village',
        description: 'The divine lotus face of Giriraj Ji where devotees offer Chhappan Bhog and grand Shringar daily.',
        aartiTimings: 'Bhog Darshan: 12:00 PM | Sandhya: 06:30 PM'
      }
    ]
  }
];
