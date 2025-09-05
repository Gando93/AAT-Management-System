export interface Addon {
  id: string;
  name: string;
  description: string;
  category: 'equipment' | 'service' | 'food' | 'transport' | 'accommodation' | 'other';
  basePrice: number;
  currency: string;
  pricingType: 'per_person' | 'per_booking' | 'per_hour' | 'fixed';
  isActive: boolean;
  requiresQuantity: boolean;
  maxQuantity?: number;
  minQuantity?: number;
  availabilityRules?: {
    tourIds?: string[];
    seasonRestrictions?: string[];
    dayOfWeekRestrictions?: number[]; // 0-6 (Sunday-Saturday)
    timeRestrictions?: {
      start: string; // HH:MM format
      end: string;   // HH:MM format
    }[];
  };
  dependencies?: string[]; // Other addon IDs that must be selected
  conflicts?: string[];    // Other addon IDs that cannot be selected together
  createdAt: string;
  updatedAt: string;
}

export interface BookingAddon {
  id: string;
  bookingId: string;
  addonId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export interface AddonCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AddonPricingRule {
  id: string;
  addonId: string;
  name: string;
  conditions: {
    minQuantity?: number;
    maxQuantity?: number;
    tourIds?: string[];
    seasonIds?: string[];
    dayOfWeek?: number[];
    timeRange?: {
      start: string;
      end: string;
    };
  };
  pricing: {
    type: 'percentage' | 'fixed_amount' | 'tiered';
    value: number;
    tiers?: Array<{
      minQuantity: number;
      maxQuantity?: number;
      discount: number;
    }>;
  };
  isActive: boolean;
  validFrom: string;
  validTo?: string;
}


