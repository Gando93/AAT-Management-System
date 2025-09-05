export interface Waiver {
  id: string;
  name: string;
  title: string;
  description: string;
  content: string; // HTML content of the waiver
  version: string; // e.g., "1.0", "2.1"
  type: 'liability' | 'medical' | 'photo_video' | 'participation' | 'custom';
  category: 'required' | 'optional' | 'conditional';
  isActive: boolean;
  isDefault: boolean;
  language: string; // e.g., 'en', 'es', 'fr'
  applicableTours: string[]; // Tour IDs
  applicableAgeGroups: ('adult' | 'child' | 'senior' | 'all')[];
  requiredFields: WaiverField[];
  legalRequirements: LegalRequirement[];
  validityPeriod: {
    startDate: string;
    endDate?: string;
    duration?: number; // days
  };
  signatureRequired: boolean;
  witnessRequired: boolean;
  parentGuardianRequired: boolean; // for minors
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface WaiverField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'checkbox' | 'radio' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for radio/select fields
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
  order: number;
}

export interface LegalRequirement {
  id: string;
  jurisdiction: string; // e.g., 'US-CA', 'EU-GDPR', 'UK'
  requirement: string;
  description: string;
  isCompliant: boolean;
  complianceDate?: string;
  lastReviewed: string;
  reviewedBy: string; // User ID
  notes?: string;
}

export interface WaiverSignature {
  id: string;
  waiverId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  bookingId: string;
  tourId: string;
  tourName: string;
  tourDate: string;
  signatureData: string; // Base64 encoded signature image
  signatureMethod: 'digital' | 'touch' | 'upload' | 'typed';
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  witnessName?: string;
  witnessSignature?: string; // Base64 encoded witness signature
  parentGuardianName?: string;
  parentGuardianSignature?: string; // Base64 encoded parent/guardian signature
  parentGuardianRelationship?: string;
  fieldResponses: WaiverFieldResponse[];
  status: 'pending' | 'signed' | 'expired' | 'cancelled' | 'invalid';
  expiresAt?: string;
  validatedAt?: string;
  validatedBy?: string; // User ID
  validationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaiverFieldResponse {
  fieldId: string;
  fieldName: string;
  value: string | boolean | string[];
  responseTime: number; // seconds spent on this field
}

export interface WaiverTemplate {
  id: string;
  name: string;
  description: string;
  templateType: 'standard' | 'premium' | 'vip' | 'group' | 'custom';
  category: 'liability' | 'medical' | 'photo_video' | 'participation';
  language: string;
  content: string; // HTML template with placeholders
  variables: string[]; // e.g., ['customer_name', 'tour_name', 'date']
  styling: {
    fontFamily: string;
    fontSize: number;
    colorScheme: string;
    logoUrl?: string;
    headerColor: string;
    footerColor: string;
  };
  sections: WaiverSection[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface WaiverSection {
  id: string;
  title: string;
  content: string;
  order: number;
  isRequired: boolean;
  fields: WaiverField[];
}

export interface ComplianceReport {
  id: string;
  reportName: string;
  reportType: 'waiver_compliance' | 'signature_audit' | 'legal_review' | 'custom';
  period: {
    startDate: string;
    endDate: string;
  };
  jurisdiction: string;
  totalWaivers: number;
  signedWaivers: number;
  pendingWaivers: number;
  expiredWaivers: number;
  complianceRate: number; // percentage
  issues: ComplianceIssue[];
  recommendations: string[];
  generatedAt: string;
  generatedBy: string; // User ID
  status: 'draft' | 'final' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceIssue {
  id: string;
  type: 'missing_signature' | 'expired_waiver' | 'invalid_signature' | 'missing_witness' | 'legal_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedCustomers: string[]; // Customer IDs
  affectedBookings: string[]; // Booking IDs
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string; // User ID
  createdAt: string;
}

export interface WaiverAnalytics {
  id: string;
  date: string; // ISO date
  waiverId: string;
  waiverName: string;
  totalPresented: number; // Number of times waiver was shown to customers
  totalSigned: number;
  totalDeclined: number;
  totalExpired: number;
  averageSigningTime: number; // seconds
  completionRate: number; // percentage
  abandonmentPoints: AbandonmentPoint[];
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserBreakdown: {
    chrome: number;
    firefox: number;
    safari: number;
    edge: number;
    other: number;
  };
  geographicBreakdown: {
    country: string;
    region: string;
    count: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AbandonmentPoint {
  sectionId: string;
  sectionName: string;
  abandonmentCount: number;
  abandonmentRate: number; // percentage
  commonReasons: string[];
}

export interface WaiverNotification {
  id: string;
  type: 'signature_required' | 'waiver_expired' | 'compliance_alert' | 'legal_update';
  title: string;
  message: string;
  recipientType: 'customer' | 'staff' | 'admin' | 'all';
  recipientIds: string[]; // User IDs or Customer IDs
  relatedWaiverId?: string;
  relatedBookingId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaiverWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: 'booking_created' | 'tour_approaching' | 'manual' | 'custom';
  conditions: {
    tourTypes?: string[];
    ageGroups?: string[];
    countries?: string[];
    customRules?: string; // JSON string of custom conditions
  };
  actions: {
    sendWaiver: boolean;
    waiverId: string;
    sendReminder: boolean;
    reminderDays: number[];
    requireSignature: boolean;
    allowDigitalSignature: boolean;
    requireWitness: boolean;
    notifyStaff: boolean;
    staffNotificationTemplate?: string;
  };
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface WaiverTranslation {
  id: string;
  waiverId: string;
  language: string;
  translatedContent: string;
  translatedTitle: string;
  translatedDescription: string;
  translatedFields: {
    fieldId: string;
    translatedLabel: string;
    translatedPlaceholder?: string;
  }[];
  translationStatus: 'draft' | 'review' | 'approved' | 'published';
  translatedBy: string; // User ID
  reviewedBy?: string; // User ID
  approvedBy?: string; // User ID
  translationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaiverAuditLog {
  id: string;
  waiverId: string;
  action: 'created' | 'updated' | 'signed' | 'expired' | 'cancelled' | 'deleted';
  performedBy: string; // User ID or 'system'
  performedAt: string;
  details: {
    field?: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}


