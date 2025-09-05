// Feature flags configuration
// All features are disabled by default for production safety
import React from 'react';

export interface FeatureFlags {
  FEATURE_GUIDES: boolean;
  FEATURE_RESOURCE_AVAILABILITY: boolean;
  FEATURE_PRICING_SEASONS: boolean;
  FEATURE_ADDONS: boolean;
  FEATURE_POLICIES_DEPOSITS: boolean;
  FEATURE_COMMS: boolean;
  FEATURE_MANIFESTS: boolean;
  FEATURE_QR_CHECKIN: boolean;
  FEATURE_WAIVERS: boolean;
  FEATURE_PROMOS: boolean;
  FEATURE_AGENTS: boolean;
  FEATURE_REPORTS: boolean;
  FEATURE_INTEGRATIONS: boolean;
  FEATURE_MAINTENANCE: boolean;
  FEATURE_CHECKLISTS: boolean;
  FEATURE_INVENTORY: boolean;
  FEATURE_AUDIT: boolean;
  FEATURE_WEBHOOKS: boolean;
  FEATURE_ADVANCED_REPORTS: boolean;
}

// Default feature flags - all disabled for production safety
const defaultFlags: FeatureFlags = {
  FEATURE_GUIDES: false,
  FEATURE_RESOURCE_AVAILABILITY: false,
  FEATURE_PRICING_SEASONS: false,
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
  FEATURE_ADVANCED_REPORTS: false,
};

// Environment-based overrides
const getEnvironmentFlags = (): Partial<FeatureFlags> => {
  const env = process.env.NODE_ENV;
  // Vite compatibility
  const viteMode = typeof import.meta !== 'undefined' ? (import.meta as any).env?.MODE : undefined;
  const isDevVite = viteMode === 'development' || (import.meta as any).env?.DEV;
  const isStaging = process.env.VERCEL_ENV === 'preview' || (typeof window !== 'undefined' && /-vercel\.app$|vercel\.app$/.test(window.location.hostname));
  const isDevelopment = env === 'development' || isDevVite;
  const isProduction = process.env.VERCEL_ENV === 'production' || (!isDevelopment && !isStaging);
  const isTest = env === 'test' || process.env.VITEST === 'true' || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITEST);
  
  // Skip environment overrides in test environment
  if (isTest) {
    return {};
  }
  
  // Environment-specific feature enablement
  if (isDevelopment || isStaging) {
    // Development/Staging: Enable all features for testing
    return {
      FEATURE_GUIDES: true,
      FEATURE_RESOURCE_AVAILABILITY: true,
      FEATURE_PRICING_SEASONS: true,
      FEATURE_ADDONS: true,
      FEATURE_POLICIES_DEPOSITS: true,
      FEATURE_COMMS: true,
      FEATURE_MANIFESTS: true,
      FEATURE_QR_CHECKIN: true,
      FEATURE_WAIVERS: true,
      FEATURE_PROMOS: true,
      FEATURE_AGENTS: true,
      FEATURE_REPORTS: true,
      FEATURE_INTEGRATIONS: true,
      FEATURE_MAINTENANCE: false,
      FEATURE_CHECKLISTS: false,
      FEATURE_INVENTORY: false,
      FEATURE_AUDIT: false,
      FEATURE_WEBHOOKS: false,
    };
  }
  
  if (isProduction) {
    // Production: Only enable core features, hide advanced modules
    return {
      FEATURE_GUIDES: true,
      FEATURE_RESOURCE_AVAILABILITY: true,
      FEATURE_PRICING_SEASONS: true,
      FEATURE_MANIFESTS: true,
      FEATURE_QR_CHECKIN: true,
      FEATURE_REPORTS: true,
      // Advanced modules hidden by default in production
      FEATURE_ADDONS: false,
      FEATURE_POLICIES_DEPOSITS: false,
      FEATURE_COMMS: false,
      FEATURE_WAIVERS: false,
      FEATURE_PROMOS: false,
      FEATURE_AGENTS: false,
      FEATURE_INTEGRATIONS: false,
      FEATURE_MAINTENANCE: false,
      FEATURE_CHECKLISTS: false,
      FEATURE_INVENTORY: false,
      FEATURE_AUDIT: false,
      FEATURE_WEBHOOKS: false,
    };
  }
  
  return {};
};

