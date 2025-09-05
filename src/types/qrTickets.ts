export interface QRTicket {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  tourId: string;
  tourName: string;
  tourDate: string; // ISO date
  departureTime: string; // HH:MM format
  qrCode: string; // Base64 encoded QR code data
  qrCodeUrl: string; // URL to QR code image
  ticketNumber: string; // Human-readable ticket number
  status: 'active' | 'used' | 'expired' | 'cancelled' | 'refunded';
  seatNumber?: string;
  specialInstructions?: string;
  generatedAt: string;
  expiresAt: string;
  usedAt?: string;
  usedBy?: string; // User ID who scanned the ticket
  checkInLocation?: string;
  checkInMethod: 'qr_scan' | 'manual' | 'mobile_app' | 'kiosk';
  validationAttempts: number;
  lastValidationAttempt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInSession {
  id: string;
  sessionName: string;
  tourId: string;
  tourName: string;
  tourDate: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  checkInLocation: string;
  staffMembers: string[]; // User IDs
  totalTickets: number;
  checkedInTickets: number;
  noShowTickets: number;
  cancelledTickets: number;
  averageCheckInTime: number; // seconds
  peakCheckInTime?: string; // HH:MM format
  notes?: string;
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

export interface CheckInEvent {
  id: string;
  ticketId: string;
  customerId: string;
  customerName: string;
  checkInTime: string;
  checkInMethod: 'qr_scan' | 'manual' | 'mobile_app' | 'kiosk';
  checkInLocation: string;
  staffMemberId: string; // User ID
  staffMemberName: string;
  validationTime: number; // seconds
  isLate: boolean;
  lateMinutes?: number;
  specialNotes?: string;
  seatAssignment?: string;
  emergencyContactVerified: boolean;
  waiverStatus: 'signed' | 'pending' | 'not_required';
  photoTaken: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QRCodeConfig {
  id: string;
  name: string;
  size: number; // pixels
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  foregroundColor: string; // hex color
  backgroundColor: string; // hex color
  logoUrl?: string;
  logoSize?: number;
  includeBookingDetails: boolean;
  includeCustomerInfo: boolean;
  includeTourInfo: boolean;
  customText?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInAnalytics {
  id: string;
  date: string; // ISO date
  tourId: string;
  tourName: string;
  totalTickets: number;
  checkedInTickets: number;
  noShowTickets: number;
  cancelledTickets: number;
  checkInRate: number; // percentage
  averageCheckInTime: number; // seconds
  peakCheckInHour: number; // 0-23
  checkInMethods: {
    qr_scan: number;
    manual: number;
    mobile_app: number;
    kiosk: number;
  };
  lateArrivals: number;
  earlyArrivals: number;
  onTimeArrivals: number;
  staffEfficiency: number; // tickets per hour
  customerSatisfaction?: number; // 1-5 rating
  issues: string[];
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MobileCheckInApp {
  id: string;
  appName: string;
  version: string;
  status: 'active' | 'maintenance' | 'deprecated';
  features: {
    qrScanning: boolean;
    manualCheckIn: boolean;
    offlineMode: boolean;
    photoCapture: boolean;
    seatAssignment: boolean;
    emergencyContactVerification: boolean;
    waiverSigning: boolean;
  };
  settings: {
    autoSync: boolean;
    syncInterval: number; // minutes
    offlineDataRetention: number; // days
    photoQuality: 'low' | 'medium' | 'high';
    requireStaffAuthentication: boolean;
    allowGuestCheckIn: boolean;
  };
  lastSync: string;
  lastUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSelfService {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  bookingId: string;
  tourId: string;
  tourName: string;
  tourDate: string;
  accessCode: string; // 6-digit code for self-service
  qrTicket: QRTicket;
  selfServiceFeatures: {
    viewTicket: boolean;
    checkIn: boolean;
    updateInfo: boolean;
    cancelBooking: boolean;
    requestRefund: boolean;
    downloadTicket: boolean;
    shareTicket: boolean;
  };
  lastAccessed: string;
  accessCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface QRValidationRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    timeBeforeTour?: number; // minutes
    timeAfterTour?: number; // minutes
    allowEarlyCheckIn?: boolean;
    allowLateCheckIn?: boolean;
    requireStaffVerification?: boolean;
    allowMultipleScans?: boolean;
    maxValidationAttempts?: number;
  };
  actions: {
    onValidScan: 'check_in' | 'warn' | 'deny';
    onInvalidScan: 'warn' | 'deny' | 'log';
    onExpiredTicket: 'warn' | 'deny' | 'allow';
    onUsedTicket: 'warn' | 'deny' | 'log';
  };
  isActive: boolean;
  priority: number;
  applicableTours: string[]; // Tour IDs, empty means all tours
  createdAt: string;
  updatedAt: string;
}

export interface OfflineCheckInData {
  id: string;
  sessionId: string;
  ticketId: string;
  customerData: {
    name: string;
    email: string;
    phone?: string;
  };
  tourData: {
    name: string;
    date: string;
    time: string;
  };
  checkInData: {
    time: string;
    method: string;
    location: string;
    staffMember: string;
    notes?: string;
  };
  syncStatus: 'pending' | 'synced' | 'failed';
  syncAttempts: number;
  lastSyncAttempt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QRCodeTemplate {
  id: string;
  name: string;
  description: string;
  templateType: 'standard' | 'premium' | 'vip' | 'group' | 'custom';
  design: {
    layout: 'vertical' | 'horizontal' | 'square';
    qrCodePosition: 'top' | 'bottom' | 'left' | 'right' | 'center';
    includeLogo: boolean;
    includeBorder: boolean;
    includeWatermark: boolean;
    colorScheme: string;
    fontFamily: string;
    fontSize: number;
  };
  content: {
    title: string;
    subtitle?: string;
    tourName: boolean;
    tourDate: boolean;
    tourTime: boolean;
    customerName: boolean;
    seatNumber: boolean;
    ticketNumber: boolean;
    qrCode: boolean;
    specialInstructions: boolean;
    termsAndConditions: boolean;
  };
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}


