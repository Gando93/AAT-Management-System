export type AgentType = 'individual' | 'company' | 'reseller' | 'affiliate';
export type AgentStatus = 'active' | 'inactive' | 'suspended' | 'pending_approval';
export type CommissionType = 'percentage' | 'fixed_amount' | 'tiered' | 'performance_based';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';
export type TerritoryType = 'geographic' | 'product_based' | 'customer_based' | 'hybrid';
export type LeadSource = 'website' | 'referral' | 'cold_call' | 'social_media' | 'event' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'closed_won' | 'closed_lost';
export type PerformanceMetric = 'bookings' | 'revenue' | 'conversion_rate' | 'customer_satisfaction' | 'retention_rate';

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: AgentType;
  status: AgentStatus;
  territory: Territory;
  commissionStructure: CommissionStructure;
  contactInfo: ContactInfo;
  bankDetails?: BankDetails;
  taxInfo: TaxInfo;
  performance: AgentPerformance;
  settings: AgentSettings;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  createdBy: string; // User ID
}

export interface Territory {
  id: string;
  name: string;
  type: TerritoryType;
  description?: string;
  boundaries: TerritoryBoundary[];
  products: string[]; // Product/Tour IDs
  customers: string[]; // Customer IDs
  isActive: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface TerritoryBoundary {
  type: 'country' | 'state' | 'city' | 'postal_code' | 'custom';
  value: string;
  coordinates?: {
    lat: number;
    lng: number;
    radius?: number; // For circular boundaries
  };
}

export interface CommissionStructure {
  id: string;
  name: string;
  type: CommissionType;
  baseRate: number; // Percentage or fixed amount
  tiers: CommissionTier[];
  bonuses: CommissionBonus[];
  deductions: CommissionDeduction[];
  isActive: boolean;
  validFrom: string; // ISO string
  validUntil?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CommissionTier {
  id: string;
  name: string;
  minValue: number; // Minimum booking value or revenue
  maxValue?: number; // Maximum booking value or revenue
  rate: number; // Commission rate for this tier
  description?: string;
}

export interface CommissionBonus {
  id: string;
  name: string;
  type: 'volume' | 'performance' | 'seasonal' | 'special';
  condition: { [key: string]: any }; // e.g., { minBookings: 10, period: 'month' }
  amount: number; // Bonus amount
  description?: string;
  isActive: boolean;
}

export interface CommissionDeduction {
  id: string;
  name: string;
  type: 'fee' | 'penalty' | 'adjustment';
  amount: number; // Deduction amount
  reason: string;
  isActive: boolean;
}

export interface ContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    platform: string;
    handle: string;
  }[];
}

export interface BankDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  currency: string;
  isVerified: boolean;
  verifiedAt?: string; // ISO string
}

export interface TaxInfo {
  taxId: string;
  taxType: 'individual' | 'business';
  country: string;
  state?: string;
  isVerified: boolean;
  verifiedAt?: string; // ISO string
}

export interface AgentPerformance {
  id: string;
  agentId: string;
  period: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  };
  metrics: {
    totalBookings: number;
    totalRevenue: number;
    totalCommission: number;
    conversionRate: number; // Percentage
    averageBookingValue: number;
    customerSatisfaction: number; // 1-5 scale
    retentionRate: number; // Percentage
  };
  rankings: {
    bookings: number;
    revenue: number;
    conversion: number;
    overall: number;
  };
  goals: {
    bookings: number;
    revenue: number;
    conversion: number;
    satisfaction: number;
  };
  achievements: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface AgentSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
    commissionAlert: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'bookings' | 'commissions' | 'leads';
    theme: 'light' | 'dark';
    language: string;
  };
  privacy: {
    showContactInfo: boolean;
    showPerformance: boolean;
    showTerritory: boolean;
  };
}

export interface Lead {
  id: string;
  agentId: string;
  customerId?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description?: string;
  value: number; // Estimated booking value
  currency: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  notes: LeadNote[];
  tags: string[];
  assignedAt: string; // ISO string
  lastContactAt?: string; // ISO string
  expectedCloseDate?: string; // ISO string
  actualCloseDate?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface LeadNote {
  id: string;
  content: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'other';
  createdAt: string; // ISO string
  createdBy: string; // User ID
}

export interface Commission {
  id: string;
  agentId: string;
  bookingId: string;
  bookingValue: number;
  currency: string;
  baseRate: number;
  tierRate?: number;
  bonusAmount: number;
  deductionAmount: number;
  netCommission: number;
  status: PaymentStatus;
  paidAt?: string; // ISO string
  paymentMethod?: string;
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CommissionPayment {
  id: string;
  agentId: string;
  period: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  };
  totalCommission: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string; // ISO string
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface AgentReport {
  id: string;
  agentId: string;
  reportType: 'performance' | 'commission' | 'territory' | 'leads' | 'custom';
  period: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  };
  data: { [key: string]: any }; // Report-specific data
  generatedAt: string; // ISO string
  generatedBy: string; // User ID
  isScheduled: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface AgentPortal {
  id: string;
  agentId: string;
  url: string;
  isActive: boolean;
  features: {
    dashboard: boolean;
    bookings: boolean;
    commissions: boolean;
    leads: boolean;
    reports: boolean;
    settings: boolean;
  };
  customizations: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
    branding?: string;
  };
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface AgentTraining {
  id: string;
  agentId: string;
  title: string;
  description?: string;
  type: 'product' | 'sales' | 'compliance' | 'soft_skills' | 'technical';
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: number; // Percentage
  modules: TrainingModule[];
  completedAt?: string; // ISO string
  expiresAt?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface TrainingModule {
  id: string;
  title: string;
  content: string; // HTML content
  type: 'text' | 'video' | 'quiz' | 'interactive';
  duration: number; // Minutes
  isRequired: boolean;
  order: number;
  completedAt?: string; // ISO string
}

export interface AgentAuditLog {
  id: string;
  agentId: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'commission_paid' | 'lead_assigned' | 'training_completed';
  details: { [key: string]: any };
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string; // ISO string
}