// Runtime feature flag overrides from localStorage (for testing)
const getRuntimeFlags = (): Partial<FeatureFlags> => {
  try {
    // URL param quick-toggle: ?flags=all or ?flags=reset
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const flagsParam = params.get('flags');
      if (flagsParam === 'reset') {
        localStorage.removeItem('featureFlags');
      }
      if (flagsParam === 'all') {
        const allTrue: Partial<FeatureFlags> = {
          FEATURE_GUIDES: true,
          FEATURE_RESOURCE_AVAILABILITY: true,
          FEATURE_PRICING_SEASONS: true,
          FEATURE_ADDONS: true,
          FEATURE_POLICIES_DEPOSITS: true,
          FEATURE_COMMS: true,
          FEATURE_MANIFESTS: true,
          FEATURE_QR_CHECKIN: true,
          FEATURE_WAIVERS: true,
          FEATURE_PROMOS: true,
          FEATURE_AGENTS: true,
          FEATURE_REPORTS: true,
          FEATURE_INTEGRATIONS: true,
          FEATURE_MAINTENANCE: true,
          FEATURE_CHECKLISTS: true,
          FEATURE_INVENTORY: true,
          FEATURE_AUDIT: true,
          FEATURE_WEBHOOKS: true,
        };
        localStorage.setItem('featureFlags', JSON.stringify(allTrue));
      }
    }
    const stored = localStorage.getItem('featureFlags');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to parse feature flags from localStorage:', error);
  }
  return {};
};

// Merge all flag sources
export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...getEnvironmentFlags(),
  ...getRuntimeFlags(),
};

// Feature flag hook for components
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag];
};

// Feature flags hook with update capability
export const useFeatureFlags = () => {
  const [flags, setFlags] = React.useState<FeatureFlags>(() => {
    // Initialize with current feature flags
    return {
      ...defaultFlags,
      ...getEnvironmentFlags(),
      ...getRuntimeFlags(),
    };
  });

  const updateFeatureFlag = (flag: keyof FeatureFlags, value: boolean) => {
    const newFlags = { ...flags, [flag]: value };
    setFlags(newFlags);
    
    // Update localStorage
    try {
      const currentRuntimeFlags = getRuntimeFlags();
      const updatedRuntimeFlags = { ...currentRuntimeFlags, [flag]: value };
      localStorage.setItem('featureFlags', JSON.stringify(updatedRuntimeFlags));
      
      // Force a page reload to update the global featureFlags
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.warn('Failed to save feature flag to localStorage:', error);
    }
  };

  return { featureFlags: flags, updateFeatureFlag };
};

// Feature flag checker utility
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag];
};

// Development helper to toggle features
export const toggleFeatureFlag = (flag: keyof FeatureFlags, enabled: boolean): void => {
  if (process.env.NODE_ENV === 'development') {
    const currentFlags = getRuntimeFlags();
    const newFlags = { ...currentFlags, [flag]: enabled };
    try {
      localStorage.setItem('featureFlags', JSON.stringify(newFlags));
    } catch {
      // ignore storage errors in restricted environments
    }
    // Reload to apply changes (skip in test/jsdom or if not supported)
    try {
      if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
        window.location.reload();
      }
    } catch {
      // jsdom does not implement navigation; ignore during tests
    }
  }
};

// Feature flag debug panel (development only)
export const getFeatureFlagsDebugInfo = () => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return {
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    flags: featureFlags,
    enabledFlags: Object.entries(featureFlags)
      .filter(([_, enabled]) => enabled)
      .map(([flag, _]) => flag),
  };
};
