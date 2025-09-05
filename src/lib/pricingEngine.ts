import { featureFlags } from '../config/features';
import type { PricingConfig, PriceInput, PriceBreakdown, SeasonRule, PaxBreakdown, PaxCategory } from '../types/pricing';

const isWeekend = (d: Date) => {
  const day = d.getDay();
  return day === 0 || day === 6;
};

const inRange = (date: Date, start: string, end: string) => {
  const d = date.getTime();
  const s = new Date(start + 'T00:00:00Z').getTime();
  const e = new Date(end + 'T23:59:59Z').getTime();
  return d >= s && d <= e;
};

export const findSeason = (cfg: PricingConfig, date: Date): SeasonRule | undefined => {
  for (const s of cfg.seasons) {
    if (!inRange(date, s.startDate, s.endDate)) continue;
    if (s.weekdayOnly && isWeekend(date)) continue;
    if (s.weekendOnly && !isWeekend(date)) continue;
    return s;
  }
  return undefined;
};

export const computePrice = (cfg: PricingConfig, input: PriceInput, currentDate?: Date): PriceBreakdown => {
  const currency = cfg.baseCurrency;
  const date = new Date(input.tourDateISO);
  const now = currentDate || new Date();
  const season = featureFlags.FEATURE_PRICING_SEASONS ? findSeason(cfg, date) : undefined;

  // Always use a season for pricing - either found or fallback
  const pricingSeason = season || cfg.seasons[0];
  
  if (!pricingSeason) {
    // Ultimate fallback with default pricing
    const adultCount = input.pax.adult || 0;
    const childCount = input.pax.child || 0;
    const subtotal = adultCount * 100 + childCount * 70; // Default prices
    const taxes = subtotal * 0.1; // 10% default tax
    const total = subtotal + taxes;
    return { subtotal, modifiersApplied: [], taxes, total, currency };
  }

  // If seasons disabled or not found, use fallback season pricing
  if (!season) {
    const adultCount = input.pax.adult || 0;
    const childCount = input.pax.child || 0;
    
    const adultPrice = pricingSeason.paxTierPrices?.find(p => p.category === 'adult')?.unitPrice || 100;
    const childPrice = pricingSeason.paxTierPrices?.find(p => p.category === 'child')?.unitPrice || 70;
    const subtotal = (adultCount * adultPrice) + (childCount * childPrice);
    const taxes = pricingSeason.taxesPercent ? (subtotal * pricingSeason.taxesPercent) / 100 : 0;
    const total = subtotal + taxes;
    return { subtotal, modifiersApplied: [], taxes, total, currency };
  }

  if (input.isPrivate && season.privateTourPrice != null) {
    const base = season.privateTourPrice;
    const taxes = season.taxesPercent ? (base * season.taxesPercent) / 100 : 0;
    let total = base + taxes;
    const modifiersApplied: { label: string; amount: number }[] = [];
    if (featureFlags.FEATURE_PRICING_SEASONS && cfg.modifiers?.length) {
      for (const m of cfg.modifiers) {
        if (m.type === 'early-bird' && m.daysBefore != null) {
          const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= m.daysBefore) {
            const delta = (total * m.percentOff) / 100;
            total -= delta;
            modifiersApplied.push({ label: 'early-bird', amount: -delta });
          }
        }
        if (m.type === 'last-minute' && m.hoursBefore != null) {
          const diffHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
          if (diffHours <= m.hoursBefore) {
            const delta = (total * m.percentOff) / 100;
            total -= delta;
            modifiersApplied.push({ label: 'last-minute', amount: -delta });
          }
        }
      }
    }
    return { subtotal: base, modifiersApplied, taxes, total, currency, seasonId: season.id };
  }

  // Group pricing by pax category
  let subtotal = 0;
  const getPaxCount = (pax: PaxBreakdown, category: PaxCategory): number => {
    switch (category) {
      case 'adult':
        return pax.adult || 0;
      case 'child':
        return pax.child || 0;
      case 'infant':
        return pax.infant || 0;
      default:
        return 0;
    }
  };
  for (const tier of season.paxTierPrices) {
    const count = getPaxCount(input.pax, tier.category);
    if (count > 0) subtotal += count * tier.unitPrice;
  }
  const taxes = season.taxesPercent ? (subtotal * season.taxesPercent) / 100 : 0;
  let total = subtotal + taxes;
  const modifiersApplied: { label: string; amount: number }[] = [];

  if (featureFlags.FEATURE_PRICING_SEASONS && cfg.modifiers?.length) {
    for (const m of cfg.modifiers) {
      if (m.type === 'early-bird' && m.daysBefore != null) {
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= m.daysBefore) {
          const delta = (total * m.percentOff) / 100;
          total -= delta;
          modifiersApplied.push({ label: 'early-bird', amount: -delta });
        }
      }
      if (m.type === 'last-minute' && m.hoursBefore != null) {
        const diffHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
        if (diffHours <= m.hoursBefore) {
          const delta = (total * m.percentOff) / 100;
          total -= delta;
          modifiersApplied.push({ label: 'last-minute', amount: -delta });
        }
      }
    }
  }

  // Round only at the end for consistency
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const roundedTaxes = Math.round(taxes * 100) / 100;
  const roundedTotal = Math.round(total * 100) / 100;

  return { 
    subtotal: roundedSubtotal, 
    modifiersApplied, 
    taxes: roundedTaxes, 
    total: roundedTotal, 
    currency, 
    seasonId: season.id 
  };
};


