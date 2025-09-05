export type PaxCategory = 'adult' | 'child' | 'infant';

export interface PaxBreakdown {
  adult: number;
  child?: number;
  infant?: number;
}

export interface PaxTierPrice {
  category: PaxCategory;
  unitPrice: number; // price per pax for this category
}

export interface SeasonRule {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  weekdayOnly?: boolean;
  weekendOnly?: boolean;
  paxTierPrices: PaxTierPrice[]; // per-pax pricing by category
  privateTourPrice?: number; // if private, override with fixed price
  taxesPercent?: number; // e.g., 15 => 15%
}

export interface TimeWindowModifier {
  type: 'early-bird' | 'last-minute';
  percentOff: number; // 10 => 10% off, negative for surcharge
  daysBefore?: number; // early-bird threshold
  hoursBefore?: number; // last-minute threshold
}

export interface PricingConfig {
  baseCurrency: string; // e.g., 'EUR'
  seasons: SeasonRule[];
  modifiers?: TimeWindowModifier[];
}

export interface PriceInput {
  tourDateISO: string; // ISO datetime
  pax: PaxBreakdown;
  isPrivate?: boolean;
}

export interface PriceBreakdown {
  subtotal: number;
  modifiersApplied: { label: string; amount: number }[];
  taxes: number;
  total: number;
  currency: string;
  seasonId?: string;
}




