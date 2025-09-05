export interface Tour {
  id: string;
  name: string;
  duration: string;
  price: number;
  category: string;
  status: 'active' | 'inactive';
  rating: number;
  bookings: number;
  description?: string;
  maxCapacity?: number;
  pickupTime?: string;
  dropoffTime?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  tourName: string;
  bookingDate: string;
  tourDate: string;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'paid';
  guests: number;
  participants: number;
  customerId?: string;
  tourId?: string;
  vehicleId?: string;
  notes?: string;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  roomNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  status?: 'active' | 'inactive';
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  specialRequests?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Hashed password
  role: 'Administrator' | 'Manager' | 'Agent' | 'Viewer' | 'Guide';
  status: 'active' | 'inactive';
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  needsPasswordSetup?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PasswordSetup {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: 'available' | 'in-use' | 'maintenance';
  licensePlate: string;
  fuelLevel?: number;
  driver?: string;
  location?: string;
}

export interface Notification {
  id: string;
  type: 'booking' | 'customer' | 'tour' | 'user' | 'vehicle';
  message: string;
  timestamp: string;
  read: boolean;
}
