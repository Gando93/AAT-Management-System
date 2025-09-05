export interface Promotion {
  id: string;
  name: string;
  description: string;
  code: string; // e.g., "SUMMER2024", "EARLYBIRD"
  type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_shipping' | 'custom';
  value: number; // Percentage (0-100) or fixed amount
  currency?: string; // For fixed amount discounts
  minOrderValue?: number; // Minimum order value to apply discount
  maxDiscountAmount?: number; // Maximum discount amount (for percentage)
  usageLimit?: number; // Total usage limit
  usageCount: number; // Current usage count
  perCustomerLimit?: number; // Usage limit per customer
  applicableTours: string[]; // Tour IDs
  applicableAddons: string[]; // Addon IDs
  customerSegments: CustomerSegment[]; // Target customer segments
  startDate: string; // ISO date
  endDate: string; // ISO date
  isActive: boolean;
  isPublic: boolean; // Whether customers can see and use this promotion
  priority: number; // Higher number = higher priority
  conditions: PromotionCondition[];
  exclusions: PromotionExclusion[];
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    minBookings?: number;
    maxBookings?: number;
    minSpent?: number;
    maxSpent?: number;
    registrationDate?: {
      from: string;
      to: string;
    };
    lastBookingDate?: {
      from: string;
      to: string;
    };
    countries?: string[];
    ageGroups?: ('adult' | 'child' | 'senior')[];
    tourTypes?: string[];
    tags?: string[];
  };
  customerCount: number; // Number of customers in this segment
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface PromotionCondition {
  id: string;
  type: 'booking_count' | 'total_spent' | 'tour_type' | 'date_range' | 'day_of_week' | 'time_of_day' | 'customer_age' | 'custom';
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any; // The value to compare against
  description: string;
  isRequired: boolean;
}

export interface PromotionExclusion {
  id: string;
  type: 'tour' | 'addon' | 'customer' | 'date_range' | 'promotion';
  value: string; // ID or value to exclude
  description: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  promotionId: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface PromotionUsage {
  id: string;
  promotionId: string;
  customerId: string;
  customerName: string;
  bookingId: string;
  tourId: string;
  tourName: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  currency: string;
  usedAt: string;
  ipAddress: string;
  userAgent: string;
  notes?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'banner' | 'popup' | 'social';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetAudience: {
    segments: string[]; // Customer segment IDs
    customCriteria?: any; // Custom targeting criteria
  };
  content: {
    subject?: string; // For email campaigns
    title: string;
    message: string;
    imageUrl?: string;
    buttonText?: string;
    buttonUrl?: string;
    templateId?: string;
  };
  promotionId?: string; // Associated promotion
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    timeOfDay?: string; // HH:MM format
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface PromotionAnalytics {
  id: string;
  promotionId: string;
  promotionName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalUses: number;
    uniqueCustomers: number;
    totalDiscount: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number; // Percentage
    redemptionRate: number; // Percentage
  };
  breakdown: {
    byTour: { tourId: string; tourName: string; uses: number; revenue: number }[];
    byCustomer: { customerId: string; customerName: string; uses: number; totalDiscount: number }[];
    byDate: { date: string; uses: number; revenue: number }[];
    byChannel: { channel: string; uses: number; revenue: number }[];
  };
  trends: {
    dailyUses: { date: string; count: number }[];
    weeklyRevenue: { week: string; amount: number }[];
    monthlyGrowth: { month: string; growth: number }[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface PromotionRule {
  id: string;
  name: string;
  description: string;
  trigger: 'booking_created' | 'payment_received' | 'tour_completed' | 'customer_registered' | 'custom';
  conditions: PromotionCondition[];
  actions: {
    createPromotion?: boolean;
    sendNotification?: boolean;
    applyDiscount?: boolean;
    addToSegment?: boolean;
    customAction?: string;
  };
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface PromotionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'seasonal' | 'loyalty' | 'referral' | 'birthday' | 'anniversary' | 'custom';
  template: {
    name: string;
    description: string;
    type: 'percentage' | 'fixed_amount' | 'buy_one_get_one';
    value: number;
    conditions: PromotionCondition[];
    exclusions: PromotionExclusion[];
  };
  isActive: boolean;
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface PromotionBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  promotionId?: string;
  position: 'top' | 'bottom' | 'sidebar' | 'popup' | 'floating';
  displayRules: {
    pages?: string[]; // Which pages to show on
    userTypes?: string[]; // Which user types to show to
    dateRange?: {
      start: string;
      end: string;
    };
    conditions?: PromotionCondition[];
  };
  isActive: boolean;
  priority: number;
  clickCount: number;
  impressionCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  referrerReward: {
    type: 'percentage' | 'fixed_amount' | 'free_tour';
    value: number;
    currency?: string;
  };
  refereeReward: {
    type: 'percentage' | 'fixed_amount' | 'free_tour';
    value: number;
    currency?: string;
  };
  conditions: {
    minBookingValue?: number;
    maxReferrals?: number;
    expirationDays?: number;
  };
  isActive: boolean;
  totalReferrals: number;
  totalRewards: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface Referral {
  id: string;
  referralProgramId: string;
  referrerId: string; // Customer ID who made the referral
  refereeId: string; // Customer ID who was referred
  bookingId: string; // Booking made by referee
  status: 'pending' | 'confirmed' | 'rewarded' | 'expired' | 'cancelled';
  referrerReward: number;
  refereeReward: number;
  currency: string;
  confirmedAt?: string;
  rewardedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  tiers: LoyaltyTier[];
  pointsPerDollar: number; // Points earned per dollar spent
  pointsPerBooking: number; // Points earned per booking
  redemptionRules: {
    minPoints: number;
    maxRedemptionPercentage: number; // Max % of order that can be paid with points
    pointValue: number; // Value of 1 point in currency
  };
  isActive: boolean;
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface LoyaltyTier {
  id: string;
  name: string;
  description: string;
  minPoints: number;
  maxPoints?: number;
  benefits: string[];
  multiplier: number; // Points multiplier for this tier
  color: string; // Hex color for UI
  icon?: string; // Icon name or URL
}

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  loyaltyProgramId: string;
  currentTier: string; // Tier ID
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  joinedAt: string;
  lastActivityAt: string;
  status: 'active' | 'suspended' | 'cancelled';
}

export interface LoyaltyTransaction {
  id: string;
  loyaltyAccountId: string;
  customerId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number; // Positive for earned, negative for redeemed
  description: string;
  referenceId?: string; // Booking ID, promotion ID, etc.
  expiresAt?: string; // For earned points
  createdAt: string;
  createdBy: string; // User ID or 'system'
}


