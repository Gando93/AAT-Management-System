export interface Guide {
  id: string;
  name: string;
  email: string;
  phone: string;
  languages: string[];
  skills: string[];
  certifications: GuideCertification[];
  maxDailyHours: number;
  status: 'active' | 'inactive' | 'on-leave';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  address: string;
  dateOfBirth: string;
  hireDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuideCertification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'expiring-soon';
  documentUrl?: string;
}

export interface GuideAvailability {
  guideId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string; // 'assigned', 'on-leave', 'maintenance', etc.
}

export interface GuideAssignment {
  id: string;
  guideId: string;
  bookingId: string;
  tourId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'assigned' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuideConflict {
  guideId: string;
  conflictingAssignment: GuideAssignment;
  conflictType: 'overlap' | 'exceeds-hours' | 'unavailable';
  message: string;
}

// Guide filter options for auto-assignment
export interface GuideFilter {
  languages?: string[];
  skills?: string[];
  maxDailyHours?: number;
  excludeGuideIds?: string[];
  requiredCertifications?: string[];
}

