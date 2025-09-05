export interface TourManifest {
  id: string;
  tourId: string;
  tourName: string;
  tourDate: string; // ISO date
  departureTime: string; // HH:MM format
  returnTime?: string; // HH:MM format
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  guideId: string;
  guideName: string;
  vehicleId: string;
  vehicleName: string;
  driverId?: string;
  driverName?: string;
  passengers: ManifestPassenger[];
  totalPassengers: number;
  maxCapacity: number;
  specialInstructions?: string;
  weatherConditions?: string;
  equipment: ManifestEquipment[];
  checklist: ManifestChecklistItem[];
  notes?: string;
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

export interface ManifestPassenger {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  seatNumber?: string;
  checkInStatus: 'pending' | 'checked_in' | 'no_show' | 'cancelled';
  checkInTime?: string;
  specialRequirements?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  dietaryRestrictions?: string[];
  medicalConditions?: string[];
  ageGroup: 'adult' | 'child' | 'senior' | 'infant';
  isVip: boolean;
}

export interface ManifestEquipment {
  id: string;
  name: string;
  category: 'safety' | 'comfort' | 'navigation' | 'communication' | 'emergency' | 'other';
  required: boolean;
  checked: boolean;
  checkedBy?: string; // User ID
  checkedAt?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_repair';
  notes?: string;
}

export interface ManifestChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: 'pre_departure' | 'safety' | 'customer_service' | 'equipment' | 'post_tour' | 'other';
  required: boolean;
  completed: boolean;
  completedBy?: string; // User ID
  completedAt?: string;
  notes?: string;
  order: number;
}

export interface DailyOperations {
  id: string;
  date: string; // ISO date
  status: 'planning' | 'active' | 'completed';
  tours: string[]; // Tour manifest IDs
  totalTours: number;
  completedTours: number;
  totalPassengers: number;
  checkedInPassengers: number;
  weather: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';
    temperature: number;
    windSpeed: number;
    visibility: number;
    notes?: string;
  };
  incidents: DailyIncident[];
  notes?: string;
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

export interface DailyIncident {
  id: string;
  type: 'safety' | 'customer_service' | 'equipment' | 'weather' | 'transport' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  tourId?: string;
  customerId?: string;
  reportedBy: string; // User ID
  reportedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  resolvedBy?: string; // User ID
  resolvedAt?: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface VehiclePreparation {
  id: string;
  vehicleId: string;
  vehicleName: string;
  preparationDate: string; // ISO date
  tourDate: string; // ISO date
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  checklist: VehicleChecklistItem[];
  fuelLevel: number; // Percentage
  mileage: number;
  exteriorCondition: 'excellent' | 'good' | 'fair' | 'poor';
  interiorCondition: 'excellent' | 'good' | 'fair' | 'poor';
  safetyEquipment: SafetyEquipmentCheck[];
  maintenanceRequired: boolean;
  maintenanceNotes?: string;
  preparedBy: string; // User ID
  preparedAt?: string;
  approvedBy?: string; // User ID
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleChecklistItem {
  id: string;
  title: string;
  category: 'engine' | 'tires' | 'lights' | 'brakes' | 'interior' | 'exterior' | 'safety' | 'other';
  required: boolean;
  completed: boolean;
  completedBy?: string; // User ID
  completedAt?: string;
  notes?: string;
  order: number;
}

export interface SafetyEquipmentCheck {
  id: string;
  equipmentName: string;
  required: boolean;
  present: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
  expiryDate?: string; // For items with expiry dates
  checkedBy?: string; // User ID
  checkedAt?: string;
  notes?: string;
}

export interface CustomerCheckIn {
  id: string;
  manifestId: string;
  tourId: string;
  customerId: string;
  customerName: string;
  checkInTime: string;
  checkInMethod: 'manual' | 'qr_code' | 'mobile_app' | 'kiosk';
  checkedInBy: string; // User ID
  seatAssignment?: string;
  specialRequests?: string;
  emergencyContactVerified: boolean;
  waiverSigned: boolean;
  photoTaken: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TourDeparture {
  id: string;
  manifestId: string;
  tourId: string;
  scheduledDeparture: string; // ISO datetime
  actualDeparture?: string; // ISO datetime
  status: 'scheduled' | 'boarding' | 'departed' | 'delayed' | 'cancelled';
  delayReason?: string;
  delayMinutes?: number;
  passengersOnBoard: number;
  passengersExpected: number;
  lastMinuteChanges: string[];
  weatherAtDeparture?: {
    condition: string;
    temperature: number;
    windSpeed: number;
  };
  departureNotes?: string;
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

export interface DailyReport {
  id: string;
  date: string; // ISO date
  reportType: 'morning' | 'afternoon' | 'evening' | 'end_of_day';
  summary: string;
  highlights: string[];
  issues: string[];
  recommendations: string[];
  weatherSummary: string;
  passengerFeedback: string[];
  guideFeedback: string[];
  equipmentIssues: string[];
  safetyIncidents: string[];
  financialSummary: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    currency: string;
  };
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}


