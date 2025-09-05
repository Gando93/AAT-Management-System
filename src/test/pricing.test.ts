import { describe, it, expect, beforeEach, vi } from 'vitest';
import { computePrice } from '../lib/pricingEngine';
import type { PricingConfig, PriceInput } from '../types/pricing';

// Mock feature flags
vi.mock('../config/features', () => ({
  featureFlags: {
    FEATURE_PRICING_SEASONS: true,
  },
}));

describe('Pricing Engine', () => {
  let pricingConfig: PricingConfig;

  beforeEach(() => {
    pricingConfig = {
      baseCurrency: 'EUR',
      seasons: [
        {
          id: 'default',
          name: 'Standard',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          paxTierPrices: [
            { category: 'adult', unitPrice: 100 },
            { category: 'child', unitPrice: 70 },
          ],
          taxesPercent: 10,
        },
      ],
    };
  });

  describe('computePrice', () => {
    it('should include tour base price in total calculation', () => {
      const input: PriceInput = {
        tourDateISO: '2024-06-15T10:00:00Z',
        pax: { adult: 2, child: 1 },
      };

      const result = computePrice(pricingConfig, input);

      // Adults: 2 * 100 = 200, Children: 1 * 70 = 70, Subtotal: 270
      // Taxes: 270 * 0.1 = 27, Total: 297
      expect(result.subtotal).toBe(270);
      expect(result.taxes).toBe(27);
      expect(result.total).toBe(297);
      expect(result.currency).toBe('EUR');
    });

    it('should handle different pax combinations correctly', () => {
      const input: PriceInput = {
        tourDateISO: '2024-06-15T10:00:00Z',
        pax: { adult: 4, child: 0 },
      };

      const result = computePrice(pricingConfig, input);

      // Adults: 4 * 100 = 400, Children: 0 * 70 = 0, Subtotal: 400
      // Taxes: 400 * 0.1 = 40, Total: 440
      expect(result.subtotal).toBe(400);
      expect(result.taxes).toBe(40);
      expect(result.total).toBe(440);
    });

    it('should use fallback pricing when no season matches', () => {
      const input: PriceInput = {
        tourDateISO: '2025-06-15T10:00:00Z', // Future date, no season match
        pax: { adult: 2, child: 1 },
      };

      const result = computePrice(pricingConfig, input);

      // Should use first season as fallback
      expect(result.subtotal).toBe(270);
      expect(result.taxes).toBe(27);
      expect(result.total).toBe(297);
    });

    it('should handle zero pax correctly', () => {
      const input: PriceInput = {
        tourDateISO: '2024-06-15T10:00:00Z',
        pax: { adult: 0, child: 0 },
      };

      const result = computePrice(pricingConfig, input);

      expect(result.subtotal).toBe(0);
      expect(result.taxes).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should round totals consistently', () => {
      const configWithDecimalTaxes: PricingConfig = {
        ...pricingConfig,
        seasons: [
          {
            ...pricingConfig.seasons[0],
            taxesPercent: 8.5, // Decimal tax rate
          },
        ],
      };

      const input: PriceInput = {
        tourDateISO: '2024-06-15T10:00:00Z',
        pax: { adult: 3, child: 2 },
      };

      const result = computePrice(configWithDecimalTaxes, input);

      // Adults: 3 * 100 = 300, Children: 2 * 70 = 140, Subtotal: 440
      // Taxes: 440 * 0.085 = 37.4, Total: 477.4
      expect(result.subtotal).toBe(440);
      expect(result.taxes).toBeCloseTo(37.4, 1);
      expect(result.total).toBeCloseTo(477.4, 1);
    });
  });
});


