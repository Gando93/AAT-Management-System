import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock process.env
const originalEnv = process.env;

describe('Feature Flags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should have all features disabled by default', async () => {
    process.env.NODE_ENV = 'test';
    process.env.VITEST = 'true';
    vi.resetModules();
    const { featureFlags } = await import('../config/features');
    expect(featureFlags.FEATURE_GUIDES).toBe(false);
    expect(featureFlags.FEATURE_RESOURCE_AVAILABILITY).toBe(false);
    expect(featureFlags.FEATURE_PRICING_SEASONS).toBe(false);
    expect(featureFlags.FEATURE_ADDONS).toBe(false);
    expect(featureFlags.FEATURE_POLICIES_DEPOSITS).toBe(false);
    expect(featureFlags.FEATURE_COMMS).toBe(false);
    expect(featureFlags.FEATURE_MANIFESTS).toBe(false);
    expect(featureFlags.FEATURE_QR_CHECKIN).toBe(false);
    expect(featureFlags.FEATURE_WAIVERS).toBe(false);
    expect(featureFlags.FEATURE_PROMOS).toBe(false);
    expect(featureFlags.FEATURE_AGENTS).toBe(false);
    expect(featureFlags.FEATURE_REPORTS).toBe(false);
    expect(featureFlags.FEATURE_INTEGRATIONS).toBe(false);
    expect(featureFlags.FEATURE_MAINTENANCE).toBe(false);
    expect(featureFlags.FEATURE_CHECKLISTS).toBe(false);
    expect(featureFlags.FEATURE_INVENTORY).toBe(false);
    expect(featureFlags.FEATURE_AUDIT).toBe(false);
    expect(featureFlags.FEATURE_WEBHOOKS).toBe(false);
  });

  it('should enable features in development environment', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.VITEST;
    vi.resetModules();
    const { featureFlags: devFlags } = await import('../config/features');
    expect(devFlags.FEATURE_GUIDES).toBe(true);
    expect(devFlags.FEATURE_RESOURCE_AVAILABILITY).toBe(true);
    expect(devFlags.FEATURE_PRICING_SEASONS).toBe(true);
  });

  it('should enable features in staging environment', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'preview';
    delete process.env.VITEST;
    vi.resetModules();
    const { featureFlags: stagingFlags } = await import('../config/features');
    expect(stagingFlags.FEATURE_GUIDES).toBe(true);
    expect(stagingFlags.FEATURE_RESOURCE_AVAILABILITY).toBe(true);
  });

  it('should read feature flags from localStorage', async () => {
    process.env.NODE_ENV = 'test';
    process.env.VITEST = 'true';
    const mockFlags = {
      FEATURE_GUIDES: true,
      FEATURE_ADDONS: true,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlags));
    vi.resetModules();
    const { featureFlags: runtimeFlags } = await import('../config/features');
    expect(runtimeFlags.FEATURE_GUIDES).toBe(true);
    expect(runtimeFlags.FEATURE_ADDONS).toBe(true);
    expect(runtimeFlags.FEATURE_PRICING_SEASONS).toBe(false);
  });

  it('should handle invalid localStorage data gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    vi.resetModules();
    await expect(import('../config/features')).resolves.toBeTruthy();
  });

  it('should provide utility functions', async () => {
    vi.resetModules();
    const { isFeatureEnabled, useFeatureFlag, toggleFeatureFlag } = await import('../config/features');
    expect(typeof isFeatureEnabled).toBe('function');
    expect(typeof useFeatureFlag).toBe('function');
    expect(typeof toggleFeatureFlag).toBe('function');
  });

  it('should toggle feature flags in development', async () => {
    process.env.NODE_ENV = 'development';
    vi.resetModules();
    const { toggleFeatureFlag } = await import('../config/features');
    toggleFeatureFlag('FEATURE_GUIDES', true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'featureFlags',
      JSON.stringify({ FEATURE_GUIDES: true })
    );
  });

  it('should not toggle feature flags in production', async () => {
    process.env.NODE_ENV = 'production';
    vi.resetModules();
    const { toggleFeatureFlag } = await import('../config/features');
    toggleFeatureFlag('FEATURE_GUIDES', true);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
});
