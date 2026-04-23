export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  pharmacy: string;
  price: number;
  status: 'AVAILABLE' | 'LOW STOCK' | 'OUT OF STOCK';
  category: string;
  image?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'PHARMACY' | 'CLINIC' | 'HOSPITAL';
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  status: 'Open Now' | 'Closed' | 'Emergency Only';
  hours: string;
  description: string;
  image: string;
  services: string[];
}

export interface Service {
  id: string;
  name: string;
  provider: string;
  location: string;
  distance: string;
  rating: number;
  price: number;
  image: string;
}

export const MOCK_MEDICINES: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    dosage: '500mg',
    pharmacy: 'Kigali City Pharmacy',
    price: 500,
    status: 'AVAILABLE',
    category: 'Pain Relief',
  },
  {
    id: '2',
    name: 'Insulin Glargine',
    dosage: '100 U/mL',
    pharmacy: 'Gisimenti Health Center Pharmacy',
    price: 12400,
    status: 'AVAILABLE',
    category: 'Diabetes Care',
  },
  {
    id: '3',
    name: 'Amoxicillin Syrup',
    dosage: '250mg/5ml',
    pharmacy: 'LifeLine Pharmacy - Remera',
    price: 3200,
    status: 'AVAILABLE',
    category: 'Antibiotic',
  },
  {
    id: '4',
    name: 'Ibuprofen',
    dosage: '400mg Tablets',
    pharmacy: 'MedPlus Rwanda',
    price: 1100,
    status: 'AVAILABLE',
    category: 'Pain Relief',
  },
];

export const MOCK_FACILITIES: Facility[] = [
  {
    id: '1',
    name: 'Kigali Life Pharmacy',
    type: 'PHARMACY',
    location: 'Kimironko, 1.2 km away',
    distance: '1.2 km',
    rating: 4.8,
    reviews: 120,
    status: 'Open Now',
    hours: '08:00 - 22:00',
    description: 'Providing a wide range of essential medicines and 24/7 pharmaceutical consultation services.',
    image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=800',
    services: ['Digital Prescriptions', 'Home Delivery', 'BP Screening'],
  },
  {
    id: '2',
    name: 'City Medical Center',
    type: 'CLINIC',
    location: 'Nyarugenge, 2.5 km away',
    distance: '2.5 km',
    rating: 4.5,
    reviews: 85,
    status: 'Open Now',
    hours: '07:00 - 21:00',
    description: 'Multi-specialty clinic focusing on family medicine, pediatrics, and diagnostic services.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    services: ['General Consultation', 'Laboratory', 'Vaccination'],
  },
  {
    id: '3',
    name: 'Hilltop Pharmacy',
    type: 'PHARMACY',
    location: 'Kicukiro, 3.8 km away',
    distance: '3.8 km',
    rating: 4.2,
    reviews: 45,
    status: 'Closed',
    hours: '08:00 - 20:00',
    description: 'Reliable neighborhood pharmacy offering community health outreach and medicine home delivery.',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=800',
    services: ['Medicine Delivery', 'First Aid Kits'],
  },
  {
    id: '4',
    name: 'Hilltop Pharmacy',
    type: 'PHARMACY',
    location: 'Kicukiro, 3.8 km away',
    distance: '3.8 km',
    rating: 4.2,
    reviews: 45,
    status: 'Closed',
    hours: '08:00 - 20:00',
    description: 'Reliable neighborhood pharmacy offering community health outreach and medicine home delivery.',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=800',
    services: ['Medicine Delivery', 'First Aid Kits'],
  },
  {
    id: '5',
    name: 'Hilltop Pharmacy',
    type: 'PHARMACY',
    location: 'Kicukiro, 3.8 km away',
    distance: '3.8 km',
    rating: 4.2,
    reviews: 45,
    status: 'Closed',
    hours: '08:00 - 20:00',
    description: 'Reliable neighborhood pharmacy offering community health outreach and medicine home delivery.',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=800',
    services: ['Medicine Delivery', 'First Aid Kits'],
  },
];
