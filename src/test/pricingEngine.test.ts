import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the feature flags module
vi.mock('../config/features', () => ({
  featureFlags: {
    FEATURE_PRICING_SEASONS: true,
    FEATURE_RESOURCE_AVAILABILITY: false,
    FEATURE_GUIDES: false,
    FEATURE_ADDONS: false,
    FEATURE_POLICIES_DEPOSITS: false,
    FEATURE_COMMS: false,
    FEATURE_MANIFESTS: false,
    FEATURE_QR_CHECKIN: false,
    FEATURE_WAIVERS: false,
    FEATURE_PROMOS: false,
    FEATURE_AGENTS: false,
    FEATURE_REPORTS: false,
    FEATURE_INTEGRATIONS: false,
    FEATURE_MAINTENANCE: false,
    FEATURE_CHECKLISTS: false,
    FEATURE_INVENTORY: false,
    FEATURE_AUDIT: false,
    FEATURE_WEBHOOKS: false,
  },
  isFeatureEnabled: vi.fn((flag) => flag === 'FEATURE_PRICING_SEASONS'),
  useFeatureFlag: vi.fn(),
  toggleFeatureFlag: vi.fn(),
}));

describe('Pricing Engine', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NODE_ENV = 'test';
    process.env.VITEST = 'true';
  });

  it('computes season pax tier pricing', async () => {
    const { computePrice } = await import('../lib/pricingEngine');
    const cfg = {
      baseCurrency: 'EUR',
      seasons: [
        {
          id: 'S1',
          name: 'High Season',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          paxTierPrices: [
            { category: 'adult', unitPrice: 100 },
            { category: 'child', unitPrice: 60 },
          ],
          taxesPercent: 10,
        },
      ],
    } as const;
    const price = computePrice(cfg as unknown as import('../types/pricing').PricingConfig, {
      tourDateISO: '2024-06-01T10:00:00Z',
      pax: { adult: 2, child: 1 },
    }, new Date('2024-05-01T00:00:00Z'));
    // subtotal = 2*100 + 1*60 = 260; taxes 10% = 26; total = 286
    expect(price.subtotal).toBe(260);
    expect(Math.round(price.taxes)).toBe(26);
    expect(Math.round(price.total)).toBe(286);
  });

  it('applies private tour price when set', async () => {
    const { computePrice } = await import('../lib/pricingEngine');
    const cfg = {
      baseCurrency: 'EUR',
      seasons: [
        {
          id: 'S2',
          name: 'Private',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          paxTierPrices: [ { category: 'adult', unitPrice: 100 } ],
          privateTourPrice: 500,
          taxesPercent: 5,
        },
      ],
    } as const;
    const price = computePrice(cfg as unknown as import('../types/pricing').PricingConfig, {
      tourDateISO: '2024-07-01T10:00:00Z',
      pax: { adult: 4 },
      isPrivate: true,
    }, new Date('2024-06-01T00:00:00Z'));
    expect(price.subtotal).toBe(500);
    expect(Math.round(price.taxes)).toBe(25);
    expect(Math.round(price.total)).toBe(525);
  });
});


