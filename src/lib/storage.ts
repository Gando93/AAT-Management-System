import type { User, Vehicle, Booking, Customer, Tour, Notification } from '../types';

// Simple localStorage-based data store
class DataStore<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  add(item: T): boolean {
    try {
      const items = this.getAll();
      items.push(item);
      localStorage.setItem(this.key, JSON.stringify(items));
      return true;
    } catch {
      return false;
    }
  }

  update(id: string, updates: Partial<T>): boolean {
    try {
      const items = this.getAll();
      const index = items.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...updates };
        localStorage.setItem(this.key, JSON.stringify(items));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  delete(id: string): boolean {
    try {
      const items = this.getAll();
      const filtered = items.filter((item: any) => item.id !== id);
      localStorage.setItem(this.key, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  save(items: T[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }
}

// Create data stores
export const dataStore = {
  users: new DataStore<User>('aat_users'),
  vehicles: new DataStore<Vehicle>('aat_vehicles'),
  bookings: new DataStore<Booking>('aat_bookings'),
  customers: new DataStore<Customer>('aat_customers'),
  tours: new DataStore<Tour>('aat_tours'),
  notifications: new DataStore<Notification>('aat_notifications')
};

// Initialize with default data ONLY if storage is completely empty
export const initializeData = () => {
  // Check if this is a completely fresh installation
  const hasAnyData = 
    dataStore.users.getAll().length > 0 ||
    dataStore.vehicles.getAll().length > 0 ||
    dataStore.customers.getAll().length > 0 ||
    dataStore.tours.getAll().length > 0;

  if (hasAnyData) {
    console.log('Data already exists, skipping initialization');
    return;
  }

  console.log('Initializing with default data...');

  // Default users
  const defaultUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@aat.com',
      role: 'Administrator',
      status: 'active',
      permissions: ['all'],
      lastLogin: new Date().toISOString()
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@aat.com',
      role: 'Agent',
      status: 'active',
      permissions: ['bookings', 'customers'],
      lastLogin: new Date().toISOString()
    }
  ];

  // Default vehicles
  const defaultVehicles: Vehicle[] = [
    {
      id: '1',
      name: 'Toyota Hiace',
      type: 'Minibus',
      capacity: 14,
      status: 'available',
      licensePlate: 'GAM-001',
      fuelLevel: 85,
      driver: 'John Doe',
      location: 'Banjul'
    },
    {
      id: '2',
      name: 'Mercedes Sprinter',
      type: 'Bus',
      capacity: 20,
      status: 'available',
      licensePlate: 'GAM-002',
      fuelLevel: 90,
      driver: 'Jane Smith',
      location: 'Kololi'
    }
  ];

  // Default customers
  const defaultCustomers: Customer[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '+220 123 4567',
      status: 'active',
      address: '123 Main St, Banjul',
      dateOfBirth: '1985-06-15',
      nationality: 'Gambian',
      specialRequests: 'Vegetarian meals',
      totalBookings: 3,
      totalSpent: 150.00
    },
    {
      id: '2',
      name: 'Michael Brown',
      email: 'michael@email.com',
      phone: '+220 987 6543',
      status: 'active',
      address: '456 Beach Rd, Kololi',
      dateOfBirth: '1990-03-22',
      nationality: 'British',
      specialRequests: 'Wheelchair accessible',
      totalBookings: 1,
      totalSpent: 75.00
    },
    {
      id: '3',
      name: 'Aisha Ceesay',
      email: 'aisha@email.com',
      phone: '+220 555 1234',
      status: 'active',
      address: '789 Market St, Serrekunda',
      dateOfBirth: '1988-11-08',
      nationality: 'Gambian',
      specialRequests: 'Halal meals only',
      totalBookings: 5,
      totalSpent: 300.00
    }
  ];

  // Default Gambia tours
  const defaultTours: Tour[] = [
    {
      id: '1',
      name: 'Orientation Tour',
      duration: '6 hours',
      price: 40.00,
      category: 'City Tour',
      status: 'active',
      rating: 4.6,
      bookings: 15,
      description: 'Banjul: Albert Market & National Museum, Serrekunda: Batik workshop, Kololi: Monkey forest. Bring comfortable shoes, water, sunscreen, camera.',
      maxCapacity: 20,
      pickupTime: '08:30',
      dropoffTime: '14:30'
    },
    {
      id: '2',
      name: '2-Day Gambia Adventure',
      duration: '2 days',
      price: 165.00,
      category: 'Adventure',
      status: 'active',
      rating: 4.8,
      bookings: 8,
      description: 'Ferry crossing to the north, Wassu Stone Circles, Boat trip to Baboon Island Hippos & Chimpanzees, Georgetown & overnight at Sillahkunda Lodge. Bring overnight bag, insect repellent, flashlight, comfortable clothes and shoes.',
      maxCapacity: 12,
      pickupTime: '05:30',
      dropoffTime: '16:00'
    },
    {
      id: '3',
      name: '4-Wheel Drive Adventure',
      duration: '9 hours',
      price: 75.00,
      category: 'Adventure',
      status: 'active',
      rating: 4.7,
      bookings: 12,
      description: 'Remote bush villages, local school visit, Halahin River boat trip, secluded beach lunch, Tanji fishing village. Bring hat & sunscreen, water bottle, camera, cash, swimwear.',
      maxCapacity: 8,
      pickupTime: '08:00',
      dropoffTime: '17:00'
    },
    {
      id: '4',
      name: 'Senegal - Fathala Wild Reserve',
      duration: '10.5 hours',
      price: 115.00,
      category: 'Wildlife',
      status: 'active',
      rating: 4.9,
      bookings: 6,
      description: 'Ferry to Barra, cross into Senegal, Safari in Fathala Reserve (4x4 jeep). Bring passport (mandatory), Yellow Fever vaccination book, hat & sunglasses, binoculars, snacks.',
      maxCapacity: 10,
      pickupTime: '05:30',
      dropoffTime: '16:00'
    },
    {
      id: '5',
      name: 'Sita Joyeh (Baobab Island)',
      duration: '8.5 hours',
      price: 55.00,
      category: 'Nature',
      status: 'active',
      rating: 4.5,
      bookings: 18,
      description: 'Jungle walk, boat to Baobab Island, visit local marabout (witch doctor), lunch on the island. Bring walking shoes, curiosity, camera, insect repellent.',
      maxCapacity: 15,
      pickupTime: '08:00',
      dropoffTime: '16:30'
    },
    {
      id: '6',
      name: 'Explore Senegal',
      duration: '12 hours',
      price: 90.00,
      category: 'Cultural',
      status: 'active',
      rating: 4.4,
      bookings: 10,
      description: 'Cross border to Casamance, boat ride past Bird Island, Kailo Island voodoo culture, lunch in Abene. Bring passport, Yellow Fever Vaccination Book, sturdy shoes, sunscreen, sense of adventure!',
      maxCapacity: 12,
      pickupTime: '07:00',
      dropoffTime: '19:00'
    },
    {
      id: '7',
      name: 'River Memories',
      duration: '8 hours',
      price: 65.00,
      category: 'Nature',
      status: 'active',
      rating: 4.6,
      bookings: 14,
      description: 'Pirogue cruise through mangroves, stops for swimming and fishing, full onboard lunch. Bring swimwear & towel, sunscreen, hat, relaxation mode.',
      maxCapacity: 12,
      pickupTime: '09:00',
      dropoffTime: '17:00'
    },
    {
      id: '8',
      name: 'Roots Over Land',
      duration: '10 hours',
      price: 75.00,
      category: 'Historical',
      status: 'active',
      rating: 4.7,
      bookings: 16,
      description: 'Ferry to Barra, Albreda & Juffureh villages, visit St. James Island, "Roots" history tour. Bring camera, sunscreen, walking shoes, curiosity about history.',
      maxCapacity: 18,
      pickupTime: '07:30',
      dropoffTime: '17:30'
    },
    {
      id: '9',
      name: 'Bird Watching (Kayak/Canoe)',
      duration: '5.5 hours',
      price: 50.00,
      category: 'Wildlife',
      status: 'active',
      rating: 4.8,
      bookings: 9,
      description: 'Early morning creek tour, guided bird spotting, picnic breakfast. Bring binoculars, hat & sunglasses, light clothing, water.',
      maxCapacity: 8,
      pickupTime: '06:00',
      dropoffTime: '11:30'
    },
    {
      id: '10',
      name: 'Abuko Nature Reserve',
      duration: '6.5 hours',
      price: 45.00,
      category: 'Nature',
      status: 'active',
      rating: 4.3,
      bookings: 22,
      description: 'Nature walk through the reserve, wildlife rescue center, lunch at Lamin Lodge. Bring sturdy shoes, insect repellent, water bottle, camera.',
      maxCapacity: 15,
      pickupTime: '08:00',
      dropoffTime: '14:30'
    }
  ];

  // Save all default data
  dataStore.users.save(defaultUsers);
  dataStore.vehicles.save(defaultVehicles);
  dataStore.customers.save(defaultCustomers);
  dataStore.tours.save(defaultTours);
  dataStore.bookings.save([]);
  dataStore.notifications.save([]);

  console.log('Default data initialized successfully');
};