import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const privateKey = process.env.FIREBASE_PRIVATE_KEY 
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});

const db = getFirestore(app);

async function initializeCollections() {
  // Locations Collection
  const locations = [
    {
      id: 'heathrow-t2',
      name: 'Heathrow Terminal 2',
      type: 'AIRPORT',
      airport: 'Heathrow',
      terminal: 'Terminal 2',
      status: 'active',
    },
    {
      id: 'heathrow-t3',
      name: 'Heathrow Terminal 3',
      type: 'AIRPORT',
      airport: 'Heathrow',
      terminal: 'Terminal 3',
      status: 'active',
    },
    {
      id: 'heathrow-t4',
      name: 'Heathrow Terminal 4',
      type: 'AIRPORT',
      airport: 'Heathrow',
      terminal: 'Terminal 4',
      status: 'active',
    },
    {
      id: 'heathrow-t5',
      name: 'Heathrow Terminal 5',
      type: 'AIRPORT',
      airport: 'Heathrow',
      terminal: 'Terminal 5',
      status: 'active',
    },
    {
      id: 'gatwick-north',
      name: 'Gatwick North Terminal',
      type: 'AIRPORT',
      airport: 'Gatwick',
      terminal: 'North Terminal',
      status: 'active',
    },
    {
      id: 'gatwick-south',
      name: 'Gatwick South Terminal',
      type: 'AIRPORT',
      airport: 'Gatwick',
      terminal: 'South Terminal',
      status: 'active',
    },
  ];

  // Service Rates Collection
  const serviceRates = [
    {
      id: 'meet-assist-base',
      type: 'MEET_AND_ASSIST',
      baseRate: 140,
      description: 'Base rate for Meet and Assist service',
    },
    {
      id: 'meet-assist-connection',
      type: 'MEET_AND_ASSIST_CONNECTION',
      baseRate: 280,
      description: 'Base rate for Meet and Assist connection service',
    },
    {
      id: 'airport-transfer-base',
      type: 'AIRPORT_TRANSFER',
      baseRate: 100,
      description: 'Base rate for Airport Transfer service',
    },
    {
      id: 'airport-transfer-connection',
      type: 'AIRPORT_TRANSFER_CONNECTION',
      baseRate: 150,
      description: 'Base rate for inter-airport transfer service',
    },
    {
      id: 'airport-transfer-lhr',
      type: 'AIRPORT_TRANSFER_LHR',
      baseRate: 120,
      description: 'Base rate for Heathrow airport transfer service',
    },
    {
      id: 'airport-transfer-other',
      type: 'AIRPORT_TRANSFER_OTHER',
      baseRate: 110,
      description: 'Base rate for other London airports transfer service',
    },
  ];

  // Vehicles Collection
  const vehicles = [
    {
      id: 'mercedes-s-class',
      title: 'Mercedes-Benz S-Class',
      name: 'Mercedes S-Class',
      brand: 'Mercedes',
      model: 'S-Class',
      type: 'SEDAN',
      basePrice: 180,
      pricePerHour: 50,
      maxPassengers: 3,
      maxBags: 2,
      description: 'Perfect for up to 3 passengers with 2 large suitcases',
      imageUrl: '/images/cars/mercedes-s.jpeg',
      hasWifi: true,
      meetAndGreet: true,
      complimentaryDrinks: true,
      waitingTime: '30 minutes',
      features: ['Leather seats', 'Climate control', 'Premium sound system', 'Privacy partition'],
      specifications: {
        engine: '3.0L V6',
        power: '362 hp',
        transmission: '9-speed automatic',
        fuelType: 'Petrol',
        seating: '4 passengers',
        luggage: '2 large suitcases'
      },
      vehicleStatus: 'active'
    },
    {
      id: 'bmw-7-series',
      title: 'BMW 7 Series',
      name: 'BMW 7 Series',
      brand: 'BMW',
      model: '7-Series',
      type: 'SEDAN',
      basePrice: 190,
      pricePerHour: 55,
      maxPassengers: 3,
      maxBags: 2,
      description: 'Elegant design with advanced technology for a premium travel experience',
      imageUrl: '/images/cars/bmw-7.jpeg',
      hasWifi: true,
      meetAndGreet: true,
      complimentaryDrinks: true,
      waitingTime: '30 minutes',
      features: ['Executive seating', 'Gesture control', 'Ambient lighting', 'Massage seats'],
      specifications: {
        engine: '3.0L I6',
        power: '335 hp',
        transmission: '8-speed automatic',
        fuelType: 'Petrol',
        seating: '4 passengers',
        luggage: '2 large suitcases'
      },
      vehicleStatus: 'active'
    },
    {
      id: 'range-rover-autobiography',
      title: 'Range Rover Autobiography',
      name: 'Range Rover Autobiography',
      brand: 'Range',
      model: 'Rover',
      type: 'SUV',
      basePrice: 250,
      pricePerHour: 65,
      maxPassengers: 5,
      maxBags: 4,
      description: 'Our spacious SUVs provide extra comfort and luggage space without compromising on luxury',
      imageUrl: '/images/cars/range-rover.jpeg',
      hasWifi: true,
      meetAndGreet: true,
      complimentaryDrinks: true,
      waitingTime: '30 minutes',
      features: ['All-wheel drive', 'Terrain response', 'Premium leather', 'Panoramic roof'],
      specifications: {
        engine: '3.0L V6',
        power: '380 hp',
        transmission: '8-speed automatic',
        fuelType: 'Petrol',
        seating: '5 passengers',
        luggage: '4 large suitcases'
      },
      vehicleStatus: 'active'
    },
    {
      id: 'mercedes-v-class',
      title: 'Mercedes-Benz V-Class',
      name: 'Mercedes V-Class',
      brand: 'Mercedes',
      model: 'V-Class',
      type: 'VAN',
      basePrice: 300,
      pricePerHour: 80,
      maxPassengers: 7,
      maxBags: 6,
      description: 'Perfect for group travel, our luxury vans combine space and comfort for a premium experience',
      imageUrl: '/images/cars/v-class.jpeg',
      hasWifi: true,
      meetAndGreet: true,
      complimentaryDrinks: true,
      waitingTime: '30 minutes',
      features: ['Spacious interior', 'Multiple seating configurations', 'Climate control', 'Premium audio'],
      specifications: {
        engine: '2.1L I4',
        power: '163 hp',
        transmission: '7-speed automatic',
        fuelType: 'Diesel',
        seating: '7 passengers',
        luggage: '6 large suitcases'
      },
      vehicleStatus: 'active'
    }
  ];

  // Extra Charges Collection
  const extraCharges = [
    {
      id: 'unsocial-hours',
      type: 'UNSOCIAL_HOURS',
      amount: 60,
      description: 'Additional charge for services between 22:00 and 06:00',
    },
    {
      id: 'festive-multiplier',
      type: 'FESTIVE_MULTIPLIER',
      amount: 2,
      description: 'Multiplier for services during festive periods',
    },
    {
      id: 'additional-passenger',
      type: 'ADDITIONAL_PASSENGER',
      amount: 45,
      description: 'Charge per additional passenger beyond 2 passengers',
    },
    {
      id: 'buggy-service',
      type: 'BUGGY_SERVICE',
      amount: 80,
      description: 'Charge for buggy service at Heathrow airport',
    },
    {
      id: 'porter-service',
      type: 'PORTER_SERVICE',
      amount: 65,
      description: 'Charge per porter (each porter handles up to 8 bags)',
    },
  ];

  try {
    // Create collections and documents
    const batch = db.batch();

    // Locations
    locations.forEach((location) => {
      const ref = db.collection('locations').doc(location.id);
      batch.set(ref, location);
    });

    // Service Rates
    serviceRates.forEach((rate) => {
      const ref = db.collection('service_rates').doc(rate.id);
      batch.set(ref, rate);
    });

    // Vehicles
    vehicles.forEach((vehicle) => {
      const ref = db.collection('vehicles').doc(vehicle.id);
      batch.set(ref, vehicle);
    });

    // Extra Charges
    extraCharges.forEach((charge) => {
      const ref = db.collection('extra_charges').doc(charge.id);
      batch.set(ref, charge);
    });

    await batch.commit();
    console.log('Successfully initialized all collections');
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
}

initializeCollections().then(() => process.exit(0)); 